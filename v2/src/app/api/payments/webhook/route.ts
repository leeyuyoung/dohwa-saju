import { jsonError as fail } from "@/lib/server/http";

/** 토스 웹훅은 페이앱 전환 후 사용하지 않는다. 페이앱은 /api/payments/payapp/feedback 을 쓴다. */
export async function POST() {
  return fail(410, "페이앱 feedback URL을 사용해주세요.");
}
