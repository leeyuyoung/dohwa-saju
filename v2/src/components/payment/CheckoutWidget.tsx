"use client";

import { ANONYMOUS, loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Field, INPUT_BASE, inputBorder } from "@/components/input/fields/Field";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/constants/service";
import { checkoutContactSchema } from "@/lib/validation/analysisInput";

type CheckoutWidgetProps = {
  clientKey: string;
  token: string;
  amount: number;
};

type ContactErrors = Partial<Record<"email", string>>;

type OrderResponse = { orderId?: string; amount?: number; orderName?: string; message?: string };

const PAYMENT_METHOD_SELECTOR = "#toss-payment-method";
const AGREEMENT_SELECTOR = "#toss-payment-agreement";
/** 구매자가 결제창을 닫았을 때 SDK가 던지는 오류 코드 */
const USER_CANCEL_CODES = new Set(["USER_CANCEL", "PAY_PROCESS_CANCELED"]);

export function CheckoutWidget({ clientKey, token, amount }: CheckoutWidgetProps) {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const startedRef = useRef(false);
  const activeRef = useRef(true);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});

  useEffect(() => {
    activeRef.current = true;
    if (!startedRef.current) {
      startedRef.current = true;
      (async () => {
        try {
          const tossPayments = await loadTossPayments(clientKey);
          const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
          await widgets.setAmount({ currency: "KRW", value: amount });
          await Promise.all([
            widgets.renderPaymentMethods({ selector: PAYMENT_METHOD_SELECTOR, variantKey: "DEFAULT" }),
            widgets.renderAgreement({ selector: AGREEMENT_SELECTOR, variantKey: "AGREEMENT" }),
          ]);
          widgetsRef.current = widgets;
          if (activeRef.current) setReady(true);
        } catch {
          if (activeRef.current) setError("결제 화면을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.");
        }
      })();
    }
    return () => {
      activeRef.current = false;
    };
  }, [clientKey, amount]);

  const pay = async () => {
    const widgets = widgetsRef.current;
    if (!widgets || paying) return;
    const contact = checkoutContactSchema.safeParse({ email });
    if (!contact.success) {
      const errors: ContactErrors = {};
      for (const issue of contact.error.issues) {
        const key = issue.path[0] as keyof ContactErrors;
        errors[key] ??= issue.message;
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
      if (!response.ok || !order.orderId || !order.orderName || order.amount !== amount) {
        setError(order.message ?? "주문을 만들지 못했습니다. 잠시 후 다시 시도해주세요.");
        setPaying(false);
        return;
      }
      await widgets.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail?token=${encodeURIComponent(token)}`,
      });
    } catch (caught) {
      const code = (caught as { code?: string } | null)?.code;
      if (!code || !USER_CANCEL_CODES.has(code)) setError("결제를 시작하지 못했습니다. 다시 시도해주세요.");
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
        <p className="whitespace-nowrap text-center text-[clamp(7.5px,2.4vw,10px)] leading-none tracking-[-0.02em] text-mist-dim">
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

      <div className="overflow-hidden rounded-2xl bg-white">
        <div id="toss-payment-method" />
        <div id="toss-payment-agreement" />
      </div>
      {error && (
        <p role="alert" className="text-center text-sm text-gold-soft">
          {error}
        </p>
      )}
      <Button onClick={pay} disabled={!ready || paying}>
        {paying ? "결제창을 여는 중…" : `${formatPrice(amount)} 결제하기`}
      </Button>
    </div>
  );
}
