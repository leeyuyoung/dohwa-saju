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

export function buildFunnelSummary(counts: Record<FunnelStep, number>): FunnelStepCount[] {
  return FUNNEL_STEPS.map((step, index) => {
    const sessions = counts[step] ?? 0;
    const prev = index === 0 ? null : (counts[FUNNEL_STEPS[index - 1]] ?? 0);
    const dropOff = prev === null || prev === 0 ? null : Math.max(0, (prev - sessions) / prev);
    return { step, label: FUNNEL_STEP_LABELS[step], sessions, dropOff };
  });
}
