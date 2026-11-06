"use client";

import { AnimatePresence, motion } from "motion/react";
import { DETAILED_REPORT_LIST_PRICE, DETAILED_REPORT_PRICE, formatWon } from "@/lib/constants/service";

type CheckoutExitModalProps = {
  open: boolean;
  onContinue: () => void;
  onLeave: () => void;
};

const saved = DETAILED_REPORT_LIST_PRICE - DETAILED_REPORT_PRICE;

/** 결제 시트를 닫으려 할 때 띄우는 이탈 방지 팝업. */
export function CheckoutExitModal({ open, onContinue, onLeave }: CheckoutExitModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <motion.button
            type="button"
            aria-label="닫기 취소"
            className="absolute inset-0 bg-ink/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onContinue}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="checkout-exit-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="relative z-10 w-full max-w-[20.5rem] rounded-[1.35rem] bg-white px-5 pb-5 pt-6 shadow-[0_18px_48px_rgb(0_0_0_/_0.28)]"
          >
            <h2 id="checkout-exit-title" className="text-left font-gothic text-[22px] font-bold leading-snug tracking-[-0.02em] text-[#111827]">
              지금 나가면{" "}
              <span className="inline rounded-md bg-[#ffe4ec] px-1.5 py-0.5 text-[#e11d48]">{formatWon(saved)}원</span>
              <br />
              할인이 사라져요
            </h2>

            <button
              type="button"
              onClick={onContinue}
              className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-[#e11d48] font-gothic text-[16px] font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90"
            >
              혜택 받고 계속하기
            </button>
            <button
              type="button"
              onClick={onLeave}
              className="mt-3 flex h-10 w-full items-center justify-center font-gothic text-[14px] text-[#9ca3af] transition-colors hover:text-[#6b7280]"
            >
              나가기
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
