"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";

/** monologue는 말풍선 없이 화면 위에 떠오르는 보는 이 자신의 속마음이다. */
export type BubbleKind = "caption" | "thought" | "monologue" | "speech" | "whisper" | "sfx";
/** 말풍선 꼬리가 향하는 쪽 */
export type Tail = "bottom-left" | "bottom-right" | "top-left" | "top-right";
export type Bubble = {
  kind: BubbleKind;
  text: string;
  /** 컷이 시작된 뒤 말풍선이 뜨는 시각(초) */
  at: number;
  /** 그림 위 자리. 그림 크기에 대한 백분율로 적는다. */
  place: Pick<CSSProperties, "top" | "left" | "right">;
  tail?: Tail;
  /** 꼬리가 말풍선 옆 끝에서 얼마나 안쪽에 붙는지(폭 대비 비율). 작을수록 끝으로 간다. */
  tailInset?: number;
  /** 짧고 힘준 한마디라 글자를 크게 키운다. */
  big?: boolean;
  /** 말풍선·글자를 한 단계 작게 잡는다. */
  small?: boolean;
};

/** 흐릿했다가 선명해지며 떠오른다. 튕기는 스프링 대신 ease를 쓴다. */
const softRise = (delay: number) =>
  ({
    initial: { opacity: 0, filter: "blur(12px)", scale: 0.95, y: 8 },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      y: 0,
      transition: { delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, filter: "blur(8px)", transition: { duration: 0.28, ease: "easeOut" } },
  }) as const;

/** 웹툰 칸 위에 얹는 말풍선. 종류마다 모양을 달리한다. */
export function SpeechBubble({ bubble }: { bubble: Bubble }) {
  if (bubble.kind === "caption") {
    return (
      <motion.p
        {...softRise(bubble.at)}
        className="absolute max-w-[74%] border border-paper/20 bg-ink/55 px-3.5 py-2 font-serif text-[13px] leading-relaxed tracking-[0.06em] text-paper/95 break-keep shadow-[0_8px_28px_rgb(0_0_0_/_0.35)] backdrop-blur-md"
        style={bubble.place}
      >
        {bubble.text}
      </motion.p>
    );
  }

  if (bubble.kind === "monologue") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: bubble.at, duration: 1.0, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0.35 } }}
        className="absolute inset-x-0 flex justify-center"
        style={bubble.place}
      >
        <p className="max-w-[calc(100%-2.25rem)] whitespace-pre-line rounded-[2rem] bg-[radial-gradient(closest-side,rgb(10_6_20_/_0.55),rgb(10_6_20_/_0.22)_75%,transparent)] px-5 py-3.5 text-center font-serif text-[clamp(15px,4.6vw,18px)] font-light leading-relaxed text-paper break-keep [text-shadow:0_1px_4px_rgba(10,6,20,0.95),0_0_14px_rgba(10,6,20,0.8)]">
          {bubble.text}
        </p>
      </motion.div>
    );
  }

  if (bubble.kind === "sfx") {
    return (
      <motion.p
        initial={{ opacity: 0, scale: 1.35, rotate: -10, filter: "blur(6px)" }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: -8,
          filter: "blur(0px)",
          transition: { delay: bubble.at, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
        }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
        className="absolute font-brush text-[clamp(2.1rem,10.5vw,3rem)] leading-none text-paper [-webkit-text-stroke:1.4px_#1a1424] [text-shadow:0_4px_18px_rgb(0_0_0_/_0.8)]"
        style={bubble.place}
      >
        {bubble.text}
      </motion.p>
    );
  }

  if (bubble.kind === "thought") {
    return (
      <motion.div {...softRise(bubble.at)} className="absolute max-w-[58%]" style={bubble.place}>
        <p className="min-w-[7.5rem] whitespace-pre-line rounded-[50%] bg-[rgb(255_246_250_/_0.72)] px-6 py-4 text-center font-gothic text-[15px] font-normal leading-snug tracking-[-0.01em] text-[#333333] break-keep shadow-[0_10px_36px_rgb(60_30_55_/_0.18),inset_0_1px_0_rgb(255_255_255_/_0.55)] backdrop-blur-[10px]">
          {bubble.text}
        </p>
        <span aria-hidden className="absolute -bottom-3 left-[26%] h-3.5 w-3.5 rounded-full bg-[rgb(255_246_250_/_0.7)] backdrop-blur-md" />
        <span aria-hidden className="absolute -bottom-5.5 left-[20%] h-2 w-2 rounded-full bg-[rgb(255_246_250_/_0.65)] backdrop-blur-sm" />
      </motion.div>
    );
  }

  const whisper = bubble.kind === "whisper";
  const small = Boolean(bubble.small);
  /** 줄바꿈을 직접 정한 대사는 그 줄이 다시 꺾이지 않도록 조금 더 넓게 둔다. CTA(small)는 기존 크기 유지. */
  const width = bubble.text.includes("\n") ? (small ? "max-w-[72%]" : "max-w-[74%]") : small ? "max-w-[60%]" : "max-w-[62%]";
  return (
    <motion.div {...softRise(bubble.at)} className={`absolute ${width}`} style={bubble.place}>
      {/* 파스텔 글래스 타원. 외곽선 없이 불투명도를 조금 높여 글자가 읽히게 한다. */}
      <div aria-hidden className="absolute inset-0">
        {bubble.tail && <BubbleTail tail={bubble.tail} inset={bubble.tailInset} whisper={whisper} layer="under" />}
        <div
          className={`absolute inset-0 rounded-[50%] backdrop-blur-[10px] ${
            whisper
              ? "bg-[rgb(74_26_58_/_0.68)] shadow-[0_12px_40px_rgb(40_10_30_/_0.35),inset_0_1px_0_rgb(255_200_220_/_0.18)]"
              : "bg-[rgb(255_255_255_/_0.9)] shadow-[0_12px_40px_rgb(60_30_55_/_0.16),inset_0_1px_0_rgb(255_255_255_/_0.7)]"
          }`}
        />
        {bubble.tail && <BubbleTail tail={bubble.tail} inset={bubble.tailInset} whisper={whisper} layer="over" />}
      </div>
      <p
        className={`relative z-10 min-w-[7.5rem] whitespace-pre-line px-6 py-7 text-center font-gothic font-normal leading-snug tracking-[-0.01em] break-keep ${
          bubble.big ? "text-[23px]" : small ? "text-[15px]" : whisper ? "text-[15px]" : "text-[16px]"
        } ${whisper ? "text-blossom-glow" : "text-[#333333]"}`}
      >
        {bubble.text}
      </p>
    </motion.div>
  );
}

const TAIL_PATH = "M5.5 0 L 7.4 24.5 Q 7.7 26, 8.4 24.8 L 16 0 Z";

/**
 * 말풍선에서 곧게 뻗어 끝이 뾰족한 꼬리.
 * 글래스 말풍선과 맞추려고 불투명 칠 대신 옅은 파스텔 채우기를 쓴다.
 */
function BubbleTail({
  tail,
  inset = 0.24,
  whisper,
  layer,
}: {
  tail: Tail;
  inset?: number;
  whisper: boolean;
  layer: "under" | "over";
}) {
  const [vertical, horizontal] = tail.split("-") as ["top" | "bottom", "left" | "right"];
  /** 타원은 가장자리로 갈수록 위아래 폭이 줄어드니, 꼬리가 끝으로 갈수록 그만큼 더 안쪽에서 시작해야 몸통에 붙어 있다. */
  const edgeGap = 50 * (1 - Math.sqrt(1 - (1 - 2 * inset) ** 2));
  const style: CSSProperties = {
    [vertical === "bottom" ? "top" : "bottom"]: `calc(100% - ${edgeGap.toFixed(1)}% - 3px)`,
    [horizontal]: `${inset * 100}%`,
    transform: `scale(${horizontal === "right" ? -1 : 1}, ${vertical === "top" ? -1 : 1})`,
  };
  const fill = whisper ? "rgba(74,26,58,0.68)" : "rgba(255,246,250,0.72)";

  return (
    <svg
      aria-hidden
      viewBox="0 0 22 26"
      className={`pointer-events-none absolute h-[26px] w-[22px] overflow-visible ${layer === "over" ? "z-20" : "z-0"}`}
      style={style}
    >
      <path d={TAIL_PATH} fill={fill} />
    </svg>
  );
}
