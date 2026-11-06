"use client";

import type { ReactNode } from "react";
import { useOpenCheckout } from "@/components/payment/CheckoutSheetContext";

/** 봉인·블러·잠금 칸. 누르면 결제 바텀시트를 연다. */
export function UnlockTap({
  children,
  className,
  label = "상세 리포트 열기",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const openCheckout = useOpenCheckout();

  return (
    <button type="button" aria-label={label} onClick={openCheckout} className={`cursor-pointer text-left ${className ?? ""}`}>
      {children}
    </button>
  );
}
