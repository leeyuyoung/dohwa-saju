import type { Metadata } from "next";
import { NewYearReportScreen } from "@/components/newyear/NewYearReportScreen";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { sampleNewYearReportView } from "@/lib/server/newyearView";

export const metadata: Metadata = {
  title: "인생 설계서 예시",
  robots: { index: false, follow: false },
};

export default function NewYearReportSamplePage() {
  return (
    <NewYearShell theme="hanji">
      <p className="ny-caption mb-10 text-center">화면 예시 · 결제와 무관한 문장</p>
      <NewYearReportScreen report={sampleNewYearReportView()} />
    </NewYearShell>
  );
}
