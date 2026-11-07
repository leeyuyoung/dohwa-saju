import type { CharmIndexKey, CharmStarKey } from "@/lib/saju/dohwa";
import type { FiveElementKey } from "@/lib/saju/profileTypes";

/**
 * 일간 오행으로 정해지는 도화 유형. 무료 화면에 그대로 보여준다. 한자는 장식으로만 쓴다.
 */
export const DOHWA_TYPES: Record<
  FiveElementKey,
  {
    hanja: string;
    name: string;
    alias: string;
    elementHanja: string;
    headline: string;
    description: string;
    story: string;
    vibes: string[];
    /** 누구나 바로 알아듣는 유형 설명 한 줄 */
    plain: string;
    /** 무료 화면의 공감 체크리스트. 앞의 둘은 이 사람의 색기가 먹히는 모습, 마지막은 정작 그걸 못 쓰고 있는 모습이다. */
    checks: [string, string, string];
  }
> = {
  wood: {
    hanja: "春風桃花",
    name: "춘풍도화",
    alias: "스며드는 봄바람",
    elementHanja: "木",
    headline: "무해한 얼굴로 사람을 무너뜨리는 꽃",
    description: "다들 너를 그저 편한 사람이라 착각하지. 정신 차려 보면 이미 네 생각에 밤을 새우는데. 그 무방비한 얼굴, 일부러 그러는 거 다 안다.",
    story: "다들 너를 그저 편한 사람이라 착각하지. 정신 차려 보면 이미 네 생각에 밤을 새우는데 말이야.",
    vibes: ["맑은 척 경계를 허무는 첫인상", "웃는 순간 상대가 무장 해제되는 얼굴", "편해서 방심했다가 빠져나오지 못하는 타입", "천천히 스며들어 끝내 지워지지 않는 여운"],
    plain: "순진한 얼굴로 사람 홀리는 타입",
    checks: ["너는 웃는 순간 상대가 무장 해제되지", "정신 차려 보면 이미 네 생각에 밤을 새우지", "근데 정작 너는, 좋아하는 사람 앞에선 평소 반도 못 보여 줘"],
  },
  fire: {
    hanja: "紅艶桃花",
    name: "홍염도화",
    alias: "타오르는 불꽃",
    elementHanja: "火",
    headline: "눈 마주친 순간 게임을 끝내는 꽃",
    description: "네가 들어서면 공기의 온도부터 달라지지. 데일 걸 알면서도 다들 너한테 손을 뻗고. 그 열기, 아직 반도 안 꺼냈잖아.",
    story: "네가 들어서면 공기의 온도부터 달라지지. 데일 걸 알면서도 다들 너한테 손을 뻗고.",
    vibes: ["한 번 보면 잊히지 않는 눈빛", "표정 하나로 분위기를 쥐락펴락하는 얼굴", "가만히 있어도 모든 시선을 훔치는 존재감", "위험한 줄 알면서도 다가오게 만드는 열기"],
    plain: "눈빛 하나로 판을 뒤집는 타입",
    checks: ["너는 가만히 있어도 모든 시선을 훔치지", "데일 걸 알면서도 다들 너한테 손을 뻗지", "근데 정작 너는, 확 끌렸다가도 좋아하는 사람 앞에선 쿨한 척해"],
  },
  earth: {
    hanja: "月下桃花",
    name: "월하도화",
    alias: "달빛 아래 꽃",
    elementHanja: "土",
    headline: "한 번 품은 자를 절대 놓아주지 않는 꽃",
    description: "멀리선 단정한 척, 고요한 척하지. 그런데 네 곁에 한 번 들어온 자는 그 온기 없이 못 살아. 그 반전이 네 색기의 정체다.",
    story: "멀리선 단정한 척, 고요한 척하지. 그런데 네 곁에 한 번 들어온 자는 그 온기 없이 못 살아.",
    vibes: ["단정한데 묘하게 눈이 가는 분위기", "가까이 갈수록 짙어지는 향", "알면 알수록 뒤통수치는 반전 매력", "한번 빠지면 다른 사람이 안 보이는 중독성"],
    plain: "알수록 빠져나갈 수 없는 타입",
    checks: ["멀리선 단정한 척, 고요한 척하지", "알면 알수록 뒤통수치는 반전 매력을 가졌구나", "근데 정작 너는, 먼저 연락하고 싶어도 꾹 참다가 타이밍을 놓쳐"],
  },
  metal: {
    hanja: "雪中桃花",
    name: "설중도화",
    alias: "눈 속에 핀 꽃",
    elementHanja: "金",
    headline: "차가워서 미치도록 갖고 싶은 꽃",
    description: "쉽게 곁을 안 내주니 다들 애가 타서 안달이지. 그 서늘함이 얼마나 치명적인지 너만 모를 때가 많아. 녹는 순간만 고를 줄 알면 돼.",
    story: "쉽게 곁을 안 내주니 다들 애가 타서 안달이지. 그 서늘함이 얼마나 치명적인지, 너만 모르는구나.",
    vibes: ["선이 또렷해서 다가가기 겁나는 도도함", "말수가 적어 밤새 곱씹게 만드는 사람", "무심하게 던진 한마디의 파괴력", "허락된 단 한 사람만 보는 녹아내린 얼굴"],
    plain: "차가워서 더 갖고 싶은 타입",
    checks: ["쉽게 곁을 안 내주니 다들 애가 타서 안달이고", "무심하게 던진 한마디에 상대는 밤새 곱씹지", "근데 정작 너는, 재고 따지다 다 놓쳐"],
  },
  water: {
    hanja: "夜來桃花",
    name: "야래도화",
    alias: "밤에 피는 꽃",
    elementHanja: "水",
    headline: "한번 빠지면 바닥이 안 보이는 꽃",
    description: "속을 알 수 없는 눈빛에 다들 한 번은 길을 잃지. 들여다볼수록 깊이 가라앉아 헤어나올 생각조차 못 해. 넌 그걸 알면서 흘리고 다니는 거고.",
    story: "속을 알 수 없는 눈빛에 다들 한 번은 길을 잃지. 들여다볼수록 깊이 가라앉아, 헤어나올 생각조차 못 해.",
    vibes: ["촉촉해서 시선이 빨려드는 눈매", "속을 몰라서 더 파고들고 싶은 분위기", "낮보다 밤에 더 위험해지는 사람", "한번 빠지면 헤어나올 수 없는 깊이"],
    plain: "속을 몰라서 더 빠지는 타입",
    checks: ["촉촉해서 시선이 빨려드는 눈매를 가졌구나", "너는 낮보다 밤에 더 위험해지지", "근데 정작 너는, 혼자 의미 부여하다 혼자 지쳐"],
  },
};

/** 도화 지수 구간. 높은 점수부터 순서대로 확인한다. */
export const DOHWA_GRADES = [
  { min: 92, hanja: "滿開", label: "활짝 핀 꽃", line: "색기가 흘러넘치는데, 정작 어디에 써야 할지 아직 모를 때가 많지." },
  { min: 88, hanja: "開花", label: "피어나는 꽃", line: "꽃은 한창인데 아직 반도 안 썼구나. 제대로 쓰는 순간, 시선은 전부 네 거다." },
  { min: 85, hanja: "半開", label: "반쯤 핀 꽃", line: "반만 꺼냈는데도 이 정도라니. 나머지 반을 쓰는 순간, 판이 뒤집히지." },
  { min: 0, hanja: "含苞", label: "꽃봉오리", line: "꽁꽁 숨겨 둔 색기가 가득하구나. 꺼내는 법만 알면, 다들 몰라봤던 걸 후회할 거다." },
] as const;

export const gradeOf = (score: number) => DOHWA_GRADES.find((grade) => score >= grade.min)!;

/** 화면에 보여주는 매력 지수. 인기력은 도화 점수 계산에만 쓰고 따로 보여주지 않는다. */
export const CHARM_INDICES: { key: CharmIndexKey; label: string; hanja: string }[] = [
  { key: "allure", label: "색기력", hanja: "桃" },
  { key: "sensual", label: "관능미", hanja: "艶" },
  { key: "flirt", label: "유혹력", hanja: "誘" },
  { key: "mystery", label: "신비력", hanja: "秘" },
];

/** meaning은 살 이름을 모르는 사람도 바로 알아듣는 한 줄 풀이 */
export const CHARM_STAR_LABELS: Record<CharmStarKey, { name: string; hanja: string; meaning: string }> = {
  dohwa: { name: "도화살", hanja: "桃花", meaning: "사람을 끌어당기는 꽃향기" },
  hongyeom: { name: "홍염살", hanja: "紅艶", meaning: "눈을 못 떼게 하는 뜨거운 색기" },
  hwagae: { name: "화개살", hanja: "華蓋", meaning: "고독해서 더 빛나는 예술가의 아우라" },
};

import { LOVE_TIMELINE_YEARS_V1, REPORT_CHAPTERS_V1, type ReportChapterKeyV1 } from "./reportChapters.v1";

/**
 * 결제 후 AI가 쓰는 연애 리포트의 장과 소제목(현재 생성용).
 * 지금은 v1 동결본을 그대로 쓴다. 장 구조를 바꿀 때는 v2 목차를 만들고 CURRENT_REPORT_VERSION을 올린 뒤 여기를 교체한다.
 * 이미 저장된 리포트는 reportChapters.v1 + reportVersion으로 계속 읽는다.
 */
export const REPORT_CHAPTERS = REPORT_CHAPTERS_V1;
export type ReportChapterKey = ReportChapterKeyV1;
export const LOVE_TIMELINE_YEARS = LOVE_TIMELINE_YEARS_V1;

export const chapterOf = (key: ReportChapterKey) => REPORT_CHAPTERS.find((chapter) => chapter.key === key)!;

export const REPORT_SECTION_COUNT = REPORT_CHAPTERS.reduce((sum, chapter) => sum + chapter.sections.length, 0);

/**
 * 유료 리포트 본문 글자 수(공백 포함: 요약·헤드라인·문단·연애타임라인).
 * 최근 결제 완료 리포트 실측 평균(~6,358자)을 반영해 6,500자로 표기. 프롬프트 목표 6,500~8,500자와 맞춘다.
 */
export const REPORT_BODY_CHARS = 6500;

/** 문구 속 {partner}·{him}을 사용자의 성별에 맞는 호칭으로 바꾼다. 여성 사용자에게 끌리는 이는 남자, 남성 사용자에게는 여자다. */
export function withPartner(text: string, gender: "female" | "male"): string {
  const female = gender === "female";
  return text.replaceAll("{partner}", female ? "남자" : "여자").replaceAll("{him}", female ? "그" : "그녀");
}

/**
 * 결과 화면 중간의 후기. 실제로 받은 후기는 sample: false, 직접 쓴 예시 문구는 sample: true로 둔다.
 * 예시 카드에는 '예시' 표시가 붙고, 평균 별점은 실제 후기로만 계산한다. 지어낸 후기를 실제 후기처럼 보여주면 표시광고법 위반이 될 수 있다.
 * zodiac은 작성자의 띠(지지 한자와 띠 이름), date는 작성일(YY. MM. DD.)
 */
export const REVIEWS = [
  {
    name: "이**",
    zodiac: { hanja: "巳", label: "뱀띠" },
    rating: 5,
    date: "26. 11. 06.",
    body: "사주에 불이 없어서 레드 포인트 하고 다니라고 해서 버건디 케이스 샀어요 감사합니다 ㅎㅎㅎ",
    sample: false,
  },
  {
    name: "김**",
    zodiac: { hanja: "卯", label: "토끼띠" },
    rating: 5,
    date: "26. 10. 17.",
    body: "아니 남자 얼굴 뭐임 진짜 내 이상형;;;",
    sample: false,
  },
  {
    name: "이**",
    zodiac: { hanja: "酉", label: "닭띠" },
    rating: 5,
    date: "26. 10. 05.",
    body: "ㅋㅋㅋ얼굴 이미지이랑 분위기 짚어주신 거 진짜 소름 돋았어요..",
    sample: false,
  },
  {
    name: "최**",
    zodiac: { hanja: "亥", label: "돼지띠" },
    rating: 5,
    date: "26. 10. 04.",
    body: "학창 시절에 인기 많았던 이유를 드디어 알았네요,, 나중에 인연 들어올 때 또 보러 올게요!",
    sample: false,
  },
  {
    name: "김**",
    zodiac: { hanja: "辰", label: "용띠" },
    rating: 5,
    date: "26. 09. 26.",
    body: "매번 나쁜 남자 만나서 연애가 힘들었는데, 단번에 이해됐어요. 피해야 할 유형 파트 진짜 강추입니다 !!",
    sample: false,
  },
  {
    name: "박**",
    zodiac: { hanja: "申", label: "원숭이띠" },
    rating: 5,
    date: "26. 09. 13.",
    body: "몰입 감이 미쳤어요. 밤마다 꺼내보고 있습니다.ㅎㅎ",
    sample: false,
  },
] as const;

export const REVIEWS_INCLUDE_SAMPLES = REVIEWS.some((review) => review.sample);

const realReviews = REVIEWS.filter((review) => !review.sample);
export const REVIEW_AVERAGE =
  realReviews.length > 0 ? (realReviews.reduce((sum, review) => sum + review.rating, 0) / realReviews.length).toFixed(1) : null;