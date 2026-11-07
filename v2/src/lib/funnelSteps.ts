/** 이용·이탈을 보는 고정 퍼널 단계. 순서가 이탈률 계산 기준이다. */
export const FUNNEL_STEPS = [
  "intro",
  "start",
  "birth_date",
  "birth_time",
  "name",
  "submit",
  "result",
  "checkout",
  "paid",
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export const FUNNEL_STEP_LABELS: Record<FunnelStep, string> = {
  intro: "인트로",
  start: "입력 시작",
  birth_date: "생년월일",
  birth_time: "출생 시간",
  name: "이름",
  submit: "분석 제출",
  result: "무료 결과",
  checkout: "결제 페이지",
  paid: "결제 완료",
};

export const isFunnelStep = (value: unknown): value is FunnelStep =>
  typeof value === "string" && (FUNNEL_STEPS as readonly string[]).includes(value);
