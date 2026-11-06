"use client";

import type { Ref } from "react";

/**
 * 전체 화면은 검정. 영상만 9:16으로 가운데에 두고 양옆·위아래는 레터박스.
 * (웹 가로에서 object-cover로 좌우가 늘어나 보이던 문제 방지)
 */
export function PortraitVideo({
  src,
  videoRef,
  filterClassName,
  loop = false,
}: {
  src: string;
  videoRef?: Ref<HTMLVideoElement>;
  filterClassName?: string;
  loop?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: "min(100vw, calc(100dvh * 9 / 16))",
          height: "min(100dvh, calc(100vw * 16 / 9))",
          aspectRatio: "9 / 16",
        }}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop={loop}
          playsInline
          preload="auto"
          className={`absolute inset-0 h-full w-full object-contain object-center ${filterClassName ?? ""}`}
        />
      </div>
    </div>
  );
}
