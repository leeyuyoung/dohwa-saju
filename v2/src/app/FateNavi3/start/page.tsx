import type { Metadata } from "next";
import { NewYearForm } from "@/components/newyear/NewYearForm";
import { NewYearShell } from "@/components/newyear/NewYearShell";

export const metadata: Metadata = {
  title: "정보 입력",
  robots: { index: false, follow: false },
};

export default function FateNavi2StartPage() {
  return (
    <NewYearShell theme="sheep">
      <NewYearForm theme="sheep" />
    </NewYearShell>
  );
}
