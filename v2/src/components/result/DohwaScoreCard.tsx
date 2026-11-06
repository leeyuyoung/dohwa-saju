"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { FreeResultView } from "@/types/result";

function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 36 14"
      className={`h-[13px] w-[34px] shrink-0 text-[#e8c89a]/80 ${flip ? "-scale-x-100" : ""}`}
    >
      <path d="M34 7 C24 7, 22 2, 18 2 C14 2, 12 7, 2 7" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M28 7 C22 7, 20 11, 18 11 C16 11, 14 7, 8 7" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
      <circle cx="18" cy="7" r="1.4" fill="currentColor" />
    </svg>
  );
}

function BarCap({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 18"
      className={`relative z-[2] h-5 w-3 shrink-0 text-[#e8c89a] ${flip ? "-scale-x-100" : ""}`}
    >
      <path d="M10 2 C6 4, 4 7, 4 9 C4 11, 6 14, 10 16" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 3 C5 5, 4 7.5, 4 9 C4 10.5, 5 13, 7 15" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.65" />
      <circle cx="3.5" cy="9" r="1.4" fill="currentColor" />
    </svg>
  );
}

function CharmBar({ score }: { score: number }) {
  return (
    <div className="relative flex h-6 items-center px-px">
      <BarCap />
      <div className="relative -mx-0.5 h-4 flex-1 overflow-hidden rounded-full border-[1.5px] border-[#c49a68] bg-gradient-to-b from-[#2a1838] to-[#120a1c] shadow-[inset_0_2px_4px_rgb(0_0_0_/_0.65),0_0_0_1px_rgb(90_55_30_/_0.4)]">
        <span
          className="absolute inset-y-[1.5px] left-[1.5px] overflow-hidden rounded-full bg-gradient-to-r from-[rgb(120_40_75_/_0.7)] via-[rgb(200_90_130_/_0.85)] to-[rgb(255_220_230)] shadow-[0_0_6px_rgb(255_160_190_/_0.28),inset_0_1px_0_rgb(255_255_255_/_0.4)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_18%_45%,rgb(255_255_255_/_0.7)_0_1.1px,transparent_1.6px),radial-gradient(circle_at_58%_35%,rgb(255_255_255_/_0.55)_0_1px,transparent_1.4px),radial-gradient(circle_at_90%_40%,rgb(255_255_255_/_0.8)_0_1.3px,transparent_1.8px)]"
          style={{ width: `calc(${Math.min(100, Math.max(0, score))}% - 3px)` }}
        />
      </div>
      <BarCap flip />
    </div>
  );
}

/** 도화 점수와 네 매력 지수를 장식 프레임 카드로 보여준다. 박스는 바로 두고 숫자만 떠오른다. */
export function DohwaScoreCard({ result }: { result: FreeResultView }) {
  const { dohwa } = result;

  return (
    <section className="relative isolate -mx-5 aspect-[3/4] w-[calc(100%+2.5rem)] overflow-hidden [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_11%,black_86%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_11%,black_86%,transparent_100%)]">
      <Image
        src="/images/ui/dohwa-score-bg.jpg"
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 576px"
        className="pointer-events-none object-cover object-center"
        priority={false}
      />

      <div className="absolute inset-[9.5%_8.5%_14%] z-[1] flex flex-col">
        <div className="mt-[2%] flex shrink-0 items-center justify-center gap-2.5">
          <Flourish />
          <h2 className="font-brush text-[clamp(15px,4.4vw,17px)] font-normal tracking-[0.08em] text-[#e9ddc9] [text-shadow:0_1px_6px_rgb(0_0_0_/_0.35)]">
            {result.name}의 도화 점수
          </h2>
          <Flourish flip />
        </div>

        <div className="relative mt-[6%] shrink-0 text-center before:pointer-events-none before:absolute before:top-[40%] before:left-1/2 before:z-[-1] before:h-[70%] before:w-[48%] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-[radial-gradient(ellipse,rgb(255_190_205_/_0.16),transparent_72%)] before:blur-[8px]">
          <Reveal>
            <p className="leading-none">
              <span className="bg-gradient-to-b from-[#fff8f6] via-[#f4d4d4] to-[#c9929c] bg-clip-text font-brush text-[clamp(72px,22vw,90px)] font-normal tracking-[-0.02em] text-transparent [filter:drop-shadow(0_0_8px_rgb(244_180_190_/_0.28))]">
                {dohwa.score}
              </span>
              <span className="ml-[3px] align-[20px] bg-gradient-to-b from-[#fff0f0] to-[#e0b0b8] bg-clip-text font-brush text-[clamp(20px,5.5vw,24px)] font-normal text-transparent">
                점
              </span>
            </p>
          </Reveal>
          <p className="mt-[4%] origin-center scale-y-[0.92] font-brush text-[clamp(17px,4.6vw,19px)] font-extralight tracking-[0.08em] text-[#f0e2dc] [text-shadow:0_1px_6px_rgb(0_0_0_/_0.35)]">
            {dohwa.type.name} <span className="font-extralight text-[rgb(240_226_220_/_0.82)]">· {dohwa.type.alias}</span>
          </p>
        </div>

        <div
          className="mx-[2%] mt-[5%] mb-[4%] flex shrink-0 items-center gap-2 text-[rgb(232_200_154_/_0.5)] before:h-px before:flex-1 before:bg-gradient-to-r before:from-transparent before:via-[rgb(232_200_154_/_0.5)] before:to-transparent after:h-px after:flex-1 after:bg-gradient-to-r after:from-transparent after:via-[rgb(232_200_154_/_0.5)] after:to-transparent"
          aria-hidden
        >
          <span className="size-1.5 shrink-0 rotate-45 border border-[rgb(232_200_154_/_0.65)] bg-[rgb(184_137_92_/_0.3)]" />
        </div>

        <ul className="flex min-h-0 flex-1 flex-col justify-evenly gap-[3.2%] px-[1%]">
          {dohwa.indices.map((index, i) => (
            <li key={index.key} className="grid grid-cols-[1fr_minmax(0,60%)_0.85fr] items-center gap-x-1">
              <span className="origin-right scale-y-[0.92] justify-self-end text-right font-brush text-[clamp(17px,4.5vw,18px)] font-extralight tracking-[0.06em] text-[#e6d4ce] [text-shadow:0_1px_4px_rgb(0_0_0_/_0.3)]">
                {index.label}
              </span>
              <CharmBar score={index.score} />
              <Reveal delay={0.15 + i * 0.12} className="justify-self-start">
                <span className="origin-left scale-y-[0.92] text-left font-brush text-[clamp(18px,4.7vw,19px)] font-extralight tracking-[0.03em] text-[#e2cfc6]">
                  {index.score}
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
