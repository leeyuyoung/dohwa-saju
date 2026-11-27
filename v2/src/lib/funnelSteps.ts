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

/** FateNavi(newyear) 실제 화면 흐름. 도화 단계와 겹치는 키만 공유한다. */
export const NEWYEAR_FUNNEL_STEPS = [
  "intro",
  "start",
  "concern",
  "submit",
  "checkout",
  "paid",
] as const;

export type DohwaFunnelStep = (typeof FUNNEL_STEPS)[number];
export type NewyearFunnelStep = (typeof NEWYEAR_FUNNEL_STEPS)[number];
export type FunnelStep = DohwaFunnelStep | NewyearFunnelStep;

export const FUNNEL_STEP_LABELS: Record<FunnelStep, string> = {
  intro: "인트로",
  start: "입력 시작",
  birth_date: "생년월일",
  birth_time: "출생 시간",
  name: "이름",
  concern: "고민 입력",
  submit: "분석 제출",
  result: "무료 결과",
  checkout: "결제 페이지",
  paid: "결제 완료",
};

/** FateNavi admin용 라벨 (랜딩→입력→고민→결제). */
export const NEWYEAR_FUNNEL_STEP_LABELS: Record<NewyearFunnelStep, string> = {
  intro: "랜딩",
  start: "정보 입력",
  concern: "고민 입력",
  submit: "분석 제출",
  checkout: "결제 페이지",
  paid: "결제 완료",
};

const ALL_FUNNEL_STEPS: readonly FunnelStep[] = Array.from(
  new Set<FunnelStep>([...FUNNEL_STEPS, ...NEWYEAR_FUNNEL_STEPS]),
);

export const isFunnelStep = (value: unknown): value is FunnelStep =>
  typeof value === "string" && (ALL_FUNNEL_STEPS as readonly string[]).includes(value);
