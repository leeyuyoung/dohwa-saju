import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { NewYearReportScreen } from "@/components/newyear/NewYearReportScreen";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { ReportWaiting } from "@/components/result/ReportWaiting";
import { NEWYEAR_CHECKOUT_OPEN, PRODUCT_NEWYEAR, productOf } from "@/lib/constants/newyear";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { previewNewYearReportView, toNewYearReportView } from "@/lib/server/newyearView";
import { getAnalysisStore } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "인생 설계서",
  robots: { index: false, follow: false },
};

const WAITING = [
  "인생 경로를 놓고 있습니다.",
  "오행과 십성이 어디서 힘을 쓰는지 보고 있습니다.",
  "앞으로 10년과 올해의 달을 차례로 펼치고 있습니다.",
  "우회로에 남길 말을 고르고 있습니다.",
] as const;

export default async function NewYearReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = TOKEN_PATTERN.test(token) ? await getAnalysisStore().get(token) : null;
  if (!record) notFound();
  if (productOf(record) !== PRODUCT_NEWYEAR) redirect(record.paidAt ? `/report/${token}` : `/result/${token}`);
  if (record.paidAt === null) {
    if (!NEWYEAR_CHECKOUT_OPEN) {
      return (
        <NewYearShell theme="hanji">
          <NewYearReportScreen report={previewNewYearReportView(record)} />
        </NewYearShell>
      );
    }
    redirect(`/FateNavi3/result/${token}`);
  }

  const report = toNewYearReportView(record);
  if (!report) {
    return (
      <NewYearShell theme="hanji" showFooter={false}>
        <ReportWaiting
          token={token}
          failed={record.status === "failed"}
          messages={WAITING}
          failedTitle="리포트를 쓰다 잠시 멈췄습니다."
          failedDetail="결제는 확인되었습니다. 다시 열면 이어서 씁니다."
          retryLabel="다시 쓰기"
          hint="글이 길어 몇 분 걸릴 수 있습니다. 화면을 닫아도 이메일로 보내 드립니다."
        />
      </NewYearShell>
    );
  }

  return (
    <NewYearShell theme="hanji">
      <NewYearReportScreen report={report} />
    </NewYearShell>
  );
}
