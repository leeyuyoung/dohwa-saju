import "server-only";

import { FUNNEL_STEP_LABELS, FUNNEL_STEPS, type FunnelStep } from "@/lib/funnelSteps";

export { FUNNEL_STEP_LABELS, FUNNEL_STEPS, isFunnelStep, type FunnelStep } from "@/lib/funnelSteps";

export type FunnelEvent = {
  sessionId: string;
  step: FunnelStep;
  token: string | null;
  at: number;
};

export type FunnelStepCount = {
  step: FunnelStep;
  label: string;
  sessions: number;
  /** 직전 단계 대비 이탈률(0~1). 첫 단계는 null. */
  dropOff: number | null;
};

/** 퍼널 집계 기간. fromMs 이상, toMsExclusive 미만(보통 다음 날 00:00 KST). */
export type FunnelSummaryRange = {
  fromMs?: number;
  toMsExclusive?: number;
};

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** 관리자 쿼리의 YYYY-MM-DD(KST)를 밀리초 범위로 바꾼다. 둘 다 없으면 undefined. */
export function parseFunnelDateRange(from: string | null, to: string | null): FunnelSummaryRange | undefined {
  const fromOk = Boolean(from && YMD.test(from));
  const toOk = Boolean(to && YMD.test(to));
  if (!fromOk && !toOk) return undefined;
  const range: FunnelSummaryRange = {};
  if (fromOk && from) range.fromMs = Date.parse(`${from}T00:00:00+09:00`);
  if (toOk && to) range.toMsExclusive = Date.parse(`${to}T00:00:00+09:00`) + 24 * 60 * 60 * 1000;
  return range;
}

export function buildFunnelSummary(counts: Record<FunnelStep, number>): FunnelStepCount[] {
  return FUNNEL_STEPS.map((step, index) => {
    const sessions = counts[step] ?? 0;
    const prev = index === 0 ? null : (counts[FUNNEL_STEPS[index - 1]] ?? 0);
    const dropOff = prev === null || prev === 0 ? null : Math.max(0, (prev - sessions) / prev);
    return { step, label: FUNNEL_STEP_LABELS[step], sessions, dropOff };
  });
}
