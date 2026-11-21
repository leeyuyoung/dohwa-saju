"use client";

import { useRef } from "react";

const START_AT = 1;
const PLAYBACK_RATE = 1.5;

/** FateNavi3 인트로 — 앞 1초를 건너뛰고 1.5배속으로 재생 */
export function HanjiIntroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  const prepare = () => {
    const video = ref.current;
    if (!video) return;
    video.playbackRate = PLAYBACK_RATE;
    if (video.currentTime < START_AT) {
      video.currentTime = START_AT;
    }
  };

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
      onLoadedMetadata={prepare}
      onPlay={prepare}
      onSeeked={jumpIfNeeded}
      onTimeUpdate={jumpIfNeeded}
    />
  );
}
