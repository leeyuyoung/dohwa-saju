import { redirect } from "next/navigation";

/** 예전 쿠키 주소. 결과는 이제 토큰 주소로만 연다. */
export default function ResultIndexPage() {
  redirect("/start");
}
