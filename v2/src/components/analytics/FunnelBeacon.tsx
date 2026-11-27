"use client";

import { useEffect } from "react";
import { trackFunnel } from "@/lib/client/funnel";
import { KARROT_PRODUCT, trackKarrot } from "@/lib/client/karrotPixel";
import { trackMetaInitiateCheckout } from "@/lib/client/metaPixel";
import { PRODUCT_DOHWA, type ProductId } from "@/lib/constants/newyear";
import type { FunnelStep } from "@/lib/funnelSteps";

/** 서버 페이지에 심어 마운트 시 한 번 퍼널 단계를 기록한다. */
export function FunnelBeacon({
  step,
  token,
  product = PRODUCT_DOHWA,
  trackPixels = true,
}: {
  step: FunnelStep;
  token?: string | null;
  product?: ProductId;
  /** 도화 카카오/메타 픽셀. FateNavi는 false. */
  trackPixels?: boolean;
}) {
  useEffect(() => {
    trackFunnel(step, token, product);
    if (!trackPixels) return;
    if (step === "result") trackKarrot("ViewContent", { id: KARROT_PRODUCT.id });
    if (step === "checkout") {
      trackKarrot("Lead");
      trackKarrot("AddToCart", {
        products: [
          {
            id: KARROT_PRODUCT.id,
            name: KARROT_PRODUCT.name,
            quantity: "1",
            price: KARROT_PRODUCT.price,
          },
        ],
      });
      trackMetaInitiateCheckout();
    }
  }, [step, token, product, trackPixels]);
  return null;
}
