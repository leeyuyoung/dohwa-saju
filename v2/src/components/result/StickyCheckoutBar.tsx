"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CheckoutDealPrice } from "@/components/payment/CheckoutDealPrice";
import { PaymentSheet } from "@/components/payment/PaymentSheet";
import { MythicButtonLink } from "@/components/ui/MythicButtonLink";

type CheckoutSheetConfig = {
  clientKey: string;
  token: string;
  title: string;
  buyerName: string;
};

type StickyCheckoutBarProps = {
  href: string;
  label: string;
  /** 이 id의 요소가 화면 아래 끝에 닿은 뒤부터 버튼을 띄운다. 없으면 처음부터 띄운다. */
  showAfterId?: string;
  /** 있으면 버튼이 결제 시트를 아래에서 올린다. 없으면 href로 이동한다. */
  checkout?: CheckoutSheetConfig;
};

/** 화면 아래에 떠 있는 결제 버튼. 할인특가·타이머를 버튼 위에 둔다. */
export function StickyCheckoutBar({ href, label, showAfterId, checkout }: StickyCheckoutBarProps) {
  const [reached, setReached] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!showAfterId) return;
    const check = () => {
      const anchor = document.getElementById(showAfterId);
      if (anchor && anchor.getBoundingClientRect().top < window.innerHeight * 0.6) setReached(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [showAfterId]);

  const visible = !showAfterId || reached;

  return (
    <>
      <AnimatePresence>
        {visible && !sheetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-ink via-ink/90 to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8"
          >
            <div className="pointer-events-auto mx-auto flex max-w-xl flex-col items-center gap-0">
              <CheckoutDealPrice align="center" showPrice={false} />
              <div className="-mt-1 w-full">
                {checkout ? (
                  <MythicButtonLink onClick={() => setSheetOpen(true)}>{label}</MythicButtonLink>
                ) : (
                  <MythicButtonLink href={href}>{label}</MythicButtonLink>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {checkout && (
        <PaymentSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          clientKey={checkout.clientKey}
          token={checkout.token}
          title={checkout.title}
          buyerName={checkout.buyerName}
        />
      )}
    </>
  );
}
