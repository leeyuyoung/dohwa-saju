import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ButtonLink } from "@/components/ui/Button";
import { TOKEN_PATTERN } from "@/lib/server/analysis";

export const metadata: Metadata = {
  title: "결제 확인",
  robots: { index: false, follow: false },
};

/** 예전 토스 successUrl. 토큰이 있으면 리포트로, 없으면 안내만. */
export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  const { token } = await searchParams;
  if (typeof token === "string" && TOKEN_PATTERN.test(token)) redirect(`/report/${token}`);

  return (
    <PageShell showFooter={false}>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-20 text-center">
        <h1 className="font-serif text-2xl font-light">결제는 페이앱으로 진행됩니다</h1>
        <p className="text-sm text-mist">결제 후 안내되는 화면에서 리포트를 열어 주세요.</p>
        <div className="w-full max-w-xs">
          <ButtonLink href="/" variant="ghost">
            처음으로
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
