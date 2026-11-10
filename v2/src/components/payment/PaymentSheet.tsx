"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CheckoutDealPrice } from "@/components/payment/CheckoutDealPrice";
import { CheckoutExitModal } from "@/components/payment/CheckoutExitModal";
import { CheckoutWidget } from "@/components/payment/CheckoutWidget";
import { trackFunnel } from "@/lib/client/funnel";
import { KARROT_PRODUCT, trackKarrot } from "@/lib/client/karrotPixel";
import { trackMetaInitiateCheckout } from "@/lib/client/metaPixel";
import {
  DETAILED_REPORT_LIST_PRICE,
  DETAILED_REPORT_MID_PRICE,
  DETAILED_REPORT_PRICE,
  formatWon,
} from "@/lib/constants/service";

type PaymentSheetProps = {
  open: boolean;
  onClose: () => void;
  token: string;
  title: string;
  buyerName: string;
};

const SLASH_STEPS = [DETAILED_REPORT_LIST_PRICE, DETAILED_REPORT_MID_PRICE, DETAILED_REPORT_PRICE] as const;
const SLASH_STEP_MS = 420;

/** 결제 CTA에서 아래에서 올라오는 시트. 할인·연락처·페이앱 결제를 담는다. */
export function PaymentSheet({ open, onClose, token, title, buyerName }: PaymentSheetProps) {
  const [slashIndex, setSlashIndex] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const displayPrice = SLASH_STEPS[slashIndex] ?? DETAILED_REPORT_PRICE;
  const showFinal = slashIndex >= 2;
  const saved = DETAILED_REPORT_LIST_PRICE - DETAILED_REPORT_PRICE;

  const requestClose = () => setExitOpen(true);
  const continueCheckout = () => setExitOpen(false);
  const leaveCheckout = () => {
    setExitOpen(false);
    onClose();
  };

  useEffect(() => {
    if (!open) {
      setSlashIndex(0);
      setExitOpen(false);
      return;
    }
    trackFunnel("checkout", token);
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
    trackMetaInitiateCheckout(DETAILED_REPORT_PRICE);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setSlashIndex(0);
    const t1 = window.setTimeout(() => setSlashIndex(1), SLASH_STEP_MS);
    const t2 = window.setTimeout(() => setSlashIndex(2), SLASH_STEP_MS * 2);

    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [open, token]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setExitOpen((prev) => !prev);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.button
              type="button"
              aria-label="결제 닫기"
              className="absolute inset-0 bg-ink/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={requestClose}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="결제"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="relative z-10 flex max-h-[78dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[1.6rem] border border-line/80 bg-night shadow-[0_-16px_48px_rgb(0_0_0_/_0.45)]"
            >
              <div className="relative z-20 flex shrink-0 items-center justify-end bg-night px-4 pb-2 pt-3">
                <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center" aria-hidden>
                  <span className="h-1 w-10 rounded-full bg-paper/25" />
                </div>
                <button
                  type="button"
                  onClick={requestClose}
                  className="relative z-10 rounded-md bg-night px-2 py-1 font-gothic text-sm tracking-[-0.01em] text-mist hover:text-paper"
                >
                  닫기
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1rem,env(safe-area-inset-bottom))] font-gothic">
                <p className="text-[15px] tracking-[-0.01em] text-paper">{buyerName}의 연애·매력 리포트 결제</p>
                <p className="mt-1.5 inline-flex rounded-full bg-[#e11d48]/15 px-3 py-0.5 text-[12px] tracking-[-0.01em] text-[#e11d48]">
                  총 {formatWon(saved)}원 할인받았어요!
                </p>

                <div className="mt-3 rounded-2xl border border-[#e11d48]/55 bg-ink/50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] tracking-[-0.01em] text-paper">{title}</p>
                      <p className="mt-0.5 text-[12px] tracking-[-0.01em] text-mist">상세 리포트 전체 열람</p>
                    </div>
                    <div className="min-w-[7.5rem] text-right" aria-live="polite">
                      {slashIndex >= 1 && (
                        <p className="text-[12px] tracking-[-0.01em] text-mist-dim line-through">
                          {formatWon(DETAILED_REPORT_LIST_PRICE)}원
                        </p>
                      )}
                      {showFinal && (
                        <p className="text-[12px] tracking-[-0.01em] text-mist-dim line-through">
                          {formatWon(DETAILED_REPORT_MID_PRICE)}원
                        </p>
                      )}
                      <motion.p
                        key={displayPrice}
                        initial={{ opacity: 0.35, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 420, damping: 22 }}
                        className={`text-[17px] tracking-[-0.01em] ${showFinal ? "text-gold-soft" : "text-paper"}`}
                      >
                        {formatWon(displayPrice)}원
                      </motion.p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-b border-line/60 py-2 text-[13px] tracking-[-0.01em]">
                  <span className="text-mist">상품 판매가</span>
                  <span className="text-paper">{formatWon(DETAILED_REPORT_LIST_PRICE)}원</span>
                </div>
                <div className="flex items-center justify-between border-b border-line/60 py-2 text-[13px] tracking-[-0.01em]">
                  <span className="text-[#e11d48]">지금 결제 시 할인</span>
                  <span className="text-[#e11d48]">-{formatWon(saved)}원</span>
                </div>
                <div className="flex items-center justify-between py-2 tracking-[-0.01em]">
                  <span className="text-[15px] text-paper">최종 구매가</span>
                  <span className="text-[20px] text-paper">{formatWon(DETAILED_REPORT_PRICE)}원</span>
                </div>

                <div className="mb-2 mt-0.5 flex justify-center">
                  <CheckoutDealPrice align="center" showPrice={false} showUrgency />
                </div>

                <CheckoutWidget token={token} amount={DETAILED_REPORT_PRICE} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <CheckoutExitModal open={exitOpen} onContinue={continueCheckout} onLeave={leaveCheckout} />
    </>
  );
}
