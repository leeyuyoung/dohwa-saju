import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_LOGIN_LIMIT,
  adminCookieOptions,
  createAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/server/adminAuth";
import { isSameOrigin, jsonError as fail, readJsonBody } from "@/lib/server/http";
import { clientIp, consumeRateLimit } from "@/lib/server/rateLimit";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, "허용되지 않은 요청입니다.");
  if (!isAdminConfigured()) return fail(404, "Not found");

  const retryAfter = consumeRateLimit(`admin-login:ip:${clientIp(request)}`, ADMIN_LOGIN_LIMIT);
  if (retryAfter !== null) {
    return fail(429, "잠시 후 다시 시도해주세요.", { "Retry-After": String(retryAfter) });
  }

  const json = await readJsonBody(request);
  const password =
    json && typeof json === "object" && typeof (json as { password?: unknown }).password === "string"
      ? (json as { password: string }).password
      : "";

  if (!verifyAdminPassword(password)) {
    return fail(401, "비밀번호가 올바르지 않습니다.");
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), adminCookieOptions());
  return Response.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
}
