import type { Metadata } from "next";
import { NewYearResultScreen } from "@/components/newyear/NewYearResultScreen";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { sampleNewYearFreeView } from "@/lib/server/newyearView";

export const metadata: Metadata = {
  title: "레벨업 가이드 예시",
  robots: { index: false, follow: false },
};

export default function FateNavi2ResultSamplePage() {
  return (
    <NewYearShell theme="sheep" showFooter>
      <NewYearResultScreen
        theme="sheep"
        result={sampleNewYearFreeView()}
        token="sample"
        paid={false}
        paymentsReady={false}
        sample
      />
    </NewYearShell>
  );
}
