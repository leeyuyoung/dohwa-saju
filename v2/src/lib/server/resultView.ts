import "server-only";

import { REPORT_CHAPTERS_V1 } from "@/lib/constants/reportChapters.v1";
import { REPORT_PARTS_V2 } from "@/lib/constants/reportChapters.v2";
import { resolveReportVersion } from "@/lib/constants/reportVersion";
import { CHARM_INDICES, DOHWA_TYPES, gradeOf, withPartner } from "@/lib/constants/result";
import { buildSajuProfile, calculateSaju, readDohwa, type DohwaReading, type SajuProfile } from "@/lib/saju";
import {
  freeCharmType,
  freeFirstImpressionLine,
  freeIntroLines,
  freePartLeadIns,
  freeVibeKeywords,
} from "@/lib/saju/freeResultCopy";
import { ganjiKorean } from "@/lib/constants/sajuLabels";
import { faceTeaser, nextBloomMonth, partnerTeaser } from "@/lib/saju/teasers";
import type {
  CharmStarView,
  CurrentLuckView,
  DohwaView,
  FreeResultView,
  FullReportView,
  FullReportViewV2,
  PillarView,
} from "@/types/result";
import type { AiReportV1 } from "./ai/reportSchema.v1";
import type { AiReportV2 } from "./ai/reportSchema.v2";
import { storedReport } from "./analysis";
import { partnerPortraitSrc, reportPortraits, selfPortraitSrc } from "./portraits";
import type { AnalysisRecord } from "./store";

function pillarViews(profile: SajuProfile): PillarView[] {
  return [...profile.pillars].reverse().map((pillar) => ({
    label: pillar.label,
    stem: { hanja: pillar.stem.hanja, korean: pillar.stem.korean, element: pillar.stem.element, tenGod: pillar.stem.tenGod },
    branch: {
      hanja: pillar.branch.hanja,
      korean: pillar.branch.korean,
      element: pillar.branch.element,
      tenGod: pillar.branch.tenGod,
      twelveStage: pillar.branch.twelveStage,
    },
  }));
}

function dohwaView(reading: DohwaReading): DohwaView {
  return {
    score: reading.score,
    grade: gradeOf(reading.score),
    indices: CHARM_INDICES.map((index) => ({ ...index, score: reading.indices[index.key] })),
    type: DOHWA_TYPES[reading.typeKey],
  };
}

function birthLabel(profile: SajuProfile): string {
  const { solarDate, birthTime } = profile.calculation;
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${solarDate.year}.${pad(solarDate.month)}.${pad(solarDate.day)} (양력)`;
  return birthTime ? `${date} ${pad(birthTime.hour)}:${pad(birthTime.minute)}` : `${date} · 시간 모름`;
}

function freeView(name: string, profile: SajuProfile): FreeResultView {
  const day = profile.pillars.find((pillar) => pillar.position === "day")!;
  const reading = readDohwa(profile);
  const dohwa = dohwaView(reading);
  const charmType = freeCharmType(profile, reading);
  return {
    name,
    birthLabel: birthLabel(profile),
    dayPillarName: `${ganjiKorean(day.stem.korean, day.branch.korean)} 일주`,
    pillars: pillarViews(profile),
    birthTimeKnown: profile.calculation.hourPillar !== null,
    dohwa,
    gender: profile.calculation.gender,
    birth: { year: profile.calculation.solarDate.year, month: profile.calculation.solarDate.month },
    teasers: {
      bloom: nextBloomMonth(profile, reading),
      partner: { ...partnerTeaser(profile), portrait: partnerPortraitSrc(profile.dayMaster.element) },
      face: {
        impression: dohwa.type.plain,
        ...faceTeaser(profile, reading),
        portrait: selfPortraitSrc(reading.typeKey),
      },
    },
    preview: {
      intro: freeIntroLines(profile, reading, name),
      partLeadIns: freePartLeadIns(profile.calculation.gender),
      charmType,
      firstImpression: freeFirstImpressionLine(profile, reading),
      vibeKeywords: freeVibeKeywords(profile, reading),
    },
  };
}

function currentLuckView(profile: SajuProfile): CurrentLuckView | null {
  const period = profile.luck.periods.find((item) => item.isCurrent);
  if (!period) return null;
  return {
    startAge: period.startAge,
    endAge: period.startAge + 9,
    stemElement: period.stem.element,
    branchElement: period.branch.element,
    stemTenGod: period.stem.tenGod,
    twelveStage: period.branch.twelveStage,
  };
}

const formatKoreanDate = (time: number) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }).format(time);

/** 무료 화면용 값. 만세력 계산 결과만으로 만든다. */
export const toFreeResultView = (record: AnalysisRecord): FreeResultView => freeView(record.name, record.profile);

function charmStars(profile: SajuProfile): CharmStarView[] {
  return readDohwa(profile).stars.map((star) => ({
    key: star.key,
    name: star.name,
    hanja: star.hanja,
    found: star.positions.length > 0,
    positions: star.positions,
    score: star.score,
  }));
}

function isAiReportV1(report: unknown): report is AiReportV1 {
  return Boolean(report && typeof report === "object" && "chapters" in report && "summary" in report);
}

function isAiReportV2(report: unknown): report is AiReportV2 {
  return Boolean(report && typeof report === "object" && "part1" in report && "intro" in report);
}

/** 결제가 확인되고 리포트가 완성된 v1 기록만 전체 리포트로 변환한다. */
export function toFullReportView(record: AnalysisRecord): FullReportView | null {
  const report = storedReport(record);
  if (record.paidAt === null || !report) return null;
  if (resolveReportVersion(record.reportVersion) !== 1 || !isAiReportV1(report)) return null;

  const { profile } = record;
  return {
    ...toFreeResultView(record),
    analyzedAt: formatKoreanDate(record.createdAt),
    summary: report.summary,
    keywords: report.keywords,
    stars: charmStars(profile),
    fiveElements: {
      counts: profile.fiveElements.counts,
      dominant: profile.fiveElements.dominant,
      missing: profile.fiveElements.missing,
    },
    currentLuck: currentLuckView(profile),
    chapters: REPORT_CHAPTERS_V1.map((meta, index) => ({
      chapter: meta.chapter,
      key: meta.key,
      title: meta.title,
      subtitle: meta.subtitle,
      image: meta.image,
      headline: report.chapters[index].headline,
      sections: meta.sections.map((section, sectionIndex) => ({
        title: withPartner(section.title, profile.calculation.gender),
        paragraphs: report.chapters[index].sections[sectionIndex].paragraphs,
      })),
    })),
    loveTimeline: report.loveTimeline,
    portraits: reportPortraits(profile),
  };
}

/** 결제가 확인되고 리포트가 완성된 v2 기록만 PART 구조로 변환한다. */
export function toFullReportViewV2(record: AnalysisRecord): FullReportViewV2 | null {
  const report = storedReport(record);
  if (record.paidAt === null || !report) return null;
  if (resolveReportVersion(record.reportVersion) !== 2 || !isAiReportV2(report)) return null;

  const { profile } = record;
  const gender = profile.calculation.gender;
  const partBodies = [report.part1, report.part2, report.part3, report.part4, report.part5] as const;

  return {
    ...toFreeResultView(record),
    analyzedAt: formatKoreanDate(record.createdAt),
    intro: report.intro,
    stars: charmStars(profile),
    fiveElements: {
      counts: profile.fiveElements.counts,
      dominant: profile.fiveElements.dominant,
      missing: profile.fiveElements.missing,
    },
    currentLuck: currentLuckView(profile),
    parts: REPORT_PARTS_V2.map((meta, index) => {
      const body = partBodies[index];
      if (meta.key === "vibe" && "keywords" in body) {
        return {
          part: meta.part,
          key: meta.key,
          title: withPartner(meta.title, gender),
          question: withPartner(meta.question, gender),
          headline: body.headline,
          closingLine: body.closingLine,
          sections: [],
          keywords: body.keywords.map((keyword) => ({
            name: keyword.name,
            paragraphs: keyword.paragraphs,
          })),
        };
      }
      if (!("sections" in body) || !Array.isArray(body.sections)) {
        return {
          part: meta.part,
          key: meta.key,
          title: withPartner(meta.title, gender),
          question: withPartner(meta.question, gender),
          headline: body.headline,
          closingLine: body.closingLine,
          sections: [],
        };
      }
      return {
        part: meta.part,
        key: meta.key,
        title: withPartner(meta.title, gender),
        question: withPartner(meta.question, gender),
        headline: body.headline,
        closingLine: body.closingLine,
        sections: meta.sections.map((section, sectionIndex) => ({
          title: withPartner(section.title, gender),
          paragraphs: body.sections[sectionIndex].paragraphs,
        })),
      };
    }),
    conclusion: report.conclusion,
    portraits: reportPortraits(profile),
  };
}

/** 샘플 화면에서 도화 유형별로 보여 줄 생일. 유형은 태어난 날의 오행으로 정해진다. */
const SAMPLE_BIRTH_DAY: Record<keyof typeof DOHWA_TYPES, number> = { wood: 17, fire: 19, earth: 21, metal: 23, water: 25 };

export const isSampleType = (value: unknown): value is keyof typeof DOHWA_TYPES => typeof value === "string" && value in SAMPLE_BIRTH_DAY;

/** /result/sample 화면용. 실제 만세력으로 계산한 예시 사주다. */
export function sampleFreeResult(type: keyof typeof DOHWA_TYPES = "wood"): FreeResultView {
  const profile = buildSajuProfile(
    calculateSaju({
      birth: { calendarType: "solar", isLeapMonth: false, year: 1998, month: 4, day: SAMPLE_BIRTH_DAY[type], hour: 23, minute: 40 },
      gender: "female",
    }),
  );
  return freeView("서윤", profile);
}
