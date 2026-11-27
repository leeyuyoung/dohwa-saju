import "server-only";

import { PRODUCT_DOHWA, type ProductId } from "@/lib/constants/newyear";
import {
  FUNNEL_STEP_LABELS,
  FUNNEL_STEPS,
  NEWYEAR_FUNNEL_STEP_LABELS,
  NEWYEAR_FUNNEL_STEPS,
  type FunnelStep,
} from "@/lib/funnelSteps";

export {
  FUNNEL_STEP_LABELS,
  FUNNEL_STEPS,
  NEWYEAR_FUNNEL_STEP_LABELS,
  NEWYEAR_FUNNEL_STEPS,
  isFunnelStep,
  type FunnelStep,
} from "@/lib/funnelSteps";

export type FunnelEvent = {
  sessionId: string;
  step: FunnelStep;
  token: string | null;
  at: number;
  product?: ProductId;
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

export type FunnelSummaryOptions = {
  product?: ProductId;
  steps?: readonly FunnelStep[];
  labels?: Partial<Record<FunnelStep, string>>;
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

export function funnelStepsForProduct(product: ProductId = PRODUCT_DOHWA): readonly FunnelStep[] {
  return product === "newyear2027" ? NEWYEAR_FUNNEL_STEPS : FUNNEL_STEPS;
}

export function funnelLabelsForProduct(product: ProductId = PRODUCT_DOHWA): Partial<Record<FunnelStep, string>> {
  return product === "newyear2027" ? NEWYEAR_FUNNEL_STEP_LABELS : FUNNEL_STEP_LABELS;
}

export function buildFunnelSummary(
  counts: Partial<Record<FunnelStep, number>>,
  options?: FunnelSummaryOptions,
): FunnelStepCount[] {
  const steps = options?.steps ?? FUNNEL_STEPS;
  const labels = options?.labels ?? FUNNEL_STEP_LABELS;
  return steps.map((step, index) => {
    const sessions = counts[step] ?? 0;
    const prev = index === 0 ? null : (counts[steps[index - 1]] ?? 0);
    const dropOff = prev === null || prev === 0 ? null : Math.max(0, (prev - sessions) / prev);
    return {
      step,
      label: labels[step] ?? FUNNEL_STEP_LABELS[step] ?? step,
      sessions,
      dropOff,
    };
  });
}
