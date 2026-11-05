import Image from "next/image";
import type { ReactNode } from "react";
import { DohwaScoreCard } from "@/components/result/DohwaScoreCard";
import { LockIcon } from "@/components/result/ResultParts";
import { Reveal } from "@/components/ui/Reveal";
import type { Bubble } from "@/components/webtoon/SpeechBubble";
import { WebtoonPanel } from "@/components/webtoon/WebtoonPanel";
import type { FreeResultView } from "@/types/result";

export { DohwaScoreCard as ScoreCard };

/** 카드 사이에 끼는 도화신선의 대사. 문단마다 차례로 떠오른다. */
export function SinseonLines({ lines, divided = false }: { lines: ReactNode[]; divided?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 py-14 text-center">
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

/** 결과 화면의 카드 틀. 어두운 종이 위에 얇은 금테를 두른다. */
function TeaserCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <Reveal>
      <section className="overflow-hidden rounded-2xl border border-gold/35 bg-night/80 shadow-[0_0_40px_rgb(232_137_155_/_0.08)]">
        <h2 className="border-b border-gold/20 px-5 py-3.5 text-center font-serif text-[14px] tracking-[0.04em] text-gold-soft">{title}</h2>
        {children}
      </section>
    </Reveal>
  );
}

/**
 * oneLine이면 글자를 줄 폭에 맞춰 줄여 한 줄로 남긴다.
 * wrap이면 같은 반응형 크기를 쓰되, 좁아지면 줄어들다 두 줄까지 허용한다.
 * 13.8은 가장 긴 첫인상 문구의 폭을 글자 크기로 나눈 값이라, 문구가 더 길어지면 함께 키워야 한다.
 */
const ROW_FLUID_SIZE = { fontSize: "clamp(11px, calc((100cqw - 7.5rem) / 13.8), 16px)" } as const;

function Row({
  label,
  oneLine = false,
  wrap = false,
  children,
}: {
  label: string;
  oneLine?: boolean;
  wrap?: boolean;
  children: ReactNode;
}) {
  const fluid = oneLine || wrap;
  return (
    <div
      className={`flex items-center gap-4 border-t border-line/40 px-5 py-3.5 first:border-t-0 ${fluid ? "[container-type:inline-size]" : ""}`}
    >
      <span className="w-[6.5rem] shrink-0 whitespace-nowrap rounded border border-gold/30 px-2 py-0.5 text-center text-[12px] text-gold-soft">
        {label}
      </span>
      {oneLine ? (
        <span className="flex-1 whitespace-nowrap font-serif text-paper" style={ROW_FLUID_SIZE}>
          {children}
        </span>
      ) : wrap ? (
        <span className="line-clamp-2 flex-1 break-keep font-serif leading-snug text-paper" style={ROW_FLUID_SIZE}>
          {children}
        </span>
      ) : (
        <span className="flex-1 break-keep font-serif text-[16px] text-paper">{children}</span>
      )}
    </div>
  );
}

/** 잠긴 칸. 값 대신 흐린 가짜 글자를 깔아 둔다. */
function LockedRow({ label, mask = "■■■■■■" }: { label: string; mask?: string }) {
  return (
    <div className="flex items-center gap-4 border-t border-line/40 px-5 py-3.5">
      <span className="w-[6.5rem] shrink-0 whitespace-nowrap rounded border border-line/60 px-2 py-0.5 text-center text-[12px] text-mist">{label}</span>
      <span aria-label="잠김" className="flex-1 select-none font-serif text-[16px] text-paper/70 blur-[6px]">
        {mask}
      </span>
      <LockIcon />
    </div>
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
}: {
  src: string;
  alt: string;
  caption: string;
  lockY: string;
  ratio: string;
  revealLock?: boolean;
  /** 결제 전 티저용. 사주별 얼굴을 쓰되 선명히 보이지 않게 한다. */
  blurFace?: boolean;
  faceFilterClass?: string;
  compactLock?: boolean;
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

  return (
    <figure className="relative overflow-hidden" style={{ aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 576px"
        className={`object-cover object-top ${blurFace ? faceFilterClass : ""}`}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent" />
      {revealLock ? (
        <Reveal delay={0.2} duration={1.7} className="absolute inset-0">
          {lock}
        </Reveal>
      ) : (
        lock
      )}
    </figure>
  );
}

/** 그림은 바로 두고, 제목·텍스트·자물쇠만 천천히 띄우는 카드. */
function SlowTextTeaserCard({
  title,
  picture,
  rows,
}: {
  title: ReactNode;
  picture: ReactNode;
  rows: ReactNode[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gold/35 bg-night/80 shadow-[0_0_40px_rgb(232_137_155_/_0.08)]">
      <Reveal duration={1.25}>
        <h2 className="border-b border-gold/20 px-5 py-3.5 text-center font-serif text-[14px] tracking-[0.04em] text-gold-soft">{title}</h2>
      </Reveal>
      {picture}
      {rows.map((row, index) => (
        <Reveal key={index} delay={0.2 + index * 0.18} duration={1.2}>
          {row}
        </Reveal>
      ))}
    </section>
  );
}

export function BloomCard({ result }: { result: FreeResultView }) {
  const { bloom } = result.teasers;
  return (
    <TeaserCard title={`${result.name}의 도화가 피는 달`}>
      <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-6 text-center">
        <p className="font-serif text-[clamp(2.2rem,11vw,2.8rem)] leading-none text-paper">
          {bloom.year}년 <span className="text-blossom-glow">{bloom.month}월</span>
        </p>
        <p className="text-[13px] text-mist">
          {bloom.month}월 초 ~ {(bloom.month % 12) + 1}월 초 · {bloom.hanja}月
        </p>
      </div>
      <div className="border-t border-line/40">
        <LockedRow label="겹도화 해" mask="■■■■년 ■월" />
        <LockedRow label="조심할 남자" mask="■■■■ ■■■ ■■" />
      </div>
    </TeaserCard>
  );
}

export function PartnerCard({ result }: { result: FreeResultView }) {
  const { partner } = result.teasers;
  return (
    <SlowTextTeaserCard
      title={`${result.name}에게 끌리는 남자`}
      picture={
        <LockedPicture
          src={partner.portrait}
          alt="얼굴을 흐리게 가린 남자"
          caption="그 남자의 얼굴"
          lockY="42%"
          ratio="9 / 8"
          revealLock
          blurFace
        />
      }
      rows={[
        <Row key="vibe" label="분위기">{partner.vibe}</Row>,
        <Row key="age" label="나이">{partner.age}</Row>,
        <Row key="build" label="체격·키">{partner.build}</Row>,
        <LockedRow key="job" label="직업" mask="■■■ ■■■■" />,
        <LockedRow key="place" label="처음 만나는 곳" mask="■■ ■■■ ■■" />,
      ]}
    />
  );
}

export function FaceCard({ result }: { result: FreeResultView }) {
  const { face } = result.teasers;
  return (
    <div className="flex flex-col">
      <SlowTextTeaserCard
        title="남자들 눈에 비친 네 얼굴"
        picture={
          <LockedPicture
            src={face.portrait}
            alt="거울 속 얼굴이 흐리게 가려진 모습"
            caption="그 남자가 보는 네 얼굴"
            lockY="53%"
            ratio="10 / 11"
            revealLock
            blurFace
          />
        }
        rows={[
          <Row key="impression" label="첫인상" oneLine>
            {face.impression}
          </Row>,
          <Row key="point" label="매력 포인트" wrap>
            {face.point}
          </Row>,
          <LockedRow key="line" label="필살 멘트" mask="■■■ ■■ ■■" />,
          <LockedRow key="scene" label="잊지 못할 장면" mask="■■■■ ■■■" />,
        ]}
      />

      <SinseonLines
        lines={[
          <>
            사주에 따라 보여지는
            <br />
            <span className="text-blossom-glow">얼굴 이미지</span>도 다른 거 알아?
          </>,
        ]}
      />

      <TeaserCard title="이렇게만 바꾸면 남자들이 못 참을 텐데">
        <div className="flex items-center gap-4 px-5 py-3.5">
          <span className="w-[6.5rem] shrink-0 whitespace-nowrap rounded border border-gold/30 px-2 py-0.5 text-center text-[12px] text-gold-soft">포인트 컬러</span>
          <span aria-hidden className="size-5 shrink-0 rounded-full border border-white/30" style={{ backgroundColor: face.color.hex }} />
          <span className="flex-1 font-serif text-[16px] text-paper">
            {face.color.name}
          </span>
        </div>
        <LockedRow label="헤어·메이크업" mask="■■■ ■■ ■■■" />
        <LockedRow label="어울리는 향" mask="■■■ ■■" />
        <LockedRow label="예뻐 보이는 때" mask="■■ ■시 ■■" />
      </TeaserCard>
    </div>
  );
}
