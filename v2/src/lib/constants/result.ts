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

/**
 * 결제 후 AI가 쓰는 연애 리포트의 장과 소제목. guide는 AI 지시문에만 쓰이고, title·subtitle은 결제 전 목차에도 보인다.
 * 장 번호는 배열 순서로 매겨진다. 장이나 소제목의 수·순서를 바꾸면 이미 저장된 리포트는 형식 검사에서 걸러져 새로 생성해야 한다.
 * 문구 속 {partner}와 {him}은 사용자의 성별에 맞춰 withPartner로 바꾼다.
 */
const CHAPTERS = [
  {
    key: "nature",
    title: "네 색기의 정체",
    subtitle: "남자들이 너한테 미치는 진짜 이유",
    image: "/images/sunnyeo/tree-lean.jpg",
    sections: [
      {
        title: "남자들이 너한테 꽂히는 진짜 이유",
        guide:
          "문단1(근거): 일간·오행·도화 유형으로 본 타고난 결을 쉬운 말로. <dohwa>의 네 매력 지수 중 가장 높은 지수 1개를 중심으로 왜 남자들이 꽂히는지 사주 근거와 연결. 출생 시간을 모르면 이 문단에서 한계를 한 번만 짧게 밝힌다. 문단2(장면): 그 매력이 실제로 드러나는 구체 장면 1개(술자리·직장·단둘·채팅 등)와 그때 남자의 반응. 문단3(조언): 지금 태도로 그 힘을 다루는 법 한 가지(말·거리감·타이밍 중 하나)를 바로 쓸 수 있게",
      },
      {
        title: "너만 모르는 네 치명적인 무기",
        guide:
          "본인은 모르지만 사내들은 알아보는 매력. 가장 짙게 드러나는 구체 장면 2개(예: 웃을 때·취할 때·단둘이 남을 때·채팅 답장 텀)와 그때 남자의 반응, 사주 근거",
      },
      {
        title: "그 색기가 독이 되는 순간",
        guide:
          "매력이 오해·질투·상처로 번지는 구체 상황 2개와 그때 나타나는 말·행동, 그 힘을 다루는 대처법(바로 쓸 문장이나 행동 포함)",
      },
    ],
  },
  {
    key: "fate",
    title: "네 운명의 남자",
    subtitle: "얼굴·키·나이, 그리고 그를 만나는 때",
    image: "/images/sunnyeo/overshoulder-flip-v2.jpg",
    sections: [
      {
        title: "네 운명의 남자: 얼굴·키·나이",
        guide:
          "사주로 본 잘 맞는 인연을 구체적인 한 사람처럼 그린다. 얼굴 인상(눈매·분위기·표정), 체격과 키를 반드시 숫자로 짚는다. 키는 '182cm 전후'처럼 cm 숫자+전후 형식으로 쓰고, 반드시 179~187cm 사이 값만 고른다(178 이하·188 이상은 절대 쓰지 않는다). 나이(이 사람보다 몇 살 위·아래인지 범위), 직업이나 분위기의 결을 반드시 짚고, 각 근거를 쉬운 말로 붙인다. 지금 곁을 맴도는 사내들과 어떻게 다른지도 한두 문장 덧붙인다",
      },
      {
        title: "네가 절대 못 버티는 위험한 남자",
        guide:
          "알면서도 끌려가는 위험한 남자의 성향(말투·연락 패턴·데이트 방식), 처음에 달콤하게 다가오는 구체 신호 2~3개, 알아채는 법과 빠져나오는 말·행동, 사주 근거",
      },
      {
        title: "그 남자가 나타나는 때와 장소",
        guide:
          "시기는 <dohwa>의 bloomMonth(무료 화면에서 이미 보여 준 도화가 피는 달)만 쓴다. 반드시 그 해·그 달 안에서만 짚고, 2028년 이후·3년 뒤·멀리 있는 해·awakening의 다른 해로 미루지 않는다. 3년 연애운 흐름·연도별 전망은 이 소제목에서 쓰지 않는다(loveTimeline에 있다). 그 달을 초반(1~10일)·중순(11~20일)·말(21일~말일) 중 하나로 좁혀 '2027년 n월 중순'처럼 쓰고, 왜 그 구간인지 사주 근거를 쉬운 말로 붙인다. 이어서 어디서(구체 장소 유형 2개 이상), 어떤 상황·시간대에, 어떻게 처음 눈이 마주치고 말이 붙는지 한 장면처럼 구체적으로 그린다",
      },
    ],
  },
  {
    key: "gaze",
    title: "남자들 눈에 비친 너",
    subtitle: "첫눈에 박히고, 밤새 떠오르는 얼굴",
    image: "/images/sunnyeo/hero-eyes-closed-v2.png",
    sections: [
      {
        title: "남자들이 몰래 곱씹는 네 첫인상",
        guide:
          "문단1: 처음 봤을 때—시선이 머무는 곳 1개+남는 잔상 1문장. 문단2: 첫 대화 직후—남는 말·태도·거리감 중 1개+그때 남자의 속마음. 문단3: 헤어진 뒤—다시 떠오르는 장면 1개. 세 시점을 모두 다루고, 전체를 관통하는 비유는 하나만. '인상 좋다'처럼 두루뭉실하게 끝내지 말 것",
      },
      {
        title: "네 얼굴에 맺힌 도화 자리",
        guide:
          "문단1(근거): 일간·오행·매력살로 왜 그 자리에 도화가 맺히는지 쉬운 말로. 문단2(포인트): 매력 포인트 정확히 2개(예: 눈빛·입매, 눈매·표정 온도 등)와 그게 살아나는 순간 1개. 문단3(연출): 그 포인트를 살리는 연출 1개+피하면 좋은 연출 1개. 외모 평가·신체 성적 묘사 금지, 분위기와 비유로만",
      },
      {
        title: "색기를 두 배로 키우는 스타일링",
        guide:
          "문단1(근거): 오행 균형으로 왜 그 색·소재·결이 이 사람에게 맞는지 쉬운 말로 연결. 문단2(룩 레시피): 반드시 대표 색 2개+피해야 할 색 1개, 상의·하의 실루엣, 소재 1~2개, 헤어 포인트 1개, 메이크업 포인트 1개, 향의 결(달콤/청량/스모키 등)+예시 계열을 구체적으로. '무난한 스타일'처럼 두루뭉실하게 끝내지 말 것. 문단3(착용 상황): 매력이 가장 살아나는 장소 2곳+시간대 1개, 그리고 '이런 날/자리에서 이렇게 입어' 장면 하나를 손에 잡히게 쓸 것",
      },
    ],
  },
  {
    key: "flirt",
    title: "남자를 무너뜨리는 법",
    subtitle: "네가 마음먹으면 버틸 남자는 없다",
    image: "/images/sunnyeo/whisper-offer.jpg",
    sections: [
      {
        title: "너만 쓸 수 있는 필승 유혹법",
        guide:
          "기질에 맞는 유혹법을 문단 3개로 고정. 문단1=시작, 문단2=밀당, 문단3=결정. 각 문단에 반드시 행동 예시 1개+말 예시 1개를 넣고, 문단3에는 가장 치명적인 상황(장소·시간대·분위기)을 한 장면으로 구체화. 단계 설명만 하고 예시 없이 끝내지 말 것",
      },
      {
        title: "밤새 곱씹게 만드는 한마디",
        guide:
          "매력적인 말투·연락 습관과 바로 써먹을 문장 예시 3개(상황별로 다르게). 답장 텀·이모지·마지막 한마디처럼 실전 디테일 포함",
      },
      {
        title: "남자가 한순간에 식는 네 습관",
        guide:
          "마음을 식히는 말버릇·행동 습관 2~3개를 장면으로 보여 주고, 각각을 고치는 대체 말·행동까지 구체적으로",
      },
    ],
  },
] as const;

export type ReportChapterKey = (typeof CHAPTERS)[number]["key"];

export const REPORT_CHAPTERS = CHAPTERS.map((chapter, index) => ({ ...chapter, chapter: index + 1 }));

export const chapterOf = (key: ReportChapterKey) => REPORT_CHAPTERS.find((chapter) => chapter.key === key)!;

export const REPORT_SECTION_COUNT = REPORT_CHAPTERS.reduce((sum, chapter) => sum + chapter.sections.length, 0);

/** 문구 속 {partner}·{him}을 사용자의 성별에 맞는 호칭으로 바꾼다. 여성 사용자에게 끌리는 이는 남자, 남성 사용자에게는 여자다. */
export function withPartner(text: string, gender: "female" | "male"): string {
  const female = gender === "female";
  return text.replaceAll("{partner}", female ? "남자" : "여자").replaceAll("{him}", female ? "그" : "그녀");
}

/** 앞으로 몇 년의 연애운을 표로 보여줄지 */
export const LOVE_TIMELINE_YEARS = 3;

/**
 * 결과 화면 중간의 후기. 실제로 받은 후기는 sample: false, 직접 쓴 예시 문구는 sample: true로 둔다.
 * 예시 카드에는 '예시' 표시가 붙고, 평균 별점은 실제 후기로만 계산한다. 지어낸 후기를 실제 후기처럼 보여주면 표시광고법 위반이 될 수 있다.
 * zodiac은 작성자의 띠(지지 한자와 띠 이름), date는 작성일(YY. MM. DD.)
 */
export const REVIEWS = [
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