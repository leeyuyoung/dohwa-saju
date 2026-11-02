import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, isAdminConfigured } from "@/lib/server/adminAuth";
import { isSameOrigin, jsonError as fail } from "@/lib/server/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail(403, "허용되지 않은 요청입니다.");
  if (!isAdminConfigured()) return fail(404, "Not found");

  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, "", { ...adminCookieClear() });
  return Response.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
}

function adminCookieClear() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };
}
