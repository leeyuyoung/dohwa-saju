import type { Metadata } from "next";
import { Suspense } from "react";
import { NewYearAnalyzing } from "@/components/newyear/NewYearAnalyzing";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "가이드 준비 중",
  robots: { index: false, follow: false },
};

export default function FateNavi3AnalyzingPage() {
  return (
    <NewYearShell theme="sheep" showHeader={false} showFooter={false}>
      <Suspense fallback={<div className="ny-form min-h-[40vh]" aria-hidden />}>
        <NewYearAnalyzing theme="sheep" />
      </Suspense>
    </NewYearShell>
  );
}
