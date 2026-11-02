"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { CheckoutDealPrice } from "@/components/payment/CheckoutDealPrice";
import { CheckoutWidget } from "@/components/payment/CheckoutWidget";
import { trackFunnel } from "@/lib/client/funnel";
import { DETAILED_REPORT_LIST_PRICE, DETAILED_REPORT_PRICE, formatWon } from "@/lib/constants/service";

type PaymentSheetProps = {
  open: boolean;
  onClose: () => void;
  token: string;
  title: string;
  buyerName: string;
};

/** 결제 CTA에서 아래에서 올라오는 시트. 할인·연락처·페이앱 결제를 담는다. */
export function PaymentSheet({ open, onClose, token, title, buyerName }: PaymentSheetProps) {
  useEffect(() => {
    if (!open) return;
    trackFunnel("checkout", token);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, token]);

  const saved = DETAILED_REPORT_LIST_PRICE - DETAILED_REPORT_PRICE;

  return (
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
            onClick={onClose}
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
                onClick={onClose}
                className="relative z-10 rounded-md bg-night px-2 py-1 text-sm text-mist hover:text-paper"
              >
                닫기
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <p className="font-serif text-[15px] text-paper">{buyerName}의 연애·매력 리포트 결제</p>
              <p className="mt-1.5 inline-flex rounded-full bg-[#e11d48]/15 px-3 py-0.5 text-[12px] text-[#e11d48]">
                총 {formatWon(saved)}원 할인받았어요!
              </p>

              <div className="mt-3 rounded-2xl border border-[#e11d48]/55 bg-ink/50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-[14px] text-paper">{title}</p>
                    <p className="mt-0.5 text-[12px] text-mist">상세 리포트 전체 열람</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-mist-dim line-through">{formatWon(DETAILED_REPORT_LIST_PRICE)}원</p>
                    <p className="font-serif text-[17px] text-gold-soft">{formatWon(DETAILED_REPORT_PRICE)}원</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-b border-line/60 py-2 text-[13px]">
                <span className="text-mist">상품 판매가</span>
                <span className="text-paper">{formatWon(DETAILED_REPORT_LIST_PRICE)}원</span>
              </div>
              <div className="flex items-center justify-between border-b border-line/60 py-2 text-[13px]">
                <span className="text-[#e11d48]">지금 결제 시 할인</span>
                <span className="text-[#e11d48]">-{formatWon(saved)}원</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-serif text-[15px] text-paper">최종 구매가</span>
                <span className="font-serif text-[20px] text-paper">{formatWon(DETAILED_REPORT_PRICE)}원</span>
              </div>

              <div className="mb-2 mt-0.5 flex justify-center">
                <CheckoutDealPrice align="center" showPrice={false} />
              </div>

              <CheckoutWidget token={token} amount={DETAILED_REPORT_PRICE} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
