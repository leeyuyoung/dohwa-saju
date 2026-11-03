"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Field, INPUT_BASE, inputBorder } from "@/components/input/fields/Field";
import { MarketingConsentModal } from "@/components/payment/MarketingConsentModal";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/constants/service";
import { checkoutContactSchema } from "@/lib/validation/analysisInput";

type CheckoutWidgetProps = {
  token: string;
  amount: number;
};

type ContactErrors = Partial<Record<"email" | "phone", string>>;

type OrderResponse = {
  orderId?: string;
  amount?: number;
  orderName?: string;
  payurl?: string;
  message?: string;
};

export function CheckoutWidget({ token, amount }: CheckoutWidgetProps) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [marketingDetailOpen, setMarketingDetailOpen] = useState(false);

  useEffect(() => {
    if (!marketingDetailOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMarketingDetailOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [marketingDetailOpen]);

  const pay = async () => {
    if (paying) return;
    const contact = checkoutContactSchema.safeParse({ email, phone, marketingOptIn });
    if (!contact.success) {
      const errors: ContactErrors = {};
      for (const issue of contact.error.issues) {
        const key = issue.path[0] as keyof ContactErrors;
        if (key === "email" || key === "phone") errors[key] ??= issue.message;
      }
      setContactErrors(errors);
      return;
    }
    setContactErrors({});
    setPaying(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...contact.data }),
      });
      const order = (await response.json().catch(() => ({}))) as OrderResponse;
      if (!response.ok || !order.orderId || !order.payurl || order.amount !== amount) {
        setError(order.message ?? "주문을 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
        setPaying(false);
        return;
      }
      window.location.assign(order.payurl);
    } catch {
      setError("결제를 시작하지 못했습니다. 다시 시도해주세요.");
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="glass-card flex flex-col gap-3 rounded-3xl px-5 py-4">
        <Field label="리포트를 받을 이메일" htmlFor="checkout-email" error={contactErrors.email} errorId="checkout-email-error">
          <input
            id="checkout-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="example@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={!!contactErrors.email}
            aria-describedby={contactErrors.email ? "checkout-email-error" : undefined}
            className={`${INPUT_BASE} !h-11 text-[15px] ${inputBorder(!!contactErrors.email)}`}
          />
        </Field>
        <Field label="휴대폰 번호" htmlFor="checkout-phone" error={contactErrors.phone} errorId="checkout-phone-error">
          <input
            id="checkout-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="01012345678"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={!!contactErrors.phone}
            aria-describedby={contactErrors.phone ? "checkout-phone-error" : undefined}
            className={`${INPUT_BASE} !h-11 text-[15px] ${inputBorder(!!contactErrors.phone)}`}
          />
        </Field>
        <p className="text-center text-[clamp(7.5px,2.4vw,10px)] leading-snug tracking-[-0.02em] text-mist-dim">
          결제 정보를 확인했으며{" "}
          <Link href="/legal/privacy" target="_blank" className="underline underline-offset-2">
            개인정보 처리방침
          </Link>
          ·
          <Link href="/legal/terms" target="_blank" className="underline underline-offset-2">
            이용약관
          </Link>
          ·
          <Link href="/legal/refund" target="_blank" className="underline underline-offset-2">
            환불정책
          </Link>
          에 동의합니다.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-center text-sm text-gold-soft">
          {error}
        </p>
      )}
      <Button onClick={pay} disabled={paying}>
        {paying ? "결제창으로 이동 중…" : `${formatPrice(amount)} 결제하기`}
      </Button>

      <div className="flex items-center justify-between gap-3 px-0.5 pb-0.5">
        <label className="flex min-w-0 cursor-pointer items-center gap-2.5">
          <span className="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(event) => setMarketingOptIn(event.target.checked)}
              className="peer absolute inset-0 z-10 cursor-pointer appearance-none"
            />
            <span
              aria-hidden
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors ${
                marketingOptIn ? "border-paper/55 bg-paper/25" : "border-paper/35 bg-transparent"
              }`}
            >
              {marketingOptIn && (
                <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 text-paper" fill="none">
                  <path d="M3.5 8.2 6.4 11l6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </span>
          <span className="truncate font-sans text-[13px] tracking-[-0.02em] text-paper">마케팅 수신 동의 (선택)</span>
        </label>
        <button
          type="button"
          onClick={() => setMarketingDetailOpen(true)}
          className="shrink-0 font-sans text-[12px] tracking-[-0.02em] text-mist underline underline-offset-2 transition-colors hover:text-paper"
        >
          자세히보기
        </button>
      </div>

      <MarketingConsentModal open={marketingDetailOpen} onClose={() => setMarketingDetailOpen(false)} />
    </div>
  );
}
