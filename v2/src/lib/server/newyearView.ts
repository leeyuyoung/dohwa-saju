import "server-only";

import { ELEMENT_LABELS, ganjiKorean } from "@/lib/constants/sajuLabels";
import { PRODUCT_NEWYEAR, productOf } from "@/lib/constants/newyear";
import { buildSajuProfile, calculateSaju, readDohwa, type SajuProfile } from "@/lib/saju";
import { buildNewYearCalendar } from "@/lib/saju/newyearCalendar";
import type { TenGodGroup } from "@/lib/saju/profileTypes";
import type { AiNewYearReport } from "./ai/reportSchema.newyear";
import { storedReport } from "./analysis";
import type { AnalysisRecord } from "./store";

const PILLAR_ORDER = ["hour", "day", "month", "year"] as const;
const PILLAR_LABEL = { year: "년주", month: "월주", day: "일주", hour: "시주" } as const;
const GROUP_LABEL: Record<TenGodGroup, string> = {
  비겁: "비겁",
  식상: "식상",
  재성: "재성",
  관성: "관성",
  인성: "인성",
};

export type NewYearPillar = {
  label: string;
  stem: string;
  branch: string;
  stemTenGod: string;
  branchTenGod: string;
};

export type NewYearFreeView = {
  name: string;
  birthLabel: string;
  dayPillarName: string;
  birthTimeKnown: boolean;
  dayMaster: string;
  pillars: NewYearPillar[];
  elements: { label: string; count: number }[];
  dominant: string;
  missing: string;
  tenGods: { label: string; count: number }[];
  stars: { name: string; where: string }[];
  years: { label: string; ganji: string }[];
  months: { label: string; ganji: string }[];
};

export type NewYearChapterView = {
  title: string;
  headline: string;
  paragraphs: string[];
};

export type NewYearReportView = Omit<NewYearFreeView, "years" | "months"> & {
  intro: string;
  chapters: NewYearChapterView[];
  years: { label: string; headline: string; paragraphs: string[] }[];
  months: { label: string; headline: string; paragraphs: string[] }[];
  closing: string;
};

function birthLabel(profile: SajuProfile): string {
  const { solarDate, birthTime } = profile.calculation;
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${solarDate.year}.${pad(solarDate.month)}.${pad(solarDate.day)} (양력)`;
  return birthTime ? `${date} ${pad(birthTime.hour)}:${pad(birthTime.minute)}` : `${date} · 시간 모름`;
}

export function toNewYearFreeView(record: AnalysisRecord): NewYearFreeView {
  const { profile } = record;
  const day = profile.pillars.find((pillar) => pillar.position === "day")!;
  const reading = readDohwa(profile);
  const calendar = buildNewYearCalendar(profile);
  const elementLabel = (key: keyof typeof ELEMENT_LABELS) => ELEMENT_LABELS[key].name;
  return {
    name: record.name,
    birthLabel: birthLabel(profile),
    dayPillarName: `${ganjiKorean(day.stem.korean, day.branch.korean)} 일주`,
    birthTimeKnown: profile.calculation.hourPillar !== null,
    dayMaster: `${profile.dayMaster.korean} · ${ELEMENT_LABELS[profile.dayMaster.element].name}`,
    pillars: PILLAR_ORDER.flatMap((position) => {
      const pillar = profile.pillars.find((item) => item.position === position);
      if (!pillar) return [];
      return [
        {
          label: PILLAR_LABEL[position],
          stem: pillar.stem.hanja,
          branch: pillar.branch.hanja,
          stemTenGod: pillar.stem.tenGod,
          branchTenGod: pillar.branch.tenGod,
        },
      ];
    }),
    elements: (Object.keys(profile.fiveElements.counts) as (keyof typeof profile.fiveElements.counts)[]).map((key) => ({
      label: elementLabel(key),
      count: profile.fiveElements.counts[key],
    })),
    dominant: profile.fiveElements.dominant.map(elementLabel).join(", ") || "없음",
    missing: profile.fiveElements.missing.map(elementLabel).join(", ") || "없음",
    tenGods: (Object.keys(GROUP_LABEL) as TenGodGroup[]).map((key) => ({
      label: GROUP_LABEL[key],
      count: profile.tenGodGroups[key],
    })),
    stars: reading.stars.map((star) => ({
      name: star.name,
      where: star.positions.length > 0 ? star.positions.map((position) => PILLAR_LABEL[position]).join(", ") : "원국에는 없음",
    })),
    years: calendar.years.map((year) => ({ label: `${year.year}`, ganji: year.korean })),
    months: calendar.months.map((month) => ({ label: `${month.month}월`, ganji: month.korean })),
  };
}

function isNewYearReport(report: unknown): report is AiNewYearReport {
  return Boolean(report && typeof report === "object" && "nature" in report && "months" in report && "years" in report);
}

/** 결제된 신년 리포트만 화면 데이터로 바꾼다. */
export function toNewYearReportView(record: AnalysisRecord): NewYearReportView | null {
  if (productOf(record) !== PRODUCT_NEWYEAR || record.paidAt === null) return null;
  const report = storedReport(record);
  if (!isNewYearReport(report)) return null;
  const free = toNewYearFreeView(record);
  const chapters = [
    { title: "출발지 점검", body: report.nature },
    { title: "기운의 지도", body: report.elements },
    { title: "인연의 경로", body: report.love },
    { title: "도화살, 홍염살, 화개살", body: report.stars },
    { title: "돈과 일의 경로", body: report.wealth },
    { title: "운전 수칙", body: report.guide },
  ];
  return {
    ...free,
    intro: report.intro,
    chapters: chapters.map((chapter) => ({
      title: chapter.title,
      headline: chapter.body.headline,
      paragraphs: chapter.body.paragraphs,
    })),
    years: report.years.map((year, index) => ({
      label: `${2027 + index}년`,
      headline: year.headline,
      paragraphs: year.paragraphs,
    })),
    months: report.months.map((month, index) => ({
      label: `${index + 1}월`,
      headline: month.headline,
      paragraphs: month.paragraphs,
    })),
    closing: report.closing,
  };
}

function sampleRecord(report: AiNewYearReport | null, paidAt: number | null): AnalysisRecord {
  const now = Date.now();
  const profile = buildSajuProfile(
    calculateSaju({
      birth: {
        calendarType: "solar",
        isLeapMonth: false,
        year: 1996,
        month: 4,
        day: 17,
        hour: 7,
        minute: 30,
      },
      gender: "female",
    }),
  );
  return {
    token: "samplenewyearreport01",
    product: PRODUCT_NEWYEAR,
    status: "ready",
    createdAt: now,
    updatedAt: now,
    name: "미리보기",
    email: null,
    phone: null,
    marketingOptIn: null,
    relationshipStatus: "single",
    concern: null,
    attribution: null,
    profile,
    report,
    reportVersion: null,
    paidAt,
    emailSentAt: null,
    emailError: null,
    reportError: null,
    reportRetryCount: 0,
    reportAlertSentAt: null,
  };
}

function placeholderReport(): AiNewYearReport {
  const chapter = (headline: string, first: string, second: string) => ({
    headline,
    paragraphs: [first, second],
  });
  return {
    intro: "이 글은 화면을 보기 위한 예시입니다. 실제 리포트는 결제 뒤에 이 사주를 읽고 다시 씁니다.",
    nature: chapter(
      "갑목 일간의 결",
      "봄에 태어난 갑목은 뻗는 힘이 먼저 보입니다. 시작하고 키우는 일에서 본색이 나옵니다.",
      "다만 줄기가 굵어지기 전에 가지를 너무 많이 내면 힘이 흩어집니다. 하나를 깊게 가져가는 해가 이 사주에 맞습니다.",
    ),
    elements: chapter(
      "수와 목이 만나는 자리",
      "오행의 많고 적음은 화면 위에서 세고, 글은 그 균형을 어떻게 쓸지만 말합니다.",
      "십성은 관계에서 어디까지 맡고 어디서 기대는지를 보여 줍니다. 숫자는 예시 문장에 넣지 않고 계산값만 유지합니다.",
    ),
    love: chapter(
      "인연이 머무는 속도",
      "연애는 빨리 달아오르기보다, 마음을 확인한 뒤에 깊어지는 쪽에 가깝습니다.",
      "결혼운은 한 해의 이벤트보다 함께 생활이 붙는 흐름으로 읽습니다. 2027년은 그 속도를 가늠하는 해입니다.",
    ),
    stars: chapter(
      "세 살이 놓인 자리",
      "도화살, 홍염살, 화개살은 원국에 있는 것만 말하고, 없는 살은 있다고 쓰지 않습니다.",
      "이 예시에서는 살의 위치만 계산으로 붙잡고, 문장은 화면이 어떻게 쌓이는지만 보여 줍니다.",
    ),
    wealth: chapter(
      "돈이 붙는 방식",
      "재물운은 한 번에 커지기보다 손에 잡는 일과 함께 늘어나는 쪽입니다.",
      "직업운은 사람을 상대하는 일과 결과를 만들어 내는 일 중에서, 올해 운의 결에 맞는 쪽을 고릅니다.",
    ),
    years: Array.from({ length: 11 }, (_, index) => ({
      headline: `${2027 + index}년의 결`,
      paragraphs: [`${2027 + index}년은 그해 세운의 간지로 일과 관계의 결을 한 단락으로 적습니다.`],
    })),
    months: Array.from({ length: 12 }, (_, index) => ({
      headline: `${index + 1}월의 쓰임`,
      paragraphs: [`${index + 1}월은 월운의 간지가 바뀌는 자리에 맞춰 그달의 초점만 짧게 적습니다.`],
    })),
    guide: chapter(
      "2027년에 남길 것",
      "개운은 오행에서 부족한 기운과 2027년 세운을 같이 보고, 생활에서 살릴 것을 고릅니다.",
      "방향, 색, 습관처럼 하루에서 반복할 수 있는 것만 남기고 투자나 질병 이야기는 넣지 않습니다.",
    ),
    closing: "예시 문장은 여기까지입니다. 실제 결제본은 같은 자리에 이 사주의 풀이가 들어갑니다.",
  };
}

export function sampleNewYearFreeView(): NewYearFreeView {
  return toNewYearFreeView(sampleRecord(null, null));
}

/** 결제 없이 유료 화면 레이아웃만 본다. 문장은 예시이고 사주 계산만 실제다. */
export function sampleNewYearReportView(): NewYearReportView {
  const view = toNewYearReportView(sampleRecord(placeholderReport(), Date.now()));
  if (!view) throw new Error("신년 예시 리포트를 만들지 못했습니다.");
  return view;
}

/** 결제 없이 그 사람의 사주로 유료 화면을 연다. 문장은 예시이고, 결제를 만들지 않는다. */
export function previewNewYearReportView(record: AnalysisRecord): NewYearReportView {
  const view = toNewYearReportView({ ...record, paidAt: record.paidAt ?? Date.now(), report: placeholderReport() });
  if (!view) throw new Error("신년 미리보기 리포트를 만들지 못했습니다.");
  return view;
}
