import { FunnelBeacon } from "@/components/analytics/FunnelBeacon";
import { PageShell } from "@/components/layout/PageShell";
import { CheckoutSheetProvider } from "@/components/payment/CheckoutSheetContext";
import { UnlockTap } from "@/components/payment/UnlockTap";
import { LockedPartSections, ReportToc, ReportVolume, withPartnerPlain } from "@/components/result/FreeResultParts";
import { ManseryeokTable } from "@/components/result/ManseryeokTable";
import { LockIcon } from "@/components/result/ResultParts";
import { ReviewCarousel } from "@/components/result/ReviewCarousel";
import { StickyCheckoutBar } from "@/components/result/StickyCheckoutBar";
import { FaceCard, PartnerCard } from "@/components/result/TeaserCards";
import { Reveal } from "@/components/ui/Reveal";
import { REPORT_PARTS_V2 } from "@/lib/constants/reportChapters.v2";
import { DETAILED_REPORT_ORDER_NAME } from "@/lib/constants/service";
import type { FreeResultView } from "@/types/result";

/** 결제 버튼이 이 칸에 닿은 뒤부터 화면 아래에 따라다닌다. */
const CHARM_TEASER_ID = "free-part-1";

/** 무료 결과 화면. 유료 v2와 같은 PART 목차로, AI 없이 미리보기만 연다. */
export function FreeResultScreen({
  result,
  sample = false,
  token,
  paid = false,
  paymentsReady = false,
}: {
  result: FreeResultView;
  sample?: boolean;
  token?: string;
  paid?: boolean;
  /** 결제 설정이 되어 있으면 CTA가 아래에서 시트를 연다. */
  paymentsReady?: boolean;
}) {
  const cta =
    paid && token
      ? { href: `/report/${token}`, label: "내 리포트 보러 가기" }
      : sample || !token
        ? { href: "/start", label: "숨겨진 색기 확인하기" }
        : { href: `/checkout/${token}`, label: "숨겨진 색기 확인하기" };

  const checkout =
    !paid && !sample && token && paymentsReady
      ? {
          token,
          title: DETAILED_REPORT_ORDER_NAME,
          buyerName: result.name,
        }
      : undefined;

  const [part1, part2, part3, part4, part5] = REPORT_PARTS_V2;
  const { preview } = result;
  const partnerWord = result.gender === "female" ? "남자" : "여자";

  return (
    <CheckoutSheetProvider checkout={checkout} href={cta.href}>
      <PageShell withStickyBar>
        {token && !sample ? <FunnelBeacon step="result" token={token} /> : null}
        <h1 className="sr-only">{result.name}의 도화 풀이</h1>

        <header className="relative -mx-5 overflow-hidden px-5 pb-10 pt-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(156_63_98_/_0.32),transparent_55%),linear-gradient(180deg,rgb(13_11_25)_0%,rgb(7_6_14)_100%)]"
          />
          <div className="relative flex flex-col items-center gap-4 text-center">
            <p className="text-[11px] tracking-[0.28em] text-cinnabar/90">나의 매력 발견</p>
            <h2 className="font-eerie text-[clamp(1.9rem,8vw,2.5rem)] leading-tight text-paper">
              {result.name}
              <span className="mt-2 block font-serif text-[1.05rem] font-light tracking-normal text-blossom">의 사주 미리보기</span>
            </h2>
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-16">
          <Reveal>
            <section className="flex flex-col gap-6">
              <ManseryeokTable
                name={result.name}
                dayPillarName={result.dayPillarName}
                birthLabel={result.birthLabel}
                pillars={result.pillars}
              />
              <div className="flex flex-col gap-3 font-serif text-[16px] font-light leading-[1.9] text-paper/90">
                {preview.intro.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </section>
          </Reveal>

          {/* PART 1 */}
          <Reveal>
            <article id={CHARM_TEASER_ID} className="scroll-mt-24 flex flex-col gap-6">
              <PartHeader part={part1} gender={result.gender} />
              <div className="rounded-3xl border border-cinnabar/30 bg-gradient-to-b from-crimson-deep/50 via-night/90 to-night px-5 py-6">
                <p className="text-[11px] tracking-[0.18em] text-cinnabar">타고난 매력 유형</p>
                <p className="mt-3 font-eerie text-[clamp(1.35rem,6vw,1.75rem)] leading-snug text-blossom-glow break-keep">
                  {preview.charmType.label}
                </p>
                <p className="mt-3 font-serif text-[15px] leading-relaxed text-paper/90 break-keep">{preview.charmType.vibeLine}</p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-mist break-keep">{preview.charmType.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: "도화살", hint: "사람 끌어당기는 결" },
                  { name: "홍염살", hint: "시선이 머무는 열기" },
                ].map((star) => (
                  <UnlockTap
                    key={star.name}
                    className="flex flex-col gap-1 rounded-2xl border border-line/70 bg-night/70 px-4 py-3.5 text-left"
                    label={`${star.name} 상세 잠금 해제`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-serif text-[15px] text-paper">{star.name}</span>
                      <LockIcon />
                    </span>
                    <span className="text-[12px] text-mist">{star.hint}</span>
                    <span className="mt-1 flex items-baseline gap-0.5 font-serif text-blossom-glow" aria-hidden>
                      <span className="select-none blur-[4px]">00</span>
                      <span>개</span>
                    </span>
                  </UnlockTap>
                ))}
              </div>
              <LockedPartSections part={part1} gender={result.gender} />
            </article>
          </Reveal>

          {/* PART 2 */}
          <Reveal>
            <article className="scroll-mt-24 flex flex-col gap-6">
              <PartHeader part={part2} gender={result.gender} />
              <div className="rounded-3xl border border-line/70 bg-night/70 px-5 py-5">
                <p className="text-[11px] tracking-[0.18em] text-cinnabar">첫인상 티저</p>
                <p className="mt-3 font-serif text-[15.5px] leading-[1.85] text-paper/90 break-keep">{preview.firstImpression}</p>
              </div>
              <UnlockTap className="block w-full" label="첫인상 상세 잠금 해제">
                <p className="select-none rounded-2xl border border-line/50 bg-ink/40 px-4 py-4 font-serif text-[14px] leading-relaxed text-paper/60 blur-[3px]" aria-hidden>
                  친해지면 달라지는 이미지, {partnerWord}들이 밤에 곱씹는 장면까지 — 상세 리포트에서 열어줄게.
                </p>
              </UnlockTap>
              <LockedPartSections part={part2} gender={result.gender} />
            </article>
          </Reveal>

          {/* PART 3 */}
          <Reveal>
            <article className="scroll-mt-24 flex flex-col gap-6">
              <PartHeader part={part3} gender={result.gender} />
              <ul className="flex flex-col gap-3">
                {preview.vibeKeywords.map((keyword, index) => (
                  <li key={keyword.name}>
                    <div className="rounded-3xl border border-line/70 bg-night/70 px-5 py-5">
                      <p className="text-[11px] tracking-[0.16em] text-cinnabar">키워드 {index + 1}</p>
                      <p className="mt-2 font-serif text-[clamp(1.35rem,5.5vw,1.7rem)] text-blossom">{keyword.name}</p>
                      <UnlockTap className="mt-3 block w-full" label={`${keyword.name} 상세 잠금 해제`}>
                        <p className="select-none font-serif text-[14px] leading-relaxed text-paper/55 blur-[3px]" aria-hidden>
                          이 분위기가 사주에서 어떻게 읽히고, 언제 가장 잘 드러나는지 — 본편에서 풀어줄게.
                        </p>
                      </UnlockTap>
                    </div>
                  </li>
                ))}
              </ul>
              <LockedPartSections part={part3} gender={result.gender} />
            </article>
          </Reveal>

          {/* PART 4 */}
          <Reveal>
            <article className="scroll-mt-24 flex flex-col gap-6">
              <PartHeader part={part4} gender={result.gender} />
              <FaceCard result={result} />
              <LockedPartSections part={part4} gender={result.gender} />
            </article>
          </Reveal>

          {/* PART 5 */}
          <Reveal>
            <article className="scroll-mt-24 flex flex-col gap-6">
              <PartHeader part={part5} gender={result.gender} />
              <PartnerCard result={result} />
              <LockedPartSections part={part5} gender={result.gender} />
            </article>
          </Reveal>

          <div className="mt-4 flex flex-col gap-16">
            <ReportToc gender={result.gender} />
            <ReviewCarousel />
            <ReportVolume />
          </div>
        </div>

        <StickyCheckoutBar
          href={cta.href}
          label={cta.label}
          showAfterId={paid ? undefined : CHARM_TEASER_ID}
          sheetEnabled={Boolean(checkout)}
        />
      </PageShell>
    </CheckoutSheetProvider>
  );
}

function PartHeader({
  part,
  gender,
}: {
  part: (typeof REPORT_PARTS_V2)[number];
  gender: "female" | "male";
}) {
  return (
    <header className="flex flex-col gap-2 border-b border-line/70 pb-5">
      <p className="text-[11px] tracking-[0.22em] text-cinnabar">PART {part.part}</p>
      <h2 className="font-eerie text-[clamp(1.4rem,6vw,1.85rem)] leading-snug text-paper break-keep">
        {withPartnerPlain(part.title, gender)}
      </h2>
      <p className="text-sm text-mist">{withPartnerPlain(part.question, gender)}</p>
    </header>
  );
}
