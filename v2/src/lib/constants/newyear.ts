/** 운명내비 종합사주. 도화 연애 리포트와 상품만 다르고 결제·저장 인프라는 공유한다. */
export const PRODUCT_DOHWA = "dohwa" as const;
export const PRODUCT_NEWYEAR = "newyear2027" as const;

export type ProductId = typeof PRODUCT_DOHWA | typeof PRODUCT_NEWYEAR;

/** 저장 행에 product가 없으면 기존 도화 리포트다. */
export function productOf(record: { product?: ProductId | null }): ProductId {
  return record.product === PRODUCT_NEWYEAR ? PRODUCT_NEWYEAR : PRODUCT_DOHWA;
}

export const NEWYEAR_BRAND = "운명내비";
export const NEWYEAR_ORDER_NAME = "운명내비 종합사주";
export const NEWYEAR_RESULT_TITLE = (name: string) => `${name}님의 인생 설계서`;
export const NEWYEAR_SLOGAN = "좋은 말만 하지 않습니다. 길을 알려드립니다.";
export const NEWYEAR_PROMISES = [
  "나쁜 구간도 말한다",
  "명리학 근거를 댄다",
  "해결책까지 준다",
] as const;

/** 결제·표시에 쓰는 런칭가. */
export const NEWYEAR_REPORT_PRICE = 19900;
/** 화면 비교용 정가. */
export const NEWYEAR_LIST_PRICE = 89900;

/**
 * CTA 위 “N명 풀이 중” 표시.
 * 런칭 전 고정값. 서비스 오픈 후 실제 수치로 교체한다.
 */
export const NEWYEAR_READING_COUNT_DISPLAY = 2314;

/** 배포 직전에 true로 켠다. false면 무료결과 결제 CTA·공통 checkout을 열지 않는다. */
export const NEWYEAR_CHECKOUT_OPEN = false;

/**
 * FateNavi2 직결제(정보입력→결제→리포트)용 주문 허용.
 * true여도 FateNavi/3 무료결과 결제 CTA는 NEWYEAR_CHECKOUT_OPEN이 연다.
 */
export const NEWYEAR_DIRECT_PAY_OPEN = true;

/** 세운 계산 범위. AI 스키마 years 길이와 맞춘다. */
export const NEWYEAR_YEAR_FROM = 2027;
export const NEWYEAR_YEAR_TO = 2037;

/** 경로 타임라인에 보이는 앞으로 10년. */
export const NEWYEAR_ROUTE_FROM = 2027;
export const NEWYEAR_ROUTE_TO = 2036;

export const NEWYEAR_CHAPTERS = [
  { key: "summary", title: "경로 요약", blurb: "강점·주의 구간·핵심 갈림길 한 장", en: "Route Summary" },
  { key: "origin", title: "출발지 점검", blurb: "타고난 기질과 사주 구조", en: "Starting Point" },
  { key: "now", title: "현재 위치", blurb: "지금 대운과 올해 결산", en: "Where I Stand" },
  { key: "arc", title: "전체 경로", blurb: "대운 흐름과 인생 3대 전환점", en: "Life Arc" },
  { key: "years", title: "구간별 안내", blurb: "2027~2036 매년 운세", en: "Year by Year" },
  { key: "destinations", title: "목적지별 분석", blurb: "돈·직업, 결혼·인연, 자식, 건강", en: "Destinations" },
  { key: "detours", title: "정체 구간과 우회로", blurb: "나쁜 운과 해결책", en: "Detours" },
  { key: "manual", title: "운전 수칙", blurb: "성공법칙·행동 원칙·체크리스트", en: "Driver Manual" },
] as const;
