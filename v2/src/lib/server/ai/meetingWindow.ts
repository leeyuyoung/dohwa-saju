import "server-only";

import type { SajuProfile } from "@/lib/saju";

export type MeetingWindow = {
  /** 분석 기준일 (양력) */
  reference: { year: number; month: number; day: number };
  /** 창 시작: 기준일 다음 달 */
  start: { year: number; month: number };
  /** 창 끝: 시작부터 5개월 뒤 (총 6개월 구간) */
  end: { year: number; month: number };
  label: string;
};

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/**
 * 만남 시기 AI가 쓸 수 있는 달 구간.
 * 기준일 다음 달부터 6개월 (예: 26/11/25 → 26/12 ~ 27/5).
 */
export function meetingWindowFromProfile(profile: SajuProfile): MeetingWindow {
  const { year, month, day } = profile.referenceDate;
  const start = addMonths(year, month, 1);
  const end = addMonths(start.year, start.month, 5);
  return {
    reference: { year, month, day },
    start,
    end,
    label: `${start.year}년 ${start.month}월 ~ ${end.year}년 ${end.month}월`,
  };
}
