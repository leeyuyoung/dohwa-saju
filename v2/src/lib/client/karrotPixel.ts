import { DETAILED_REPORT_ORDER_NAME, DETAILED_REPORT_PRICE } from "@/lib/constants/service";

/** 당근 전문가모드 전환 추적 코드 ID */
export const KARROT_PIXEL_ID = "1793778655427101001";

export const KARROT_PRODUCT = {
  id: "dohwa-detailed-report",
  name: DETAILED_REPORT_ORDER_NAME,
  price: String(DETAILED_REPORT_PRICE),
} as const;

export type KarrotEvent =
  | "ViewPage"
  | "Login"
  | "CompleteRegistration"
  | "ViewContent"
  | "AddToCart"
  | "Purchase"
  | "Install"
  | "Lead"
  | "SubmitApplication";

type KarrotPixelApi = {
  init: (...args: unknown[]) => void;
  track: (event: KarrotEvent | string, params?: Record<string, unknown>) => void;
  stub?: boolean;
  queue?: unknown[];
};

declare global {
  interface Window {
    karrotPixel?: KarrotPixelApi;
  }
}

/** 당근 픽셀 이벤트. 스크립트 로드 전이면 stub queue에 쌓인다. */
export function trackKarrot(event: KarrotEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.karrotPixel?.track(event, params);
  } catch {
    // 광고 픽셀 실패가 서비스를 막으면 안 된다.
  }
}

/** 결제 완료 전환. ROAS용 금액·상품 정보를 함께 보낸다. */
export function trackKarrotPurchase() {
  trackKarrot("Purchase", {
    total_price: KARROT_PRODUCT.price,
    total_quantity: "1",
    products: [
      {
        id: KARROT_PRODUCT.id,
        name: KARROT_PRODUCT.name,
        quantity: "1",
        price: KARROT_PRODUCT.price,
      },
    ],
  });
}
