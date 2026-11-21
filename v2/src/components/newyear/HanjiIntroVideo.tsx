"use client";

import { useRef } from "react";

const START_AT = 1;

/** FateNavi3 인트로 — 앞 1초를 건너뛰고 재생 */
export function HanjiIntroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  const jumpIfNeeded = () => {
    const video = ref.current;
    if (!video) return;
    if (video.currentTime < START_AT) {
      video.currentTime = START_AT;
    }
  };

  return (
    <video
      ref={ref}
      className="ny-hanji-poster-video"
      src="/videos/fatenavi3/intro.mp4"
      poster="/images/fatenavi3/intro.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      onLoadedMetadata={jumpIfNeeded}
      onSeeked={jumpIfNeeded}
      onTimeUpdate={jumpIfNeeded}
    />
  );
}
