"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { KARROT_PIXEL_ID, trackKarrot } from "@/lib/client/karrotPixel";

/**
 * 당근 전환 추적 공통 스크립트.
 * 모든 페이지 ViewPage를 보내고, App Router 이동 시에도 다시 찍는다.
 */
export function KarrotPixel() {
  const pathname = usePathname();
  const booted = useRef(false);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!booted.current) {
      booted.current = true;
      const w = window;
      if (!w.karrotPixel) {
        const k = {
          stub: true,
          queue: [] as unknown[],
          init(...args: unknown[]) {
            k.queue.push(["init", args, Date.now()]);
          },
          track(...args: unknown[]) {
            k.queue.push(["track", args, Date.now()]);
          },
        };
        w.karrotPixel = k;
        const s = document.createElement("script");
        s.async = true;
        s.src = "https://karrot-pixel.business.daangn.com/karrot-pixel.js";
        const first = document.getElementsByTagName("script")[0];
        if (first?.parentNode) first.parentNode.insertBefore(s, first);
        else document.head.appendChild(s);
      }
      w.karrotPixel.init(KARROT_PIXEL_ID);
    }

    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackKarrot("ViewPage");
  }, [pathname]);

  return null;
}
