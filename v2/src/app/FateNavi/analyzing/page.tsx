import type { Metadata } from "next";
import { Suspense } from "react";
import { NewYearAnalyzing } from "@/components/newyear/NewYearAnalyzing";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "경로를 그리는 중",
  robots: { index: false, follow: false },
};

export default function FateNaviAnalyzingPage() {
  return (
    <NewYearShell theme="hanji" tone="ink" showHeader={false} showFooter={false}>
      <Suspense fallback={<div className="ny-form min-h-[40vh]" aria-hidden />}>
        <NewYearAnalyzing theme="hanji" />
      </Suspense>
    </NewYearShell>
  );
}
