import { ganjiKorean, josa } from "@/lib/constants/sajuLabels";
import type { DohwaReading } from "./dohwa";
import type { FiveElementKey, SajuProfile } from "./profileTypes";

/**
 * 무료 결과 카피. AI 없이 만세력·도화 판독만으로 같은 사주는 항상 같은 문장이 나온다.
 */

export type FreeCharmType = {
  label: string;
  vibeLine: string;
  reason: string;
};

export type FreeVibeKeyword = { name: string };

const CHARM_BY_ELEMENT: Record<FiveElementKey, FreeCharmType> = {
  wood: {
    label: "볼수록 빠져드는 은은한 매력형",
    vibeLine: "편해 보이는데, 웃는 순간부터 상대가 방심하는 타입이야.",
    reason:
      "일간에 나무 기운이 있어서 경계가 쉽게 풀려. 다들 편한 사람이라 착각하다가, 정신 차려 보면 이미 네 생각에 빠져 있어.",
  },
  fire: {
    label: "첫인상부터 시선을 끄는 화려한 매력형",
    vibeLine: "들어서면 공기가 달라지고, 한 번 보면 쉽게 안 잊히는 타입이야.",
    reason: "일간에 불 기운이 있어서 눈빛과 표정만으로도 분위기를 압도해. 데일 걸 알면서도 다들 너한테 손이 가.",
  },
  earth: {
    label: "차분하지만 강한 존재감을 지닌 매력형",
    vibeLine: "멀리선 단정해 보이는데, 가까이 갈수록 온기가 진해지는 타입이야.",
    reason: "일간에 흙 기운이 있어서 옆에 있으면 마음이 편해져. 가까이 둘수록 자꾸 기대게 되는 타입이야.",
  },
  metal: {
    label: "우아하고 고급스러운 분위기형",
    vibeLine: "쉽게 곁을 안 내주니까, 오히려 더 보고 싶어지는 타입이야.",
    reason: "일간에 쇠 기운이 있어서 차가워보이는 거리감과 말 아끼는 그 태도가 오히려 시선을 붙잡아.",
  },
  water: {
    label: "신비롭고 쉽게 잊히지 않는 매력형",
    vibeLine: "속을 다 보여 주지 않아서, 한 번 시선이 가면 계속 남게 되는 타입이야.",
    reason: "일간에 물 기운이 있어서 눈매가 깊고 여백이 있는 분위기야. 알면 알수록 더 궁금한 타입이 돼.",
  },
};

/** 화개·홍염이 원국에 있으면 유형 라벨을 한 단계 더 또렷하게 바꾼다. */
function refineCharmType(base: FreeCharmType, reading: DohwaReading): FreeCharmType {
  const hongyeom = reading.stars.find((star) => star.key === "hongyeom");
  const hwagae = reading.stars.find((star) => star.key === "hwagae");
  if (hongyeom && hongyeom.positions.length > 0) {
    return {
      label: "첫인상부터 시선을 끄는 화려한 매력형",
      vibeLine: "가만히 있어도 시선이 쏠리는 타입이야.",
      reason: `${base.reason} 여기에 홍염까지 겹쳐서, 눈길 받는 힘이 더 세.`,
    };
  }
  if (hwagae && hwagae.positions.length > 0) {
    return {
      label: "신비롭고 쉽게 잊히지 않는 매력형",
      vibeLine: "혼자만의 분위기가 뚜렷해서, 한번 기억되면 잘 안 지워지는 타입이야.",
      reason: `${base.reason} 화개까지 겹쳐서, 남들과는 다른 독립적인 인상이 더해져.`,
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
      ? `네 사주에 ${starHits.join("·")}이 보여.`
      : "겉으로 요란한 매력살보다, 일간과 오행 균형에서 매력이 읽히는 사주야.";
  return [
    `${name}, 네 일주는 ${josa(ganjiKorean(day.stem.korean, day.branch.korean), "이야", "야")}. ${type.vibeLine}`,
    `${starHint} 이 페이지에선 그 핵심만 먼저 열어 줄게.`,
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
