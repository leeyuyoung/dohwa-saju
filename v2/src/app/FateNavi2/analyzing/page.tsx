import type { Metadata } from "next";
import { NewYearAnalyzing } from "@/components/newyear/NewYearAnalyzing";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "사주를 정리하는 중",
  robots: { index: false, follow: false },
};

export default function FateNavi2AnalyzingPage() {
  return (
    <NewYearShell theme="premium" tone="ink" showHeader={false} showFooter={false}>
      <NewYearAnalyzing theme="premium" />
    </NewYearShell>
  );
}
