import Image from "next/image";
import type { ReactNode } from "react";
import { UnlockTap } from "@/components/payment/UnlockTap";
import { OrnateFrameCard, type OrnateFrameVariant } from "@/components/result/OrnateFrameCard";
import { LockIcon } from "@/components/result/ResultParts";
import { Reveal } from "@/components/ui/Reveal";
import type { Bubble } from "@/components/webtoon/SpeechBubble";
import { WebtoonPanel } from "@/components/webtoon/WebtoonPanel";
import type { FreeResultView } from "@/types/result";

/** 카드 사이에 끼는 도화신선의 대사. 문단마다 차례로 떠오른다. */
export function SinseonLines({
  lines,
  divided = false,
  className,
}: {
  lines: ReactNode[];
  divided?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-5 text-center ${className ?? "py-14"}`}>
      {lines.map((line, index) => (
        <Reveal key={index} delay={index * 0.25} className="flex flex-col items-center gap-5">
          {divided && index > 0 && (
            <span aria-hidden className="h-10 w-px bg-gradient-to-b from-transparent via-cinnabar/70 to-transparent" />
          )}
          <p className="font-serif text-[clamp(1.2rem,5.4vw,1.4rem)] leading-relaxed text-paper break-keep [text-shadow:0_0_20px_rgb(232_137_155_/_0.25)]">
            {line}
          </p>
        </Reveal>
      ))}
    </div>
  );
}

/** 말풍선을 단 도화신선 그림 한 칸과 그 아래에 이어지는 대사 */
export function SinseonScene({
  src,
  alt,
  bubbles,
  headroom = 0.2,
  cropBottom,
  lines,
  divided,
  className,
}: {
  src: string;
  alt: string;
  bubbles: Bubble[];
  headroom?: number;
  cropBottom?: number;
  lines: ReactNode[];
  divided?: boolean;
  className?: string;
}) {
  return (
    <div className={className ?? "mt-14"}>
      <WebtoonPanel src={src} alt={alt} bubbles={bubbles} headroom={headroom} cropBottom={cropBottom} />
      {lines.length > 0 && (
        <div className="relative -mt-10">
          <SinseonLines lines={lines} divided={divided} />
        </div>
      )}
    </div>
  );
}

/** 무료 결과 PART 1~5 리드인에 쓰는 선녀 컷. */
const PART_SUNNYEO_SRC = [
  "/images/sunnyeo/holding-paper-back.jpg",
  "/images/sunnyeo/tree-lean.jpg",
  "/images/sunnyeo/hero-soft-flip.jpg",
  "/images/sunnyeo/mirror-lipstick-v2.jpg",
  "/images/sunnyeo/overshoulder-flip-v2.jpg",
] as const;

/** PART 앞 선녀 컷 + 말풍선 한 줄. */
export function PartSunnyeoLeadIn({ partIndex, line }: { partIndex: 0 | 1 | 2 | 3 | 4; line: string }) {
  const long = line.length > 28;
  const place =
    partIndex === 1
      ? ({ top: "0%", right: "5%" } as const)
      : partIndex === 3
        ? ({ top: "3%", left: "5%" } as const)
        : ({ top: "8%", left: "5%" } as const);
  return (
    <WebtoonPanel
      src={PART_SUNNYEO_SRC[partIndex]}
      alt="도화선녀"
      headroom={0}
      cropBottom={0.3}
      bubbles={[
        {
          kind: "speech",
          text: line,
          at: 0.12,
          place,
          small: long,
        } satisfies Bubble,
      ]}
    />
  );
}

/** 결과 화면의 카드 틀. 점수 카드와 같은 장식 격자 프레임. */
function TeaserCard({
  title,
  children,
  variant = "short",
}: {
  title: ReactNode;
  children: ReactNode;
  variant?: OrnateFrameVariant;
}) {
  return (
    <Reveal>
      <OrnateFrameCard variant={variant} bodyClassName="overflow-y-auto">
        <h2 className="shrink-0 border-b border-[rgb(232_200_154_/_0.22)] px-2 py-3 text-center font-serif text-[13px] tracking-[0.04em] text-gold-soft">
          {title}
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </OrnateFrameCard>
    </Reveal>
  );
}

/** 잠긴 칸. 값 대신 흐린 가짜 글자를 깔아 둔다. */
function LockedRow({ label, mask = "■■■■■■" }: { label: string; mask?: string }) {
  return (
    <UnlockTap className="flex w-full items-center gap-3 border-t border-[rgb(232_200_154_/_0.18)] px-2 py-3" label={`${label} 잠금 해제`}>
      <span className="w-[5.75rem] shrink-0 whitespace-nowrap rounded border border-[rgb(232_200_154_/_0.25)] px-1.5 py-0.5 text-center text-[11px] text-mist">
        {label}
      </span>
      <span aria-hidden className="flex-1 select-none font-serif text-[15px] text-paper/70 blur-[6px]">
        {mask}
      </span>
      <LockIcon />
    </UnlockTap>
  );
}

/** 얼굴을 가린 그림 가운데에 자물쇠를 띄운다. revealLock이면 그림은 바로 두고 자물쇠·캡션만 천천히 뜬다. */
export function LockedPicture({
  src,
  alt,
  caption,
  lockY,
  ratio,
  revealLock = false,
  blurFace = false,
  /** blurFace일 때 확대·블러 강도. 미리보기는 더 확대·약한 블러를 쓴다. */
  faceFilterClass = "scale-110 blur-[14px]",
  /** 자물쇠 아이콘만 줄인다. 캡션 글자 크기는 유지. */
  compactLock = false,
  /** soft=타원 페이드, rect=모서리 20px 사각형 */
  shape = "soft",
}: {
  src: string;
  alt: string;
  caption: string;
  lockY: string;
  /** 부모에서 크기를 잡으면 비운다 */
  ratio?: string;
  revealLock?: boolean;
  /** 결제 전 티저용. 사주별 얼굴을 쓰되 선명히 보이지 않게 한다. */
  blurFace?: boolean;
  faceFilterClass?: string;
  compactLock?: boolean;
  shape?: "soft" | "rect";
}) {
  const lock = (
    <figcaption className="absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5" style={{ top: lockY }}>
      <span
        aria-hidden
        className={`flex items-center justify-center rounded-full border border-gold/50 bg-ink/70 text-gold-soft shadow-[0_0_20px_rgb(232_137_155_/_0.45)] backdrop-blur-sm ${
          compactLock ? "size-8" : "size-12"
        }`}
      >
        <svg width={compactLock ? 15 : 22} height={compactLock ? 15 : 22} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </span>
      <span className="whitespace-nowrap rounded-full bg-ink/70 px-3 py-1 text-[11px] text-paper/90 backdrop-blur-sm">{caption}</span>
    </figcaption>
  );

  const shapeClass =
    shape === "rect"
      ? "overflow-hidden rounded-[20px]"
      : "overflow-hidden [-webkit-mask-image:radial-gradient(ellipse_at_center,black_48%,transparent_78%)] [mask-image:radial-gradient(ellipse_at_center,black_48%,transparent_78%)]";

  const figure = (
    <figure className={`relative h-full w-full ${shapeClass}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 576px"
        className={`object-cover object-top ${blurFace ? faceFilterClass : ""}`}
      />
      {revealLock ? (
        <Reveal delay={0.2} duration={1.7} className="absolute inset-0">
          {lock}
        </Reveal>
      ) : (
        lock
      )}
    </figure>
  );

  if (!blurFace) return figure;

  return (
    <UnlockTap className="relative block h-full w-full" label={`${caption} 잠금 해제`}>
      {figure}
    </UnlockTap>
  );
}

export function BloomCard({ result }: { result: FreeResultView }) {
  const { bloom } = result.teasers;
  return (
    <TeaserCard title={`${result.name}의 도화가 피는 달`} variant="short">
      <div className="flex flex-col items-center px-2 pb-3 pt-4 text-center">
        <p className="font-serif text-[clamp(1.9rem,9vw,2.4rem)] leading-none text-paper">
          {bloom.year}년 <span className="text-blossom-glow">{bloom.month}월</span>
        </p>
      </div>
      <div className="border-t border-[rgb(232_200_154_/_0.18)]">
        <LockedRow label="겹도화 해" mask="■■■■년 ■월" />
        <LockedRow label="조심할 남자" mask="■■■■ ■■■ ■■" />
      </div>
    </TeaserCard>
  );
}

/** 얼굴 사진만 보여 주는 티저. 장식 카드 없이 모서리 20px 사각형. */
function PortraitOnlyCard({
  title,
  src,
  alt,
  caption,
  lockY,
  ratio,
}: {
  title: string;
  src: string;
  alt: string;
  caption: string;
  lockY: string;
  ratio: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Reveal duration={1.25}>
        <h2 className="text-center font-serif text-[13px] tracking-[0.04em] text-gold-soft">{title}</h2>
      </Reveal>
      <LockedPicture
        src={src}
        alt={alt}
        caption={caption}
        lockY={lockY}
        ratio={ratio}
        revealLock
        blurFace
        shape="rect"
        faceFilterClass="blur-[8px]"
      />
    </div>
  );
}

export function PartnerCard({ result }: { result: FreeResultView }) {
  const { partner } = result.teasers;
  return (
    <PortraitOnlyCard
      title={`${result.name}에게 끌리는 남자`}
      src={partner.portrait}
      alt="얼굴을 흐리게 가린 남자"
      caption="그 남자의 얼굴"
      lockY="42%"
      ratio="6 / 5"
    />
  );
}

export function FaceCard({ result }: { result: FreeResultView }) {
  const { face } = result.teasers;
  return (
    <PortraitOnlyCard
      title="남자들 눈에 비친 네 얼굴"
      src={face.portrait}
      alt="거울 속 얼굴이 흐리게 가려진 모습"
      caption="그 남자가 보는 네 얼굴"
      lockY="53%"
      ratio="10 / 11"
    />
  );
}
