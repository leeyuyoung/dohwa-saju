import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ReportScreenV1 } from "@/components/result/ReportScreen.v1";
import { ReportScreenV2 } from "@/components/result/ReportScreen.v2";
import { ReportWaiting } from "@/components/result/ReportWaiting";
import { resolveReportVersion } from "@/lib/constants/reportVersion";
import { TOKEN_PATTERN } from "@/lib/server/analysis";
import { toFullReportView, toFullReportViewV2 } from "@/lib/server/resultView";
import { getAnalysisStore } from "@/lib/server/store";

export const metadata: Metadata = {
  title: "나의 연애·매력 리포트",
  robots: { index: false, follow: false },
};

export default async function ReportPage({ params }: PageProps<"/report/[token]">) {
  const { token } = await params;
  const record = TOKEN_PATTERN.test(token) ? await getAnalysisStore().get(token) : null;
  if (!record) notFound();
  // 결제가 확인되지 않았으면 본문을 보내지 않고 무료 화면으로 돌려보낸다.
  if (record.paidAt === null) redirect(`/result/${token}`);

  const version = resolveReportVersion(record.reportVersion);

  if (version >= 2) {
    const report = toFullReportViewV2(record);
    if (!report) {
      return (
        <PageShell showFooter={false}>
          <ReportWaiting token={token} failed={record.status === "failed"} />
        </PageShell>
      );
    }
    return <ReportScreenV2 report={report} />;
  }

  const report = toFullReportView(record);
  if (!report) {
    return (
      <PageShell showFooter={false}>
        <ReportWaiting token={token} failed={record.status === "failed"} />
      </PageShell>
    );
  }

  return <ReportScreenV1 report={report} />;
}
