import Link from "next/link";
import { PillarBoard } from "@/components/newyear/PillarBoard";
import { PriceCompare } from "@/components/newyear/PriceCompare";
import { RouteTimeline } from "@/components/newyear/RouteTimeline";
import { SectionHeader } from "@/components/newyear/SectionHeader";
import { SegmentCard } from "@/components/newyear/SegmentCard";
import { StickyFormCta } from "@/components/newyear/StickyFormCta";
import { type FateNaviThemeId, themeOf } from "@/lib/constants/fatenaviTheme";
import {
  NEWYEAR_CHAPTERS,
  NEWYEAR_CHECKOUT_OPEN,
  NEWYEAR_LIST_PRICE,
  NEWYEAR_REPORT_PRICE,
  NEWYEAR_RESULT_TITLE,
} from "@/lib/constants/newyear";
import { formatPrice } from "@/lib/constants/service";
import type { NewYearFreeView } from "@/lib/server/newyearView";

const ELEMENT: Record<string, string> = {
  나무: "목",
  불: "화",
  흙: "토",
  쇠: "금",
  물: "수",
};

const ELEMENT_HANJA: Record<string, string> = {
  나무: "木",
  불: "火",
  흙: "土",
  쇠: "金",
  물: "水",
};

const AGE_MARKS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;
type SignalKind = "go" | "warn" | "stop";
const SIGNAL_CYCLE: SignalKind[] = ["go", "warn", "stop"];

function birthYearOf(label: string): number | null {
  const match = label.match(/^(\d{4})\./);
  return match ? Number(match[1]) : null;
}

function hotAges(birthYear: number | null): number[] {
  if (!birthYear) return [30, 50];
  const age = 2027 - birthYear;
  const decade = Math.max(10, Math.min(100, Math.round(age / 10) * 10));
  return [decade, Math.min(100, decade + 20), Math.min(100, decade + 40)].filter(
    (value, index, list) => list.indexOf(value) === index,
  );
}

function signalForIndex(index: number): SignalKind {
  return SIGNAL_CYCLE[index % SIGNAL_CYCLE.length]!;
}

function maxBarCells(counts: number[]): number {
  return Math.max(4, ...counts, 1);
}

function teaserLetter(result: NewYearFreeView) {
  const strong = result.tenGods.slice().sort((a, b) => b.count - a.count)[0]?.label ?? "비겁";
  const weak = result.tenGods.slice().sort((a, b) => a.count - b.count)[0]?.label ?? "관성";
  return {
    core: `${result.name}님의 핵심은 ${result.dayMaster} 일간과 ${strong}의 기운입니다. 겉으로 보이는 오행은 ${result.dominant}이(가) 두드러지고, ${result.missing} 기운은 비어 있습니다.`,
    bug: `다만 지금 흐름에서는 ${weak}이(가) 약해, 아이디어와 추진은 있어도 결과를 붙잡는 힘이 흔들릴 수 있습니다. 정체 구간에서는 그 빈칸을 메우는 우회로가 필요합니다.`,
  };
}

function SignalLegend() {
  return (
    <div className="ny-signal-legend">
      <span>
        <i className="ny-signal" data-signal="go" aria-hidden />
        원활
      </span>
      <span>
        <i className="ny-signal" data-signal="warn" aria-hidden />
        주의
      </span>
      <span>
        <i className="ny-signal" data-signal="stop" aria-hidden />
        정체
      </span>
    </div>
  );
}

export function NewYearResultScreen({
  result,
  token,
  paid,
  paymentsReady,
  sample = false,
  theme = "hanji",
}: {
  result: NewYearFreeView;
  token: string;
  paid: boolean;
  paymentsReady: boolean;
  sample?: boolean;
  theme?: FateNaviThemeId;
}) {
  const config = themeOf(theme);
  const reportHref = sample ? `${config.basePath}/report/sample` : `${config.basePath}/report/${token}`;
  const checkoutHref = `${config.basePath}/checkout/${token}`;
  const ctaLabel = paid
    ? "인생 설계서 열기"
    : `${formatPrice(NEWYEAR_REPORT_PRICE)}에 전체 설계서 보기`;
  const ctaHref = paid
    ? reportHref
    : !NEWYEAR_CHECKOUT_OPEN
      ? reportHref
      : paymentsReady || sample
        ? sample
          ? null
          : checkoutHref
        : null;

  const stickyInner =
    ctaHref === null && !paid && NEWYEAR_CHECKOUT_OPEN && !paymentsReady && !sample ? (
      <p className="ny-caption text-center">결제 준비가 아직 되지 않았습니다.</p>
    ) : ctaHref === null && sample && NEWYEAR_CHECKOUT_OPEN ? (
      <span className="ny-btn">{ctaLabel}</span>
    ) : ctaHref ? (
      <Link href={ctaHref} className="ny-btn">
        {ctaLabel}
      </Link>
    ) : null;

  const isSheep = theme === "sheep";
  const isHanji = theme === "hanji";
  const isPremium = theme === "premium";
  const sticky = stickyInner ? (
    <div className="ny-poster-cta">
      {!paid && (
        <p className="ny-poster-above">
          {isSheep
            ? "메리가 집어준 다음 한 수, 지금 볼까요?"
            : isPremium
              ? "방대한 분량의 1:1 맞춤 설계서, 지금 열어보세요."
              : "같은 운명이라도 인생은 달라질 수 있습니다."}
        </p>
      )}
      {stickyInner}
    </div>
  ) : null;

  const totalGods = result.tenGods.reduce((sum, item) => sum + item.count, 0) || 1;
  const elementCounts = result.elements.map((item) => item.count);
  const cells = maxBarCells(elementCounts);
  const birthYear = birthYearOf(result.birthLabel);
  const hot = hotAges(birthYear);
  const letter = teaserLetter(result);
  const shortBirth = result.birthLabel.replace(/ \(양력\).*$/, "");

  return (
    <div className="ny-free">
      <header className="ny-free-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            isSheep
              ? "/images/fatenavi2/mery-duo.png"
              : isPremium
                ? "/images/fatenavi4/hero-zodiac.jpg?v=6"
                : "/images/fatenavi3/intro.jpg"
          }
          alt=""
          className="ny-free-hero-img"
        />
        <div className="ny-free-hero-scrim" aria-hidden />
        <div className="ny-free-hero-copy">
          {sample && <p className="ny-free-note">화면 예시 · 결제와 무관한 계산</p>}
          {isHanji ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/fatenavi3/brand-logo.png?v=5"
              alt={config.brand}
              className="ny-free-brand-logo"
            />
          ) : isSheep ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/fatenavi2/mery-face.png?v=1"
              alt={config.brand}
              className="ny-free-brand-logo ny-sheep-free-face"
            />
          ) : (
            <p className="ny-free-brand">{config.brand}</p>
          )}
          <h1 className="ny-free-title">
            {isSheep ? `${result.name}님의 레벨업 가이드` : NEWYEAR_RESULT_TITLE(result.name)}
          </h1>
          <p className="ny-free-meta">
            {shortBirth} · {result.dayPillarName} · 일간 {result.dayMaster}
          </p>
        </div>
      </header>

      <div className="ny-stack pb-8">
        {isSheep ? (
          <aside className="ny-sheep-guide">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/fatenavi2/mery-red.png"
              alt=""
              className="ny-sheep-guide-avatar"
            />
            <p className="ny-sheep-guide-copy">
              <span className="ny-sheep-guide-name">MARY</span>
              오, 이 구간은 재물 그릇이 꽉 차는데? 근데 지출 방어는 좀 해야겠다!
            </p>
          </aside>
        ) : null}
        <section className="flex flex-col gap-3">
          <p className="ny-title text-[24px]">
            {isSheep ? (
              <>
                열심히 사는데,
                <br />
                왜 레벨이 안 오를까요?
              </>
            ) : (
              <>
                열심히 사는데,
                <br />
                왜 방향이 맞는지
                <br />
                모르겠을까요?
              </>
            )}
          </p>
          <p className="ny-body">
            {isSheep ? (
              <>
                이직할까 버틸까 / 이 사람이 맞을까 / 지금 투자해도 될까.
                매번 같은 자리에서 고민하셨다면,
                노력이 부족한 게 아니라 <span className="ny-em">스탯창을 안 연 것</span>일 뿐입니다.
              </>
            ) : (
              <>
                이직할까 버틸까 / 이 사람이 맞을까 / 지금 투자해도 될까.
                매번 같은 자리에서 고민하셨다면,
                노력이 부족한 게 아니라 <span className="ny-em">지도 없이 걷고 있었을</span> 뿐입니다.
              </>
            )}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader number={1} en="Chart" title="출발지 사주판" />
          <PillarBoard pillars={result.pillars} showEmptyHour={!result.birthTimeKnown} />
          {!result.birthTimeKnown ? (
            <p className="ny-caption text-center">태어난 시간을 몰라 시주 없이 계산했습니다.</p>
          ) : null}
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader number={2} en="Elements" title="기운의 지도" />
          <p className="ny-caption">겉으로 보이는 오행의 균형입니다.</p>
          <div className="mx-auto grid max-w-xs grid-cols-5 gap-2 pt-2">
            {result.elements.map((element) => (
              <div key={element.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold" data-el={ELEMENT[element.label] ?? ""}>
                  {element.count}
                </span>
                <span className="ny-caption" data-el={ELEMENT[element.label] ?? ""}>
                  {ELEMENT_HANJA[element.label] ?? element.label}
                </span>
              </div>
            ))}
          </div>
          <p className="ny-body pt-2">
            많은 기운 {result.dominant} · 없는 기운 {result.missing}
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader number={3} en="Ten Gods" title="십성 강약" />
          <div className="ny-bar-track pt-2">
            {result.tenGods.map((group) => {
              const filled = Math.round((group.count / totalGods) * cells);
              const percent = Math.round((group.count / totalGods) * 1000) / 10;
              return (
                <div
                  key={group.label}
                  className="ny-bar"
                  style={{
                    color:
                      percent >= 25
                        ? "var(--ny-go)"
                        : percent >= 12
                          ? "var(--ny-warn)"
                          : "var(--ny-stop)",
                  }}
                >
                  <div className="ny-bar-stack">
                    {Array.from({ length: cells }, (_, index) => (
                      <span key={index} className={`ny-bar-cell${index < filled ? " is-on" : ""}`} />
                    ))}
                  </div>
                  <p className="ny-caption text-white">{group.label}</p>
                  <p className="text-xs text-white/70">{percent}%</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="ny-section-dark" style={{ marginLeft: "-1rem", marginRight: "-1rem" }}>
          <SectionHeader number={4} en="Difference" title="좋은 말만 하지 않습니다" dark />
          <p className="ny-body mt-5">
            좋은 말만 하는 사주는 위로일 뿐이에요.
            <span className="ny-em"> 운명내비</span>는 막히는 구간도 말합니다. 이유와 우회로까지요.
          </p>
          <p className="ny-body mt-3">
            미신이냐고요? 사주는 태어난 시점을 기준으로 한 명리학의 해석 체계입니다.
            운명내비는 모든 풀이에 근거를 밝힙니다.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader number={5} en="Life Arc" title="100살까지의 흐름" />
          <p className="text-white">
            미리 보이는 구간: {hot.map((age) => `${age}대`).join(", ")}
          </p>
          <SignalLegend />
          <div className="ny-age-rail mx-auto w-full max-w-[14rem]">
            {AGE_MARKS.map((age) => {
              const hotIndex = hot.indexOf(age);
              const signal = hotIndex >= 0 ? signalForIndex(hotIndex) : undefined;
              return (
                <div key={age} className={`ny-age-row${signal ? " is-hot" : ""}`}>
                  <i className="ny-signal" data-signal={signal} aria-hidden />
                  <span>{age}세</span>
                </div>
              );
            })}
          </div>
          <p className="ny-caption">신호등이 켜진 구간만 미리 보여 드립니다.</p>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader number={6} en="10-Year Route" title="앞으로 10년 경로" />
          <SignalLegend />
          <RouteTimeline />
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader number={7} en="Detours" title="정체 구간과 우회로" />
          <div className="ny-paper !p-0 overflow-hidden">
            <div className="space-y-3 p-4">
              <SegmentCard
                year="강점 구간"
                kind="go"
                ground={letter.core}
                likely="강점이 밖으로 잘 전달되는 시기"
                detour="확장을 하되, 현금과 관계를 먼저 정비하세요."
              />
              <SegmentCard
                year="주의·정체 구간"
                kind="stop"
                ground={letter.bug}
                likely="직장 변동, 지출 증가, 결정 지연"
                detour="큰 계약보다 현금 확보를 우선하고, 새 확장은 타이밍을 미루세요."
              />
            </div>
          </div>
          <p className="ny-caption">풀버전에서는 해마다 같은 카드 형식으로 이어집니다.</p>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader number={8} en="Compare" title="한 해 운세와는 단위가 다릅니다" />
          <PriceCompare />
        </section>

        <section className="ny-paper">
          <p className="ny-en mb-3">Index</p>
          <h2 className="ny-sub mb-2">인생 설계서 목차</h2>
          <ol>
            {NEWYEAR_CHAPTERS.map((chapter, index) => (
              <li key={chapter.key} className="border-b border-white/10 py-3 last:border-0">
                <p className="font-medium text-white">
                  <span className="ny-chapter-num">{index + 1}</span>
                  {chapter.title}
                </p>
                <p className="ny-caption mt-1 pl-8">{chapter.blurb}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="ny-section-dark" style={{ marginLeft: "-1rem", marginRight: "-1rem" }}>
          <SectionHeader number={9} en="Price" title="평생 다시 여는 설계서" dark />
          <p className="ny-body mt-5">
            대면 상담 한 번 비용의 일부로,
            <br />
            평생 다시 열어보는 설계서입니다.
          </p>
          <p className="mt-4 font-serif text-[28px] font-bold tracking-[-0.02em]">
            {formatPrice(NEWYEAR_REPORT_PRICE)}
            <span className="ml-2 text-[15px] font-normal text-white/45 line-through">
              {formatPrice(NEWYEAR_LIST_PRICE)}
            </span>
          </p>
        </section>

        <section className="ny-lock">
          <p className="ny-en mb-3">Locked Preview</p>
          <div className="ny-lock-body space-y-3">
            <p className="ny-sub">다음 갈림길, {result.name}님이 먼저 잡아야 할 한 수</p>
            <p className="ny-body">
              대운과 세운이 겹치는 자리, 재물과 인연이 열리는 달, 쉬어야 할 구간까지.
              지금 보이는 문장은 가려진 예시이며, 실제 풀이는 결제 뒤 설계서에서 이어집니다.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3 pb-6">
          <p className="ny-title text-[26px]">
            다음 갈림길 앞에서,
            <br />
            지도부터 펼쳐보세요.
          </p>
          <p className="ny-body">{config.slogan}</p>
        </section>
      </div>
      {sticky ? <StickyFormCta>{sticky}</StickyFormCta> : null}
    </div>
  );
}
