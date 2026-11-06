"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { PaymentSheet } from "@/components/payment/PaymentSheet";

type CheckoutConfig = {
  token: string;
  title: string;
  buyerName: string;
};

type CheckoutSheetContextValue = {
  /** 결제 시트를 열거나, 시트가 없으면 href로 보낸다 */
  openCheckout: () => void;
  sheetOpen: boolean;
};

const CheckoutSheetContext = createContext<CheckoutSheetContextValue | null>(null);

export function useOpenCheckout() {
  const value = useContext(CheckoutSheetContext);
  return value?.openCheckout ?? (() => undefined);
}

export function useCheckoutSheetOpen() {
  return useContext(CheckoutSheetContext)?.sheetOpen ?? false;
}

/** 무료 결과에서 잠금 칸·하단 CTA가 같은 결제 시트를 열게 한다. */
export function CheckoutSheetProvider({
  checkout,
  href,
  children,
}: {
  checkout?: CheckoutConfig;
  href: string;
  children: ReactNode;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const openCheckout = useCallback(() => {
    if (checkout) {
      setSheetOpen(true);
      return;
    }
    window.location.assign(href);
  }, [checkout, href]);

  const value = useMemo(() => ({ openCheckout, sheetOpen }), [openCheckout, sheetOpen]);

  return (
    <CheckoutSheetContext.Provider value={value}>
      {children}
      {checkout ? (
        <PaymentSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          token={checkout.token}
          title={checkout.title}
          buyerName={checkout.buyerName}
        />
      ) : null}
    </CheckoutSheetContext.Provider>
  );
}
