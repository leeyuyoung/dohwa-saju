import { DETAILED_REPORT_PRICE } from "@/lib/constants/service";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Meta Pixel 이벤트. head 베이스 코드가 먼저 로드돼 있어야 한다. */
export function trackMeta(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === "undefined") return;
  try {
    if (eventId) {
      window.fbq?.("track", event, params, { eventID: eventId });
      return;
    }
    window.fbq?.("track", event, params);
  } catch {
    // 광고 픽셀 실패가 서비스를 막으면 안 된다.
  }
}

/** 결제 페이지·시트 진입. */
export function trackMetaInitiateCheckout(value: number = DETAILED_REPORT_PRICE) {
  trackMeta("InitiateCheckout", { value, currency: "KRW" });
}

/**
 * 결제 완료.
 * eventId(주문번호)는 CAPI event_id와 같아야 Meta가 중복을 제거한다.
 */
export function trackMetaPurchase(value: number = DETAILED_REPORT_PRICE, eventId?: string) {
  trackMeta("Purchase", { value, currency: "KRW" }, eventId);
}
