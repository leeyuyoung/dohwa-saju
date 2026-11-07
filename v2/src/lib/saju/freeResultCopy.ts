import { ganjiKorean } from "@/lib/constants/sajuLabels";
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
    vibeLine: "처음부터 요란하지 않은데, 웃는 순간·말투에서 천천히 스며드는 분위기야.",
    reason: "일간이 나무 기운이라 경계를 낮추는 결이 강하고, 곁에 두면 편한 사람처럼 보이면서도 여운이 남는 타입으로 읽혀.",
  },
  fire: {
    label: "첫인상부터 시선을 끄는 화려한 매력형",
    vibeLine: "방에 들어서는 순간 온도가 달라지는, 한 번 보면 기억에 남는 쪽이야.",
    reason: "일간이 불 기운이라 표정·눈빛에 존재감이 먼저 서고, 상대가 네 리듬에 맞춰지게 만드는 흐름이 강해.",
  },
  earth: {
    label: "차분하지만 강한 존재감을 지닌 매력형",
    vibeLine: "겉은 단정한데, 가까이 갈수록 온기와 반전이 드러나는 타입이야.",
    reason: "일간이 흙 기운이라 안정감이 먼저 읽히고, 오래 곁에 두면 다른 사람이 잘 안 보이는 중독성이 생겨.",
  },
  metal: {
    label: "우아하고 고급스러운 분위기형",
    vibeLine: "쉽게 곁을 안 내주는 선이 또렷해서, 더 보고 싶게 만드는 결이야.",
    reason: "일간이 쇠 기운이라 거리감과 정돈이 먼저 보이고, 그 서늘함이 오히려 시선을 붙잡는 구조야.",
  },
  water: {
    label: "신비롭고 쉽게 잊히지 않는 매력형",
    vibeLine: "속을 다 보여 주지 않아서, 한 번 시선이 가면 계속 남게 되는 타입이야.",
    reason: "일간이 물 기운이라 깊이·여백이 먼저 읽히고, 상대가 네 안을 더 알고 싶어지는 흐름이 있어.",
  },
};

/** 화개·홍염이 원국에 있으면 유형 라벨을 한 단계 더 또렷하게 바꾼다. */
function refineCharmType(base: FreeCharmType, reading: DohwaReading): FreeCharmType {
  const hongyeom = reading.stars.find((star) => star.key === "hongyeom");
  const hwagae = reading.stars.find((star) => star.key === "hwagae");
  if (hongyeom && hongyeom.positions.length > 0) {
    return {
      label: "첫인상부터 시선을 끄는 화려한 매력형",
      vibeLine: "가만히 있어도 시선이 모이는, 온도감 있는 매력이야.",
      reason: `${base.reason} 게다가 홍염의 기운이 원국에 드러나 있어, 눈길·분위기의 강도가 한층 또렷해.`,
    };
  }
  if (hwagae && hwagae.positions.length > 0) {
    return {
      label: "신비롭고 쉽게 잊히지 않는 매력형",
      vibeLine: "혼자만의 결이 분명해서, 한번 기억되면 잘 지워지지 않는 타입이야.",
      reason: `${base.reason} 화개의 기운이 겹치면서 예술적·독립적인 인상이 더해져.`,
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
      ? `${starHits.join("·")}의 결이 원국에 비쳐 있어.`
      : "겉으로 요란한 매력살보다, 일간과 오행 균형에서 매력이 읽히는 사주야.";
  return [
    `${name}, 네 일주는 ${ganjiKorean(day.stem.korean, day.branch.korean)}이야. ${type.vibeLine}`,
    `${starHint} 이 페이지에선 그 핵심만 먼저 열어 줄게.`,
  ];
}

export function freeFirstImpressionLine(profile: SajuProfile, reading: DohwaReading): string {
  const type = freeCharmType(profile, reading);
  const hook = type.label.includes("화려한")
    ? "처음부터 강한 인상"
    : type.label.includes("신비")
      ? "쉽게 읽히지 않는 인상"
      : type.label.includes("우아")
        ? "선이 또렷한 인상"
        : type.label.includes("차분")
          ? "단정하고 안정적인 인상"
          : "은은하게 남는 인상";
  return `넌 처음부터 모든 매력을 드러내기보다는, ${hook}으로 기억될 가능성이 커. 그런데 가까워질수록 처음과는 다른 매력이 드러나는 결도 있어.`;
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
