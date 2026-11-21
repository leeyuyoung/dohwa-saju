import type { Metadata } from "next";
import { NewYearConcernForm } from "@/components/newyear/NewYearConcernForm";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "고민 입력",
  robots: { index: false, follow: false },
};

export default function FateNavi3ConcernPage() {
  return (
    <NewYearShell theme="hanji" tone="ink">
      <div className="pt-0">
        <NewYearConcernForm theme="hanji" />
      </div>
    </NewYearShell>
  );
}
