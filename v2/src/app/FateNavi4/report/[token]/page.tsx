import { redirect } from "next/navigation";

/** 유료 리포트는 공통 FateNavi 리포트를 쓴다. */
export default async function FateNavi4ReportRedirect({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/FateNavi/report/${token}`);
}