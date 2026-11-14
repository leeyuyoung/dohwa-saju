import { z } from "zod";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { isSameOrigin, jsonError as fail, readJsonBody } from "@/lib/server/http";
import { ORDER_NAME, PaymentError, createPayappOrder, isPayappConfigured } from "@/lib/server/payments";
import { clientIp, consumeRateLimit } from "@/lib/server/rateLimit";
import type { OrderMetaClick } from "@/lib/server/store";
import { checkoutContactSchema } from "@/lib/validation/analysisInput";

const IP_LIMIT = { limit: 20, windowMs: 60 * 60 * 1000 };
const bodySchema = checkoutContactSchema.extend({
  token: z.string().regex(TOKEN_PATTERN),
  /** 이탈 2단 비밀쿠폰. 금액은 서버가 정한다. */
  couponApplied: z.boolean().optional().default(false),
});

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    const value = trimmed.slice(name.length + 1).trim();
    return value || undefined;
  }
  return undefined;
}

function metaClickFromRequest(request: Request): OrderMetaClick | null {
  const cookie = request.headers.get("cookie");
  const fbp = readCookie(cookie, "_fbp");
  const fbc = readCookie(cookie, "_fbc");
  const ip = clientIp(request);
  const userAgent = request.headers.get("user-agent")?.slice(0, 512) || undefined;
  const click: OrderMetaClick = {};
  if (fbp) click.fbp = fbp.slice(0, 200);
  if (fbc) click.fbc = fbc.slice(0, 200);
  if (ip && ip !== "local") click.clientIp = ip;
  if (userAgent) click.userAgent = userAgent;
  return Object.keys(click).length > 0 ? click : null;
}

/** 주문을 만들고 페이앱 결제 URL을 돌려준다. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, "허용되지 않은 요청입니다.");
  if (!isPayappConfigured()) return fail(503, "결제 준비가 아직 되지 않았습니다. 잠시 후 다시 시도해주세요.");

  const parsed = bodySchema.safeParse(await readJsonBody(request));
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "잘못된 요청입니다.");

  const retryAfter = consumeRateLimit(`order:ip:${clientIp(request)}`, IP_LIMIT);
  if (retryAfter !== null) return fail(429, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", { "Retry-After": String(retryAfter) });

  try {
    const { order, payurl } = await createPayappOrder(
      parsed.data.token,
      parsed.data.email,
      parsed.data.phone,
      parsed.data.marketingOptIn,
      parsed.data.couponApplied,
      metaClickFromRequest(request),
    );
    return Response.json(
      { orderId: order.orderId, amount: order.amount, orderName: ORDER_NAME, payurl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof PaymentError) return fail(error.status, error.userMessage);
    console.error("[payment] create order failed", error);
    return fail(500, "주문을 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}
