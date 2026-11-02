import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PaymentReturn } from "@/components/payment/PaymentReturn";
import { ButtonLink } from "@/components/ui/Button";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { ORDER_ID_PATTERN } from "@/lib/server/payments";

export const metadata: Metadata = {
  title: "결제 확인",
  robots: { index: false, follow: false },
};

type ReturnSearch = { token?: string; orderId?: string };

export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<ReturnSearch> }) {
  const { token, orderId } = await searchParams;
  const valid =
    typeof token === "string" &&
    TOKEN_PATTERN.test(token) &&
    typeof orderId === "string" &&
    ORDER_ID_PATTERN.test(orderId);

  return (
    <PageShell showFooter={false}>
      {valid ? (
        <PaymentReturn token={token} orderId={orderId} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-20 text-center">
          <h1 className="font-serif text-2xl font-light">결제 정보를 확인할 수 없습니다</h1>
          <div className="w-full max-w-xs">
            <ButtonLink href="/" variant="ghost">
              처음으로
            </ButtonLink>
          </div>
        </div>
      )}
    </PageShell>
  );
}
