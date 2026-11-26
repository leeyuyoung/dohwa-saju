import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { NewYearResultScreen } from "@/components/newyear/NewYearResultScreen";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { PRODUCT_NEWYEAR, productOf } from "@/lib/constants/newyear";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { toNewYearFreeView } from "@/lib/server/newyearView";
import { isPayappConfigured } from "@/lib/server/payments";
import { getAnalysisStore } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "인생 설계서 미리보기",
  robots: { index: false, follow: false },
};

export default async function FateNavi2ResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!TOKEN_PATTERN.test(token)) notFound();
  const record = await getAnalysisStore().get(token);
  if (!record) notFound();
  if (productOf(record) !== PRODUCT_NEWYEAR) redirect(`/result/${token}`);

  return (
    <NewYearShell theme="sheep" showFooter>
      <NewYearResultScreen
        theme="sheep"
        result={toNewYearFreeView(record)}
        token={token}
        paid={record.paidAt !== null}
        paymentsReady={isPayappConfigured()}
      />
    </NewYearShell>
  );
}
