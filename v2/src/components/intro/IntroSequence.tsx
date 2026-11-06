"use client";

import Link from "next/link";
import { useEffect } from "react";
import { IntroHookRotate } from "@/components/intro/IntroHookRotate";
import { MythicButtonLink } from "@/components/ui/MythicButtonLink";
import { PortraitVideo } from "@/components/ui/PortraitVideo";
import { trackFunnel } from "@/lib/client/funnel";
import { HERO_COPY } from "@/lib/constants/service";

/**
 * 인트로 컷·말풍선 없이, 히어로 영상(무한 재생)과 CTA만 보여 준다.
 */
export function IntroSequence() {
  useEffect(() => {
    trackFunnel("intro");
  }, []);

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-black">
        <PortraitVideo
          src="/videos/intro/hero.mp4"
          loop
          filterClassName="[filter:contrast(0.98)_brightness(1.04)_saturate(0.94)_blur(0.4px)]"
        />
        {/* 상단 로고가 돋보이도록 은은한 검정 그라데이션 */}
        <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 px-6 pt-[max(3.25rem,calc(env(safe-area-inset-top)+2.5rem))]">
        <div className="relative flex w-full max-w-sm items-center justify-center gap-1.5 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/pink-magic-cloud.png"
            alt=""
            aria-hidden
            className="pointer-events-none h-auto w-[18%] max-w-[3.75rem] shrink-0 object-contain opacity-95"
          />
          <p
            className="relative shrink-0 font-brush text-[17px] tracking-[0.18em] break-keep sm:text-[18px]"
            style={{
              backgroundImage: "linear-gradient(180deg, #fff8fb 0%, #f8d0d8 48%, #e89aab 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter:
                "drop-shadow(0 0 5px rgb(244 184 194 / 0.7)) drop-shadow(0 0 12px rgb(232 137 155 / 0.4))",
            }}
          >
            타고난 색기력 분석
            <span
              aria-hidden
              className="pointer-events-none absolute -right-1 top-0 h-2 w-2 -translate-y-1/3 translate-x-1/4 rounded-full bg-white/85 blur-[0.5px]"
              style={{ boxShadow: "0 0 7px 1px rgb(255 255 255 / 0.75), 0 0 12px rgb(246 195 204 / 0.55)" }}
            />
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/pink-magic-cloud.png"
            alt=""
            aria-hidden
            className="pointer-events-none h-auto w-[18%] max-w-[3.75rem] shrink-0 -scale-x-100 object-contain opacity-95"
          />
        </div>
        <div className="relative w-[min(82%,17.5rem)]">
          {/* 구름은 로고 뒤, 로고가 제일 앞 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/pink-magic-cloud.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto w-[42%] max-w-[6rem] -translate-x-[55%] translate-y-[28%] object-contain opacity-70"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/pink-magic-cloud.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 z-0 h-auto w-[42%] max-w-[6rem] translate-x-[55%] translate-y-[28%] -scale-x-100 object-contain opacity-70"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brand/dohwa-logo-sparkle.png"
            alt="도화신당"
            className="relative z-20 h-auto w-full drop-shadow-[0_0_18px_rgb(0_0_0_/_0.55)]"
          />
        </div>
      </div>

      <main className="relative z-10 mt-auto flex w-full justify-center px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <h1 className="sr-only">
          {HERO_COPY.lead} {HERO_COPY.invite}
        </h1>
        <div className="flex w-full max-w-md flex-col items-center">
          <Link
            href="/preview"
            className="mb-2 px-2 py-1 font-sans text-xs text-paper/70 underline-offset-4 transition-colors hover:text-paper hover:underline"
          >
            결과 미리보기
          </Link>
          <IntroHookRotate />
          <div className="w-full">
            <MythicButtonLink href="/start">{HERO_COPY.cta}</MythicButtonLink>
          </div>
        </div>
      </main>
    </div>
  );
}
