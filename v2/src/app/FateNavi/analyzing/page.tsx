import type { Metadata } from "next";
import { NewYearAnalyzing } from "@/components/newyear/NewYearAnalyzing";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "경로를 그리는 중",
  robots: { index: false, follow: false },
};

export default function FateNaviAnalyzingPage() {
  return (
    <NewYearShell theme="navi" tone="ink" showHeader={false} showFooter={false}>
      <NewYearAnalyzing theme="navi" />
    </NewYearShell>
  );
}
