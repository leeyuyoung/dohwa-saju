import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ReviewCarousel } from "@/components/result/ReviewCarousel";
import { LockedPicture } from "@/components/result/TeaserCards";
import { MythicButtonLink } from "@/components/ui/MythicButtonLink";
import { REPORT_CHAPTERS, REPORT_SECTION_COUNT, withPartner } from "@/lib/constants/result";
import { HERO_COPY } from "@/lib/constants/service";

/** 미리보기용 고정 샘플 초상. 결제 전 이탈 방지용으로만 쓴다. */
const PREVIEW_PORTRAITS = {
  self: {
    src: "/images/report/preview-self.png",
    caption: "남자들 눈에 비친 너",
  },
  partner: {
    src: "/images/report/preview-partner.png",
    caption: "네 운명의 남자",
  },
} as const;

/**
 * 인트로·랜딩에서 들어가는 짧은 리포트 미리보기.
 * 전체 샘플 결과로 보내지 않고, 안에 뭐가 있는지·얼굴 예시·목차만 보여 이탈을 줄인다.
 */
export function ReportPreviewScreen() {
  return (
    <PageShell withStickyBar>
      <div className="flex flex-col gap-10 pb-8 pt-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <p className="text-[11px] tracking-[0.28em] text-gold-soft">REPORT PREVIEW</p>
          <h1 className="font-eerie text-[clamp(1.7rem,8vw,2.2rem)] leading-tight text-paper">
            리포트 안에
            <br />
            <span className="text-blossom-glow">이런 게 들어 있어</span>
          </h1>
          <p className="max-w-sm font-serif text-[15px] leading-relaxed text-mist break-keep">
            사주만 봐도, 예쁜지 아닌지가 나온다.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <p className="text-center text-[12px] tracking-[0.2em] text-cinnabar">얼굴 미리보기</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-2xl border border-line/70 bg-night/70">
              <LockedPicture
                src={PREVIEW_PORTRAITS.self.src}
                alt="얼굴을 흐리게 가린 본인 예시"
                caption={PREVIEW_PORTRAITS.self.caption}
                lockY="42%"
                ratio="3 / 4"
                blurFace
                compactLock
                faceFilterClass="scale-[1.12] blur-[3.5px]"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-line/70 bg-night/70">
              <LockedPicture
                src={PREVIEW_PORTRAITS.partner.src}
                alt="얼굴을 흐리게 가린 남자 예시"
                caption={PREVIEW_PORTRAITS.partner.caption}
                lockY="42%"
                ratio="3 / 4"
                blurFace
                compactLock
                faceFilterClass="scale-[1.12] blur-[3.5px]"
              />
            </div>
          </div>
          <p className="text-center text-[12px] text-mist-dim">실제 리포트는 네 사주에 맞춰 얼굴이 바뀐다.</p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-[12px] tracking-[0.2em] text-gold-soft">목차</p>
            <h2 className="font-serif text-[18px] text-paper">
              {REPORT_CHAPTERS.length}장 · {REPORT_SECTION_COUNT}개 풀이
            </h2>
          </div>
          <ol className="flex flex-col gap-2">
            {REPORT_CHAPTERS.map((chapter) => (
              <li
                key={chapter.key}
                className="rounded-2xl border border-line/70 bg-night/70 px-4 py-3.5"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="shrink-0 text-[11px] tracking-[0.16em] text-cinnabar">제{chapter.chapter}장</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-[15px] text-paper break-keep">
                      {withPartner(chapter.title, "female")}
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-mist break-keep">
                      {withPartner(chapter.subtitle, "female")}
                    </p>
                  </div>
                </div>
                <ul className="mt-2.5 flex flex-col gap-1 border-t border-line/50 pt-2.5 pl-0.5">
                  {chapter.sections.map((section) => (
                    <li key={section.title} className="flex items-start gap-2 text-[12.5px] text-paper/80">
                      <span aria-hidden className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-cinnabar/70" />
                      <span className="break-keep">{withPartner(section.title, "female")}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-cinnabar/35 bg-ink/50 px-4 py-4 text-center">
          <p className="font-serif text-[14px] leading-relaxed text-paper/90 break-keep">
            도화유형 · 사주 8글자 · 개화 시기 · 운명의 남자
            <br />
            얼굴·스타일 · 유혹법까지 한 권에 담는다.
          </p>
        </section>

        <ReviewCarousel />

        <div className="flex flex-col items-center gap-3">
          <MythicButtonLink href="/start">{HERO_COPY.cta}</MythicButtonLink>
          <Link href="/" className="text-[12px] text-mist underline-offset-4 hover:text-paper hover:underline">
            처음으로
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
