import { redirect } from "next/navigation";

/** 결제는 공통 FateNavi 체크아웃을 쓴다. */
export default async function FateNavi2CheckoutRedirect({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/FateNavi2/checkout/${token}`);
}
