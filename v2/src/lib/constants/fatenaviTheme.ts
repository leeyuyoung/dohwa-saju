export type FateNaviThemeId = "sheep" | "hanji" | "premium";

export type FateNaviTheme = {
  id: FateNaviThemeId;
  /** URL 루트. 예: /FateNavi2 */
  basePath: string;
  /** Shell에 붙는 추가 클래스 */
  shellClass: string;
  brand: string;
  orderName: string;
  slogan: string;
  ctaStart: string;
  introNote: string;
};

export const FATENAVI_THEMES: Record<FateNaviThemeId, FateNaviTheme> = {
  sheep: {
    id: "sheep",
    basePath: "/FateNavi2",
    shellClass: "ny-sheep",
    brand: "메리운세",
    orderName: "메리운세",
    slogan: "어휴, 올해도 버티느라 고생 많았어!",
    ctaStart: "2027년 레벨업 하기",
    introNote: "",
  },
  hanji: {
    id: "hanji",
    basePath: "/FateNavi3",
    shellClass: "ny-hanji",
    brand: "운명내비",
    orderName: "운명내비 종합사주",
    slogan: "좋은 말만 하지 않습니다. 가야 할 길을 짚어드립니다.",
    ctaStart: "내 인생 설계서 펼치기",
    introNote: "한지·전통 사주 버전",
  },
  premium: {
    id: "premium",
    basePath: "/FateNavi4",
    shellClass: "ny-premium",
    brand: "프리미엄 종합사주",
    orderName: "프리미엄 종합사주",
    slogan: "말도 안 되는 방대한 분량, 1:1 맞춤 프리미엄 사주",
    ctaStart: "프리미엄 사주 신청하기",
    introNote: "크림·프리미엄 랜딩 버전",
  },
};

export function themeOf(id: FateNaviThemeId): FateNaviTheme {
  return FATENAVI_THEMES[id];
}
