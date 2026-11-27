import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FunnelBeacon } from "@/components/analytics/FunnelBeacon";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { PremiumCheckout } from "@/components/newyear/PremiumCheckout";
import { NEWYEAR_DIRECT_PAY_OPEN, PRODUCT_NEWYEAR, productOf } from "@/lib/constants/newyear";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { getAnalysisStore } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "결제하기",
  robots: { index: false, follow: false },
};

/** FateNavi 직결제. 무료결과 없이 정보입력 직후 결제한다. */
export default async function FateNaviCheckoutPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = TOKEN_PATTERN.test(token) ? await getAnalysisStore().get(token) : null;
  if (!record) notFound();
  if (productOf(record) !== PRODUCT_NEWYEAR) redirect(record.paidAt ? `/report/${token}` : `/checkout/${token}`);
  if (record.paidAt !== null) redirect(`/FateNavi/report/${token}`);
  if (!NEWYEAR_DIRECT_PAY_OPEN) redirect(`/FateNavi/start`);

  return (
    <NewYearShell theme="premium" tone="ink" showHeader={false}>
      <FunnelBeacon step="checkout" token={token} product={PRODUCT_NEWYEAR} trackPixels={false} />
      <PremiumCheckout token={token} backHref="/FateNavi/concern" />
    </NewYearShell>
  );
}
