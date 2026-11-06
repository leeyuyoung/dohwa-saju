"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/** 로즈골드 연꽃 배너 원본 2170×725 */
const CTA_FRAME_ASPECT = "2170 / 725";

/**
 * 도화신당 CTA 바탕.
 * 로즈골드 연꽃 핑크 배너 위에 글자만 올린다.
 */
export function OrnateCtaSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`group relative flex w-full items-center justify-center px-[clamp(1.8rem,8vw,2.8rem)] transition-[filter,transform] duration-300 hover:brightness-[1.03] active:scale-[0.985] ${className ?? ""}`}
      style={{ aspectRatio: CTA_FRAME_ASPECT }}
    >
      <Image
        src="/images/ui/cta-rose-banner.png"
        alt=""
        fill
        sizes="(max-width: 480px) 100vw, 440px"
        className="pointer-events-none -z-10 object-contain drop-shadow-[0_10px_22px_rgb(40_15_25_/_0.4)]"
        priority
        unoptimized
      />
      <span className="relative z-10 -translate-y-[14%] whitespace-pre-line text-center font-brush text-[clamp(16px,4.4vw,19px)] font-normal leading-snug tracking-[0.04em] text-[#5c2438] break-keep [text-shadow:0_1px_0_rgb(255_245_248_/_0.55),0_0_10px_rgb(255_230_236_/_0.35)]">
        {children}
      </span>
    </span>
  );
}
