"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Field, INPUT_BASE, inputBorder } from "@/components/input/fields/Field";
import { MarketingConsentModal } from "@/components/payment/MarketingConsentModal";
import { StickyFormCta } from "@/components/newyear/StickyFormCta";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/constants/service";
import { checkoutContactSchema } from "@/lib/validation/analysisInput";

type CheckoutPartnerPayload = {
  name: string;
  gender: "male" | "female";
  calendarType: "solar" | "lunar";
  isLeapMonth: boolean;
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
  birthTimeUnknown: boolean;
  concern: string | null;
};

type CheckoutWidgetProps = {
  token: string;
  amount: number;
  /** 이탈 2단 비밀쿠폰 적용 여부. 서버가 금액을 확정한다. */
  couponApplied?: boolean;
  /** 신년/프리미엄 1인·2인. 서버가 금액을 확정한다. */
  pack?: "solo" | "duo";
  /** 동의 링크의 약관 경로. 도화는 /legal, 신년 사주는 /FateNavi/legal. */
  legalBase?: string;
  /** ink는 2027 먹색 버튼. 기본은 도화 배너 버튼. */
  tone?: "dohwa" | "ink";
  /** 결제 직전 추가 검증. 메시지를 반환하면 결제를 막는다. */
  onBeforePay?: () => string | null;
  /** 2인 팩 상대 사주. 결제 시점에 읽는다. */
  getPartner?: () => CheckoutPartnerPayload | null;
};

type ContactErrors = Partial<Record<"email" | "phone", string>>;

type OrderResponse = {
  orderId?: string;
  amount?: number;
  orderName?: string;
  payurl?: string;
  message?: string;
};

/** 휴대폰 입력 표시용. 010은 3-4-4, 그 외 01X는 3-3-4. */
function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.startsWith("010")) {
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function CheckoutWidget({
  token,
  amount,
  couponApplied = false,
  pack = "solo",
  legalBase = "/legal",
  tone = "dohwa",
  onBeforePay,
  getPartner,
}: CheckoutWidgetProps) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [marketingOptIn, setMarketingOptIn] = useState(false);
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
    const gate = onBeforePay?.();
    if (gate) {
      setError(gate);
      return;
    }
    const partner = pack === "duo" ? getPartner?.() ?? null : null;
    if (pack === "duo" && !partner) {
      setError("함께 볼 사람 정보를 확인해 주세요.");
      return;
    }
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
        body: JSON.stringify({
          token,
          couponApplied,
          pack,
          ...contact.data,
          ...(partner ? { partner } : {}),
        }),
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

  const fields = (
    <>
      <Field
        label="리포트를 받을 이메일"
        htmlFor="checkout-email"
        error={contactErrors.email}
        errorId="checkout-email-error"
        labelClassName="!font-gothic tracking-[-0.01em]"
      >
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
          className={`${INPUT_BASE} !h-11 !font-gothic text-[15px] tracking-[-0.01em] ${inputBorder(!!contactErrors.email)}`}
        />
      </Field>
      <Field
        label="휴대폰 번호"
        htmlFor="checkout-phone"
        error={contactErrors.phone}
        errorId="checkout-phone-error"
        labelClassName="!font-gothic tracking-[-0.01em]"
      >
        <input
          id="checkout-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="010-1234-5678"
          value={phone}
          onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
          maxLength={13}
          aria-invalid={!!contactErrors.phone}
          aria-describedby={contactErrors.phone ? "checkout-phone-error" : undefined}
          className={`${INPUT_BASE} !h-11 !font-gothic text-[15px] tracking-[-0.01em] ${inputBorder(!!contactErrors.phone)}`}
        />
      </Field>
      <div className="flex flex-col gap-0 text-center font-gothic font-normal leading-snug tracking-[-0.02em]">
        <p
          className={`m-0 text-[clamp(9px,2.7vw,11px)] ${
            tone === "ink" ? "text-[rgb(28_28_28/0.72)]" : "text-mist"
          }`}
        >
          결제 확인 후 맞춤 리포트 작성이 시작되면 청약철회가 제한될 수 있습니다.
        </p>
        <p
          className={`m-0 text-[clamp(7.5px,2.4vw,10px)] ${
            tone === "ink" ? "text-[rgb(28_28_28/0.45)]" : "text-mist-dim"
          }`}
        >
          결제 정보를 확인했으며{" "}
          <Link href={`${legalBase}/privacy`} target="_blank" className="underline underline-offset-2">
            개인정보 처리방침
          </Link>
          ·
          <Link href={`${legalBase}/terms`} target="_blank" className="underline underline-offset-2">
            이용약관
          </Link>
          ·
          <Link href={`${legalBase}/refund`} target="_blank" className="underline underline-offset-2">
            환불정책
          </Link>
          에 동의합니다.
        </p>
      </div>
    </>
  );

  const marketing = (
    <div className="flex items-center justify-between gap-3 px-0.5">
      <label className="flex min-w-0 cursor-pointer items-center gap-2">
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
              marketingOptIn
                ? tone === "ink"
                  ? "border-[#1c1c1c] bg-[#1c1c1c]"
                  : "border-paper bg-paper"
                : tone === "ink"
                  ? "border-[rgb(28_28_28/0.35)] bg-transparent"
                  : "border-paper/35 bg-transparent"
            }`}
          >
            {marketingOptIn ? (
              <svg
                viewBox="0 0 16 16"
                className={`h-2.5 w-2.5 ${tone === "ink" ? "text-[#f5f3ee]" : "text-ink"}`}
                fill="none"
              >
                <path
                  d="M3.5 8.2 6.4 11l6-6.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
        </span>
        <span
          className={`truncate font-gothic text-[11px] tracking-[-0.02em] ${
            tone === "ink" ? "text-[#1c1c1c]" : "text-paper"
          }`}
        >
          마케팅 수신 동의 (선택)
        </span>
      </label>
      <button
        type="button"
        onClick={() => setMarketingDetailOpen(true)}
        className={`shrink-0 font-gothic text-[10px] tracking-[-0.02em] underline underline-offset-2 transition-colors ${
          tone === "ink"
            ? "text-[rgb(28_28_28/0.45)] hover:text-[#1c1c1c]"
            : "text-mist hover:text-paper"
        }`}
      >
        자세히보기
      </button>
    </div>
  );

  return (
    <div className={`flex flex-col font-gothic ${tone === "ink" ? "ny-checkout-flat" : "gap-3.5"}`}>
      {tone === "ink" ? (
        <div className="ny-checkout-flat-fields flex flex-col gap-4">{fields}</div>
      ) : (
        <div className="glass-card flex flex-col gap-3 rounded-3xl px-5 py-4">{fields}</div>
      )}

      {error && (
        <p
          role="alert"
          className={`text-center text-sm ${tone === "ink" ? "ny-checkout-flat-meta text-[#b84316]" : "text-gold-soft"}`}
        >
          {error}
        </p>
      )}

      {tone === "ink" ? <div className="ny-checkout-flat-meta">{marketing}</div> : marketing}

      {tone === "ink" ? (
        <StickyFormCta>
          <button type="button" className="ny-cta w-full" onClick={pay} disabled={paying}>
            {paying ? "결제창으로 이동 중…" : `${formatPrice(amount)} 결제하기`}
          </button>
        </StickyFormCta>
      ) : (
        <Button onClick={pay} disabled={paying}>
          {paying ? "결제창으로 이동 중…" : `${formatPrice(amount)} 결제하기`}
        </Button>
      )}

      <MarketingConsentModal open={marketingDetailOpen} onClose={() => setMarketingDetailOpen(false)} />
    </div>
  );
}
