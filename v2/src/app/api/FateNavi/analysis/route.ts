import { SajuCalculationError } from "@/lib/saju";
import { PRODUCT_NEWYEAR } from "@/lib/constants/newyear";
import { createAnalysis } from "@/lib/server/analysis";
import { isSameOrigin, jsonError as fail, readJsonBody } from "@/lib/server/http";
import { clientIp, consumeRateLimit } from "@/lib/server/rateLimit";
import { analysisInputSchema } from "@/lib/validation/analysisInput";

const IP_LIMIT = { limit: 20, windowMs: 60 * 60 * 1000 };

/** 신년 상품용 무료 결과. 만세력만 계산하고 AI는 호출하지 않는다. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, "허용되지 않은 요청입니다.");

  const json = await readJsonBody(request);
  const parsed = analysisInputSchema.safeParse(json);
  if (!parsed.success) return fail(400, "입력값을 다시 확인해주세요.");

  const retryAfter = consumeRateLimit(`newyear:ip:${clientIp(request)}`, IP_LIMIT);
  if (retryAfter !== null) {
    return fail(429, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", { "Retry-After": String(retryAfter) });
  }

  try {
    const record = await createAnalysis(parsed.data, PRODUCT_NEWYEAR);
    return Response.json({ token: record.token }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SajuCalculationError) {
      if (!error.isUserError) console.error(`[newyear] saju ${error.code}`, error.detail);
      return fail(error.isUserError ? 400 : 500, error.userMessage);
    }
    console.error("[newyear] unexpected", error);
    return fail(500, "분석을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}
