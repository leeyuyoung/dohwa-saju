"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/** 원본 2101×518 — 입력 화면에서 두께만 살짝 줄인 표시 비율 */
const CTA_FRAME_ASPECT = "2101 / 440";

/**
 * 도화사주 CTA 바탕.
 * 벚꽃 동양풍 대화창에서 배경만 뺀 프레임을 원본 비율 그대로 쓰고, 글자만 올린다.
 */
export function OrnateCtaSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`group relative flex w-full items-center justify-center px-[clamp(1.6rem,7vw,2.4rem)] transition-[filter,transform] duration-300 hover:brightness-[1.03] active:scale-[0.985] ${className ?? ""}`}
      style={{ aspectRatio: CTA_FRAME_ASPECT }}
    >
      <Image
        src="/images/ui/cta-frame-blossom.png"
        alt=""
        fill
        sizes="(max-width: 480px) 100vw, 440px"
        className="pointer-events-none -z-10 object-contain opacity-80 drop-shadow-[0_10px_22px_rgb(40_15_25_/_0.45)]"
        priority
        unoptimized
      />
      <span className="relative z-10 whitespace-pre-line text-center font-brush text-[clamp(17px,4.6vw,20px)] font-normal leading-snug tracking-[0.04em] text-white break-keep [text-shadow:0_1px_2px_rgb(60_20_35_/_0.55),0_0_12px_rgb(60_20_35_/_0.25)]">
        {children}
      </span>
    </span>
  );
}
