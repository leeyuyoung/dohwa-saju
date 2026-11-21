import type { Metadata } from "next";
import { NewYearForm } from "@/components/newyear/NewYearForm";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "정보 입력",
  robots: { index: false, follow: false },
};

export default function FateNaviStartPage() {
  return (
    <NewYearShell theme="navi" tone="ink">
      <div className="pt-2">
        <NewYearForm theme="navi" />
      </div>
    </NewYearShell>
  );
}
