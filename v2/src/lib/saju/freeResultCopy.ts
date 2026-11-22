import { CHARM_INDICES } from "@/lib/constants/result";
import { ganjiKorean, josa } from "@/lib/constants/sajuLabels";
import type { CharmIndexKey, DohwaReading } from "./dohwa";
import type { FiveElementKey, SajuProfile } from "./profileTypes";

/**
 * 무료 결과 카피. AI 없이 만세력·도화 판독만으로 같은 사주는 항상 같은 문장이 나온다.
 */

/** 무료 색기력 티저. 1등 축에 맞춰 고정 템플릿 2문장. */
export const SAEKGI_AXIS_COPY: Record<CharmIndexKey, [string, string]> = {
  sensual: [
    "아무것도 하지 않았는데 상대의 상상력을 자극하는 사람이야.",
    "본능부터 자극하는 타고난 색기를 가졌어.",
  ],
  flirt: [
    "상대의 욕망을 자극하고 애타게 만드는, 치명적인 밀당의 기술을 가졌네.",
    "상대를 더 갈망하게 만들어.",
  ],
  enchant: [
    "노골적이지 않아도 묘하게 야한 분위기를 풍기는 사람이야.",
    "한 번 빠지면 헤어 나오기 힘든, 은밀한 색기를 가졌어.",
  ],
};

export type FreeSaekgiTeaser = {
  score: number;
  axisKey: CharmIndexKey;
  axisLabel: string;
  lines: [string, string];
};

/** 색기력 점수·1등 축으로 무료 티저 카피를 고른다. AI 없음. */
export function freeSaekgiTeaser(reading: DohwaReading): FreeSaekgiTeaser {
  const top = CHARM_INDICES.reduce((best, index) =>
    reading.indices[index.key] > reading.indices[best.key] ? index : best,
  );
  return {
    score: reading.score,
    axisKey: top.key,
    axisLabel: top.label,
    lines: SAEKGI_AXIS_COPY[top.key],
  };
}

export type FreeCharmType = {
  label: string;
  vibeLine: string;
  reason: string;
};

export type FreeVibeKeyword = { name: string };

const CHARM_BY_ELEMENT: Record<FiveElementKey, FreeCharmType> = {
  wood: {
    label: "볼수록 빠져드는 은은한 매력형",
    vibeLine: "부드럽고 편안한 분위기지만, 웃는 순간 묘하게 사람을 설레게 하는 타입이야.",
    reason:
      "네 일간에는 나무의 기운이 있어. 자연스럽게 경계를 풀어주는 매력이 있지. 처음엔 편한 사람이라 착각하다가, 정신 차려 보면 네 생각에 빠져 있어.",
  },
  fire: {
    label: "첫인상부터 시선을 끄는 화려한 매력형",
    vibeLine: "등장만으로 분위기를 바꾸고, 한 번 마주치면 쉽게 잊히지 않는 타입이야.",
    reason:
      "네 일간에는 불의 기운이 있어. 눈빛과 표정만으로도 분위기를 압도하지. 가만히 있어도 시선이 따라붙는 이유야.",
  },
  earth: {
    label: "차분하지만 강한 존재감을 지닌 매력형",
    vibeLine: "차분하고 단정해 보이지만, 가까워질수록 깊은 매력이 느껴지는 타입이야.",
    reason:
      "네 일간에는 흙의 기운이 있어. 곁에 있으면 편안해지고 자연스럽게 마음을 기대게 되지. 알수록 쉽게 놓기 어려운 매력이야.",
  },
  metal: {
    label: "우아하고 고급스러운 분위기형",
    vibeLine: "쉽게 마음을 드러내지 않아서, 오히려 더 궁금하고 끌리는 타입이야.",
    reason:
      "네 일간에는 금의 기운이 있어. 차가워보이는 태도와 말을 아끼는 절제가 네 매력이지. 다가가기 어려울수록 더 눈길이 가는 법이야.",
  },
  water: {
    label: "신비롭고 쉽게 잊히지 않는 매력형",
    vibeLine: "알 듯 말 듯한 신비로운 분위기로, 한 번 빠지면 쉽게 헤어나오기 어려운 타입이야.",
    reason:
      "네 일간에는 물의 기운이 있어. 눈매가 깊고, 속을 쉽게 읽을 수 없는 분위기가 매력이지. 알면 알수록 더 알고 싶어지는 사람이야.",
  },
};

/** 화개·홍염이 원국에 있으면 유형 라벨을 한 단계 더 또렷하게 바꾼다. */
function refineCharmType(base: FreeCharmType, reading: DohwaReading): FreeCharmType {
  const hongyeom = reading.stars.find((star) => star.key === "hongyeom");
  const hwagae = reading.stars.find((star) => star.key === "hwagae");
  if (hongyeom && hongyeom.positions.length > 0) {
    return {
      label: "첫인상부터 시선을 끄는 화려한 매력형",
      vibeLine: "가만히 있어도 시선이 쏠리고, 특별히 꾸미지 않아도 묘한 매력이 풍기는 타입이야.",
      reason: `${base.reason} 여기에 홍염살까지 더해져, 사람들의 시선을 끌어당기는 힘이 더 세.`,
    };
  }
  if (hwagae && hwagae.positions.length > 0) {
    return {
      label: "신비롭고 쉽게 잊히지 않는 매력형",
      vibeLine: "자신만의 분위기가 뚜렷해서, 스쳐 지나가도 오래도록 기억에 남는 타입이야.",
      reason: `${base.reason} 여기에 화개살까지 더해져, 남들과 다른 독특한 분위기가 더해져.`,
    };
  }
  return base;
}

export function freeCharmType(profile: SajuProfile, reading: DohwaReading): FreeCharmType {
  return refineCharmType(CHARM_BY_ELEMENT[reading.typeKey], reading);
}

export function freeIntroLines(profile: SajuProfile, reading: DohwaReading, name: string): [string, string] {
  const type = freeCharmType(profile, reading);
  const day = profile.pillars.find((pillar) => pillar.position === "day")!;
  const starHits = reading.stars.filter((star) => star.positions.length > 0).map((star) => star.name);
  const starHint =
    starHits.length > 0
      ? `네 사주에 ${starHits.join("·")}이 있네. 사람을 끌어당기는 너만의 매력, 이제부터 하나씩 알려줄게.`
      : "겉으로 요란한 매력살보단, 고유한 매력이 숨어 있어. 그 매력이 어떤 모습으로 드러나는지 알려줄게.";
  return [
    `${name}, 네 일주는 ${josa(ganjiKorean(day.stem.korean, day.branch.korean), "이야", "야")}. ${type.vibeLine}`,
    starHint,
  ];
}

/** PART 1~5 앞에 붙는 말투 리드인. 인트로와 같은 반말로 이어 준다. */
export function freePartLeadIns(gender: "female" | "male"): [string, string, string, string, string] {
  const partner = gender === "female" ? "남자" : "여자";
  return [
    "사주에 예쁜 기운이 보이네.",
    `${partner}들이 보는 네 첫인상과 친해지고 나서 반전매력, 궁금하지 않아?`,
    "너는 이런 분위기의 사람이야.",
    "평생 활용할 수 있는 사주별 스타일링 꿀팁도 넣어뒀단다.",
    `네 운명의 ${partner}, 언제 어디서 만나는지 자세히 다 나온단다.`,
  ];
}

export function freeFirstImpressionLine(profile: SajuProfile, reading: DohwaReading): string {
  const type = freeCharmType(profile, reading);
  if (type.label.includes("화려한")) {
    return "첫인상부터 강한 인상으로 박히는 타입이야. 그런데 가까워지면, 처음에 봤던 화려함과는 또 다른 매력이 나와.";
  }
  if (type.label.includes("우아")) {
    return "첫인상부터 선이 또렷한 인상으로 박혀. 그런데 가까워질수록, 처음에 본 그 선 너머로 다른 매력이 더 보여.";
  }
  const hook = type.label.includes("신비")
    ? "쉽게 읽히지 않는 인상"
    : type.label.includes("차분")
      ? "단정하고 안정적인 인상"
      : "은은하게 남는 인상";
  return `넌 ${hook}으로 기억될 가능성이 커. 그런데 가까워질수록 처음과는 다른 매력이 더 드러나.`;
}

const VIBE_POOL = [
  "청순함",
  "도도함",
  "러블리함",
  "우아함",
  "신비로움",
  "청량함",
  "시크함",
  "단아함",
  "따뜻함",
  "지적인 분위기",
  "세련됨",
  "고급스러움",
  "관능적인 분위기",
  "편안하고 자연스러운 분위기",
] as const;

/** 일간 오행·매력살로 서로 겹치지 않는 키워드 3개를 고른다. */
export function freeVibeKeywords(profile: SajuProfile, reading: DohwaReading): FreeVibeKeyword[] {
  const byElement: Record<FiveElementKey, [string, string, string]> = {
    wood: ["청순함", "편안하고 자연스러운 분위기", "러블리함"],
    fire: ["관능적인 분위기", "세련됨", "고급스러움"],
    earth: ["따뜻함", "단아함", "우아함"],
    metal: ["시크함", "도도함", "고급스러움"],
    water: ["신비로움", "지적인 분위기", "청량함"],
  };
  const picks = [...byElement[reading.typeKey]];
  if (reading.stars.some((star) => star.key === "hwagae" && star.positions.length > 0)) {
    picks[2] = "신비로움";
  }
  if (reading.stars.some((star) => star.key === "hongyeom" && star.positions.length > 0)) {
    picks[0] = "관능적인 분위기";
  }
  // 중복 제거 후 부족하면 풀에서 보충
  const unique = [...new Set(picks)];
  for (const name of VIBE_POOL) {
    if (unique.length >= 3) break;
    if (!unique.includes(name)) unique.push(name);
  }
  return unique.slice(0, 3).map((name) => ({ name }));
}
