"use client";

import type { Ref } from "react";

/**
 * 폰: 화면 가득 cover.
 * 태블릿·웹(md~): 원본 영상 크기·비율 그대로(필요 시만 화면에 맞게 축소), 바깥은 검정.
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
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop={loop}
        playsInline
        preload="auto"
        className={`h-full w-full object-cover object-center md:h-auto md:w-auto md:max-h-full md:max-w-full md:object-contain ${filterClassName ?? ""}`}
      />
    </div>
  );
}
