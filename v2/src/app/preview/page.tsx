import type { Metadata } from "next";
import { ReportPreviewScreen } from "@/components/result/ReportPreviewScreen";

export const metadata: Metadata = {
  title: "리포트 미리보기",
  description: "도화신당 연애·매력 리포트에 무엇이 담기는지 짧게 보여 준다.",
  robots: { index: false, follow: false },
};

export default function ReportPreviewPage() {
  return <ReportPreviewScreen />;
}
