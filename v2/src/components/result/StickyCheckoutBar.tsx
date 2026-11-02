"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CheckoutDealPrice } from "@/components/payment/CheckoutDealPrice";
import { MythicButtonLink } from "@/components/ui/MythicButtonLink";

type StickyCheckoutBarProps = {
  href: string;
  label: string;
  /** 이 id의 요소가 화면 아래 끝에 닿은 뒤부터 버튼을 띄운다. 없으면 처음부터 띄운다. */
  showAfterId?: string;
};

/** 화면 아래에 떠 있는 결제 버튼. 할인특가·타이머·가격을 버튼 위에 둔다. */
export function StickyCheckoutBar({ href, label, showAfterId }: StickyCheckoutBarProps) {
  const [reached, setReached] = useState(false);

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
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-ink via-ink/90 to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8"
        >
          <div className="pointer-events-auto mx-auto flex max-w-xl flex-col items-center gap-2.5">
            <CheckoutDealPrice align="center" showPrice={false} />
            <MythicButtonLink href={href}>{label}</MythicButtonLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
