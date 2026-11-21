import { clearAllAdminLoginLocks, isAdminConfigured, verifyAdminPassword } from "@/lib/server/adminAuth";
import { isSameOrigin, jsonError as fail, readJsonBody } from "@/lib/server/http";

/**
 * 관리자 로그인 잠금 전체 해제. 프론트에서는 쓰지 않고, Cursor·운영에서만 호출한다.
 * 비밀번호가 맞으면 모든 IP 잠금을 지운다.
 */
export async function POST(request: Request) {
  // Origin이 있으면 같은 사이트만. Cursor·curl처럼 Origin 없는 운영 호출은 허용한다.
  if (request.headers.get("origin") && !isSameOrigin(request)) {
    return fail(403, "허용되지 않은 요청입니다.");
  }
  if (!isAdminConfigured()) return fail(404, "Not found");

  const json = await readJsonBody(request);
  const password =
    json && typeof json === "object" && typeof (json as { password?: unknown }).password === "string"
      ? (json as { password: string }).password
      : "";

  if (!verifyAdminPassword(password)) {
    return fail(401, "비밀번호가 올바르지 않습니다.");
  }

  clearAllAdminLoginLocks();
  return Response.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
}
