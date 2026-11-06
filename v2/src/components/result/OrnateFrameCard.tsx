import Image from "next/image";
import type { ReactNode } from "react";

/** 점수 카드와 동일한 상·하 페이드 */
const FADE_DEFAULT =
  "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_11%,black_86%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_11%,black_86%,transparent_100%)]";
/** 키가 큰 카드는 제목을 더 위에 두므로 페이드도 앞당긴다 */
const FADE_TALL =
  "[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_90%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_90%,transparent_100%)]";

const VARIANTS = {
  short: {
    src: "/images/ui/ornate-card-short.jpg",
    aspect: "aspect-[4/3]",
    /** top right bottom left — 점수 카드와 비슷한 여백 */
    inset: "inset-[9.5%_8.5%_14%]",
    fade: FADE_DEFAULT,
  },
  medium: {
    src: "/images/ui/ornate-card-medium.jpg",
    aspect: "aspect-[3/4]",
    inset: "inset-[9.5%_8.5%_14%]",
    fade: FADE_DEFAULT,
  },
  tall: {
    src: "/images/ui/ornate-card-tall.jpg",
    aspect: "aspect-[9/16]",
    /** 세로가 길어서 위쪽 % 여백이 과해지므로 제목 직전까지 당긴다 */
    inset: "inset-[4.5%_8%_11%]",
    fade: FADE_TALL,
  },
} as const;

export type OrnateFrameVariant = keyof typeof VARIANTS;

type OrnateFrameCardProps = {
  variant: OrnateFrameVariant;
  children: ReactNode;
  className?: string;
  /** 안쪽 콘텐츠 영역에 추가 클래스 (스크롤·정렬 등) */
  bodyClassName?: string;
};

/**
 * 점수 카드와 같은 장식 격자 프레임을 배경으로 씌운 카드.
 * 좌우 여백 없이 화면 폭을 채우고, 위·아래는 그라데이션으로 녹인다.
 */
export function OrnateFrameCard({ variant, children, className, bodyClassName }: OrnateFrameCardProps) {
  const { src, aspect, inset, fade } = VARIANTS[variant];

  return (
    <section
      className={`relative isolate -mx-5 w-[calc(100%+2.5rem)] overflow-hidden ${aspect} ${fade} ${className ?? ""}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 576px"
        className="pointer-events-none object-cover object-center"
        priority={false}
      />
      <div className={`absolute ${inset} z-[1] flex min-h-0 flex-col overflow-hidden ${bodyClassName ?? ""}`}>
        {children}
      </div>
    </section>
  );
}
