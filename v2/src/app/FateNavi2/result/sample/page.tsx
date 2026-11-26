import type { Metadata } from "next";
import { NewYearResultScreen } from "@/components/newyear/NewYearResultScreen";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import { sampleNewYearFreeView } from "@/lib/server/newyearView";

export const metadata: Metadata = {
  title: "인생 설계서 예시",
  robots: { index: false, follow: false },
};

export default function FateNavi2ResultSamplePage() {
  return (
    <NewYearShell theme="premium" showFooter>
      <NewYearResultScreen
        theme="premium"
        result={sampleNewYearFreeView()}
        token="sample"
        paid={false}
        paymentsReady={false}
        sample
      />
    </NewYearShell>
  );
}
