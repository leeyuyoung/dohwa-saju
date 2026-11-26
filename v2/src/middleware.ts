import { NextResponse, type NextRequest } from "next/server";

/** 예전 /FateNavi → /FateNavi3 영구 리다이렉트 캐시를 한 번 비운다. */
const BUST_COOKIE = "fn_redir_bust_v2";

export function middleware(request: NextRequest) {
  if (request.cookies.get(BUST_COOKIE)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("Clear-Site-Data", '"cache"');
  response.cookies.set(BUST_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/FateNavi",
    "/FateNavi/:path*",
    "/FateNavi2",
    "/FateNavi2/:path*",
    "/FateNavi3",
    "/FateNavi3/:path*",
  ],
};
