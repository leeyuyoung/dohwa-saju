import { PRODUCT_DOHWA, type ProductId } from "@/lib/constants/newyear";
import type { FunnelStep } from "@/lib/funnelSteps";

const SESSION_KEY_DOHWA = "dohwa-funnel-session";
const SESSION_KEY_NEWYEAR = "fatenavi-funnel-session";

function sessionKeyFor(product: ProductId) {
  return product === "newyear2027" ? SESSION_KEY_NEWYEAR : SESSION_KEY_DOHWA;
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** 익명 퍼널 세션. localStorage에만 두고 서버로 이름·생년월일은 보내지 않는다. */
export function getFunnelSessionId(product: ProductId = PRODUCT_DOHWA): string {
  const key = sessionKeyFor(product);
  try {
    const existing = window.localStorage.getItem(key);
    if (existing && existing.length >= 8 && existing.length <= 80) return existing;
    const created = randomId();
    window.localStorage.setItem(key, created);
    return created;
  } catch {
    return randomId();
  }
}

/**
 * 퍼널 단계 기록. sendBeacon 우선, 실패 시 fetch keepalive.
 * 개인정보는 넣지 않는다. token은 제출 이후만.
 */
export function trackFunnel(step: FunnelStep, token?: string | null, product: ProductId = PRODUCT_DOHWA) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      sessionId: getFunnelSessionId(product),
      step,
      token: token ?? null,
      product,
    });
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/funnel", blob)) return;
    void fetch("/api/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    });
  } catch {
    // 추적이 깨져도 사용자 흐름은 막지 않는다.
  }
}
