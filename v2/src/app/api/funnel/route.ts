import { isFunnelStep } from "@/lib/funnelSteps";
import { isSameOrigin, jsonError as fail, readJsonBody } from "@/lib/server/http";
import { clientIp, consumeRateLimit } from "@/lib/server/rateLimit";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { getAnalysisStore } from "@/lib/server/store";

const IP_LIMIT = { limit: 120, windowMs: 60 * 60 * 1000 };
const SESSION_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

/** sendBeacon은 Origin이 빠질 수 있어 Referer 호스트로도 같은 출처를 허용한다. */
function isAllowedFunnelRequest(request: Request) {
  if (isSameOrigin(request)) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const referer = request.headers.get("referer");
  if (!host || !referer) return false;
  try {
    return new URL(referer).host === host;
  } catch {
    return false;
  }
}

/** 익명 퍼널 이벤트. PII 없이 sessionId+step만 받는다. */
export async function POST(request: Request) {
  if (!isAllowedFunnelRequest(request)) return fail(403, "허용되지 않은 요청입니다.");

  const retryAfter = consumeRateLimit(`funnel:ip:${clientIp(request)}`, IP_LIMIT);
  if (retryAfter !== null) {
    return fail(429, "요청이 너무 많습니다.", { "Retry-After": String(retryAfter) });
  }

  const json = await readJsonBody(request);
  if (!json || typeof json !== "object") return fail(400, "잘못된 요청입니다.");
  const body = json as { sessionId?: unknown; step?: unknown; token?: unknown };

  if (typeof body.sessionId !== "string" || !SESSION_PATTERN.test(body.sessionId)) {
    return fail(400, "잘못된 요청입니다.");
  }
  if (!isFunnelStep(body.step)) return fail(400, "잘못된 요청입니다.");

  let token: string | null = null;
  if (body.token !== undefined && body.token !== null) {
    if (typeof body.token !== "string" || !TOKEN_PATTERN.test(body.token)) {
      return fail(400, "잘못된 요청입니다.");
    }
    token = body.token;
  }

  try {
    await getAnalysisStore().trackFunnelEvent({
      sessionId: body.sessionId,
      step: body.step,
      token,
      at: Date.now(),
    });
  } catch (error) {
    console.error("[funnel] track failed", error);
    // 클라이언트는 재시도하지 않아도 되므로 204로 끝낸다.
  }

  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
