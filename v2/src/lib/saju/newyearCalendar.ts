import "server-only";

import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  calculateFourPillars,
  getBranchTenGod,
  getEarthlyBranchElement,
  getHeavenlyStemElement,
  getTenGod,
  type EarthlyBranch,
  type HeavenlyStem,
} from "manseryeok";
import { NEWYEAR_YEAR_FROM, NEWYEAR_YEAR_TO } from "@/lib/constants/newyear";
import type { LuckCycle, SajuProfile, YearFortune } from "./profileTypes";
import { ELEMENT_KEY, branchHanja, stemHanja, twelveStage } from "./tables";

export type MonthFortune = {
  year: number;
  month: number;
  korean: string;
  hanja: string;
  stem: YearFortune["stem"];
  branch: YearFortune["branch"];
};

export type NewYearCalendar = {
  years: YearFortune[];
  months: MonthFortune[];
};

const YEAR_COUNT = NEWYEAR_YEAR_TO - NEWYEAR_YEAR_FROM + 1;

/** buildSajuProfile의 연간지와 같은 식이다. 기본 10년 세운 계산은 바꾸지 않는다. */
function ganjiOfYear(year: number) {
  const stem = HEAVENLY_STEMS[(((year - 4) % 10) + 10) % 10];
  const branch = EARTHLY_BRANCHES[(((year - 4) % 12) + 12) % 12];
  return { stem, branch };
}

function dateKey(year: number, month: number, day: number) {
  return year * 10_000 + month * 100 + day;
}

function luckIndexForYear(luck: LuckCycle, year: number): number | null {
  const midYear = dateKey(year, 7, 1);
  const period = [...luck.periods]
    .reverse()
    .find((candidate) => dateKey(candidate.startYear, candidate.startMonth, 1) <= midYear);
  return period ? period.index : null;
}

function stemSide(dayMaster: HeavenlyStem, stem: HeavenlyStem): YearFortune["stem"] {
  return {
    korean: stem,
    element: ELEMENT_KEY[getHeavenlyStemElement(stem)],
    tenGod: getTenGod(dayMaster, stem),
  };
}

function branchSide(dayMaster: HeavenlyStem, branch: EarthlyBranch): YearFortune["branch"] {
  return {
    korean: branch,
    element: ELEMENT_KEY[getEarthlyBranchElement(branch)],
    tenGod: getBranchTenGod(dayMaster, branch),
    twelveStage: twelveStage(dayMaster, branch),
  };
}

/**
 * 2027~2037 세운과 2027년 1~12월 월운.
 * 월운은 양력 달의 15일 정오에 놓인 월주다. 월주는 절기에 따라 바뀐다.
 */
export function buildNewYearCalendar(profile: SajuProfile): NewYearCalendar {
  const dayMaster = profile.dayMaster.korean;
  const birthYear = profile.calculation.solarDate.year;
  const years: YearFortune[] = Array.from({ length: YEAR_COUNT }, (_, offset) => {
    const year = NEWYEAR_YEAR_FROM + offset;
    const { stem, branch } = ganjiOfYear(year);
    return {
      year,
      age: year - birthYear,
      korean: `${stem}${branch}`,
      hanja: `${stemHanja(stem)}${branchHanja(branch)}`,
      stem: stemSide(dayMaster, stem),
      branch: branchSide(dayMaster, branch),
      luckIndex: luckIndexForYear(profile.luck, year),
    };
  });

  const months: MonthFortune[] = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const detail = calculateFourPillars({
      year: NEWYEAR_YEAR_FROM,
      month,
      day: 15,
      hour: 12,
      minute: 0,
      isLunar: false,
      dayBoundary: "midnight",
      gender: profile.calculation.gender,
    });
    const stem = detail.month.heavenlyStem;
    const branch = detail.month.earthlyBranch;
    return {
      year: NEWYEAR_YEAR_FROM,
      month,
      korean: `${stem}${branch}`,
      hanja: `${stemHanja(stem)}${branchHanja(branch)}`,
      stem: stemSide(dayMaster, stem),
      branch: branchSide(dayMaster, branch),
    };
  });

  return { years, months };
}
