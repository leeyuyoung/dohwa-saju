"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * head에 심은 Meta Pixel 베이스 코드의 첫 PageView 이후,
 * App Router 이동 시 추가 PageView를 보낸다. /2027은 제외.
 */
export function MetaPixelPageView() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.fbq) return;
    if (pathname.startsWith("/2027")) return;
    if (lastPath.current === null) {
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.fbq("track", "PageView");
  }, [pathname]);

  return null;
}
