import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FreeResultScreen } from "@/components/result/FreeResultScreen";
import { PRODUCT_NEWYEAR, productOf } from "@/lib/constants/newyear";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { isPayappConfigured } from "@/lib/server/payments";
import { toFreeResultView } from "@/lib/server/resultView";
import { getAnalysisStore } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "나의 색기력",
  robots: { index: false, follow: false },
};

export default async function ResultPage({ params }: PageProps<"/result/[token]">) {
  const { token } = await params;
  if (!TOKEN_PATTERN.test(token)) notFound();
  const record = await getAnalysisStore().get(token);
  if (!record) notFound();
  if (productOf(record) === PRODUCT_NEWYEAR) redirect(`/FateNavi/result/${token}`);
  return (
    <FreeResultScreen
      result={toFreeResultView(record)}
      token={token}
      paid={record.paidAt !== null}
      paymentsReady={isPayappConfigured()}
    />
  );
}
