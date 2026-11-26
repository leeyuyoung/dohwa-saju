import type { Metadata } from "next";
import { NewYearAnalyzing } from "@/components/newyear/NewYearAnalyzing";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "경로를 그리는 중",
  robots: { index: false, follow: false },
};

export default function FateNavi3AnalyzingPage() {
  return (
    <NewYearShell theme="hanji" tone="ink" showHeader={false} showFooter={false}>
      <NewYearAnalyzing theme="hanji" />
    </NewYearShell>
  );
}
