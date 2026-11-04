import "server-only";

import { withPartner } from "@/lib/constants/result";
import type { FiveElementKey, SajuProfile } from "@/lib/saju/profileTypes";
import type { FullReportView } from "@/types/result";

/** 일간 오행 → 도화 유형 본인 얼굴 */
const SELF_PORTRAIT: Record<FiveElementKey, string> = {
  wood: "/images/report/portrait-self-wood.jpg",
  fire: "/images/report/portrait-self-fire.jpg",
  earth: "/images/report/portrait-self-earth.jpg",
  metal: "/images/report/portrait-self-metal.jpg",
  water: "/images/report/portrait-self-water.jpg",
};

/**
 * 관성을 다스리는 오행(여성 사주에서 남자) → 운명의 남자 얼굴.
 * teasers.partnerTeaser와 같은 CONTROLLED_BY 규칙이다.
 */
const PARTNER_OF: Record<FiveElementKey, FiveElementKey> = {
  wood: "metal",
  fire: "water",
  earth: "wood",
  metal: "fire",
  water: "earth",
};

const PARTNER_PORTRAIT: Record<FiveElementKey, string> = {
  wood: "/images/report/portrait-partner-wood.jpg",
  fire: "/images/report/portrait-partner-fire.jpg",
  earth: "/images/report/portrait-partner-earth.jpg",
  metal: "/images/report/portrait-partner-metal.jpg",
  water: "/images/report/portrait-partner-water.jpg",
};

export function selfPortraitSrc(typeKey: FiveElementKey): string {
  return SELF_PORTRAIT[typeKey];
}

export function partnerPortraitSrc(dayMasterElement: FiveElementKey): string {
  return PARTNER_PORTRAIT[PARTNER_OF[dayMasterElement]];
}

/** 리포트에 넣는 얼굴 그림. 일간 오행으로 본인·상대를 고른다. */
export function reportPortraits(profile: SajuProfile): FullReportView["portraits"] {
  const gender = profile.calculation.gender;
  const element = profile.dayMaster.element;
  return {
    self: {
      src: selfPortraitSrc(element),
      caption: withPartner("그 {partner}가 보는 네 얼굴", gender),
    },
    partner: {
      src: partnerPortraitSrc(element),
      caption: withPartner("네 {partner}의 얼굴", gender),
    },
  };
}
