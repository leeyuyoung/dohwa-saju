import { jsonError as fail } from "@/lib/server/http";

/** 토스 승인 API는 페이앱 전환 후 사용하지 않는다. */
export async function POST() {
  return fail(410, "페이앱 결제로 전환되었습니다. 결제 완료 후 안내 화면에서 리포트를 열어주세요.");
}
