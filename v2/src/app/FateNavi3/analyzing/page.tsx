import type { Metadata } from "next";
import { NewYearAnalyzing } from "@/components/newyear/NewYearAnalyzing";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "가이드 준비 중",
  robots: { index: false, follow: false },
};

export default function FateNavi2AnalyzingPage() {
  return (
    <NewYearShell theme="sheep" showHeader={false} showFooter={false}>
      <NewYearAnalyzing theme="sheep" />
    </NewYearShell>
  );
}
