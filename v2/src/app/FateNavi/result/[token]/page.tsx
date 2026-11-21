import { redirect } from "next/navigation";

/** 버전1 결과 제거. 공통 진입은 FateNavi3 결과로 보낸다. */
export default async function FateNaviResultRedirect({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/FateNavi3/result/${token}`);
}
