import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { CheckoutWidget } from "@/components/payment/CheckoutWidget";
import { NEWYEAR_CHAPTERS, NEWYEAR_CHECKOUT_OPEN, NEWYEAR_ORDER_NAME, NEWYEAR_REPORT_PRICE, PRODUCT_NEWYEAR, productOf } from "@/lib/constants/newyear";
import { formatPrice } from "@/lib/constants/service";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { getAnalysisStore } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "운명내비 결제",
  robots: { index: false, follow: false },
};

export default async function NewYearCheckoutPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = TOKEN_PATTERN.test(token) ? await getAnalysisStore().get(token) : null;
  if (!record) notFound();
  if (productOf(record) !== PRODUCT_NEWYEAR) redirect(record.paidAt ? `/report/${token}` : `/checkout/${token}`);
  if (record.paidAt !== null) redirect(`/FateNavi/report/${token}`);
  if (!NEWYEAR_CHECKOUT_OPEN) redirect(`/FateNavi/result/${token}`);

  return (
    <NewYearShell>
      <section className="ny-stack pb-8">
        <p className="ny-kicker">2027</p>
        <h1 className="ny-title">
          {record.name}님의 {NEWYEAR_ORDER_NAME}
        </h1>
        <p className="ny-sub">{formatPrice(NEWYEAR_REPORT_PRICE)}</p>
        <p className="ny-body">{NEWYEAR_CHAPTERS.map((chapter) => chapter.title).join(" · ")}</p>
        <p className="ny-note">
          결제가 확인되면 이 사주로 리포트를 쓰기 시작합니다. 디지털 콘텐츠라 작성이 시작된 뒤에는 청약철회가 제한될 수
          있습니다.
        </p>
      </section>
      <CheckoutWidget token={token} amount={NEWYEAR_REPORT_PRICE} legalBase="/FateNavi/legal" tone="ink" />
      <p className="mt-6 text-center">
        <Link href={`/FateNavi/result/${token}`} className="text-xs text-mist-dim underline-offset-4 hover:text-mist hover:underline">
          무료 결과로 돌아가기
        </Link>
      </p>
    </NewYearShell>
  );
}
