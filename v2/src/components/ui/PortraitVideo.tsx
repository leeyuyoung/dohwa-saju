"use client";

import type { Ref } from "react";

/** 화면을 비율 유지한 채 가득 채운다. 강제 레터박스·9:16 프레임은 쓰지 않는다. */
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop={loop}
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover object-center ${filterClassName ?? ""}`}
      />
    </div>
  );
}
