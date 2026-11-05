"use client";

import { useEffect, useRef } from "react";

/** 장면 그림 위에 겹치는 소리 없는 영상. 장면이 다시 열릴 때마다 처음부터 한 번 재생하고 끝 무운동 구간 앞에서 멈춘다. */
export function SceneVideo({
  src,
  active,
  endTrimSec = 0,
}: {
  src: string;
  active: boolean;
  /** 파일 끝에서 잘라 내지 않을 초. 마지막 프레임이 멈춰 보이는 구간을 건너뛴다. */
  endTrimSec?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !active) return;

    video.playbackRate = 1.4;
    video.currentTime = 0;

    const stopBeforeHold = () => {
      if (endTrimSec <= 0 || !Number.isFinite(video.duration) || video.duration <= endTrimSec) return;
      const cutAt = video.duration - endTrimSec;
      if (video.currentTime >= cutAt) {
        video.pause();
        video.currentTime = cutAt;
      }
    };

    video.addEventListener("timeupdate", stopBeforeHold);
    video.addEventListener("loadedmetadata", stopBeforeHold);
    video.play().catch(() => {
      // 저전력 모드처럼 자동 재생이 막히면 영상 첫 프레임이 그림처럼 남는다.
    });

    return () => {
      video.removeEventListener("timeupdate", stopBeforeHold);
      video.removeEventListener("loadedmetadata", stopBeforeHold);
    };
  }, [active, endTrimSec]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      playsInline
      preload="auto"
      className="absolute inset-0 h-full w-full select-none object-cover object-[50%_22%]"
    />
  );
}
