import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_LOGIN_MAX_FAILURES,
  adminCookieOptions,
  clearAdminLoginLock,
  createAdminSessionToken,
  isAdminConfigured,
  isAdminLoginLocked,
  recordAdminLoginFailure,
  verifyAdminPassword,
} from "@/lib/server/adminAuth";
import { isSameOrigin, jsonError as fail, readJsonBody } from "@/lib/server/http";
import { clientIp } from "@/lib/server/rateLimit";

function loginFail(status: number, message: string, failures: number, locked = false) {
  return Response.json(
    { message, failures, maxFailures: ADMIN_LOGIN_MAX_FAILURES, locked },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, "허용되지 않은 요청입니다.");
  if (!isAdminConfigured()) return fail(404, "Not found");

  const ip = clientIp(request);
  if (isAdminLoginLocked(ip)) {
    return loginFail(
      423,
      "로그인 실패 횟수를 초과해 잠겼습니다. 관리자에게 잠금 해제를 요청해주세요.",
      ADMIN_LOGIN_MAX_FAILURES,
      true,
    );
  }

  const json = await readJsonBody(request);
  const password =
    json && typeof json === "object" && typeof (json as { password?: unknown }).password === "string"
      ? (json as { password: string }).password
      : "";

  if (!verifyAdminPassword(password)) {
    const { locked, failures } = recordAdminLoginFailure(ip);
    if (locked) {
      return loginFail(
        423,
        "로그인 실패 횟수를 초과해 잠겼습니다. 관리자에게 잠금 해제를 요청해주세요.",
        failures,
        true,
      );
    }
    return loginFail(401, `비밀번호가 올바르지 않습니다. (${failures}/${ADMIN_LOGIN_MAX_FAILURES})`, failures);
  }

  clearAdminLoginLock(ip);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), adminCookieOptions());
  return Response.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
}
