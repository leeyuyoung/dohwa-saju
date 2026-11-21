import "server-only";

import { NEWYEAR_YEAR_FROM, NEWYEAR_YEAR_TO } from "@/lib/constants/newyear";
import { readDohwa, type SajuProfile } from "@/lib/saju";
import { buildNewYearCalendar } from "@/lib/saju/newyearCalendar";
import { ELEMENT_KOREAN } from "@/lib/saju/tables";

const element = (key: keyof typeof ELEMENT_KOREAN) => ELEMENT_KOREAN[key];
const POSITION = { year: "년주", month: "월주", day: "일주", hour: "시주" } as const;
const STRENGTH = { strong: "신강", weak: "신약", balanced: "중화" } as const;

export const NEWYEAR_INSTRUCTIONS = `당신은 사주 명리로 2027년 신년 종합 운세를 쓰는 해석가다. 연애 매력 리포트가 아니다. 한 사람의 사주를 바탕으로 성격, 오행, 십성, 연애와 결혼, 도화살·홍염살·화개살, 재물과 직업, 2027년부터 2037년까지의 해별 운, 2027년 달별 운, 2027년 개운을 쓴다.

[말투]
- 해요체. 차분하고 또렷하게. 반말, 사극체, 도발, 이모티콘 금지.
- 독자는 "당신". 이름이나 성별을 제목처럼 반복하지 않는다.
- 본문에 한자와 영어 키, XML 태그를 쓰지 않는다. 간지는 한글로 쓴다.

[원칙]
1. <saju>, <stars>, <years>, <months>는 이미 계산된 값이다. 간지, 오행 개수, 십성, 살의 유무와 위치를 바꾸거나 새로 만들지 않는다.
2. 격국, 용신, 입력에 없는 신살을 단정하지 않는다.
3. birthTimeKnown이 false면 시주가 없다. intro에서 그 한계를 한 번만 말한다.
4. 도화살, 홍염살, 화개살은 <stars>만 따른다. 없으면 없다고 말하고, 다른 살로 대체하지 않는다.
5. years는 11개다. 첫 항목이 ${NEWYEAR_YEAR_FROM}년, 마지막이 ${NEWYEAR_YEAR_TO}년이다. 순서를 바꾸지 않는다.
6. months는 12개다. 첫 항목이 2027년 1월, 마지막이 12월이다. 각 달의 간지는 입력된 월운이다.
7. 연애와 결혼은 기질과 관계의 흐름으로 쓴다. 상대의 키, 얼굴, 직업명, 만날 장소, 특정 월의 결혼 확정을 지어내지 않는다.
8. 재물과 직업은 돈의 성향과 일에서의 강점이다. 종목, 투자, 수익을 권하지 않는다.
9. 죽음, 중병, 사고, 파산, 이혼을 예언하지 않는다. 약한 해는 아낄 일로 말한다.
10. 개운은 입력된 오행과 2027년 세운에서 끌어온다. 부적, 개명, 수술 같은 처방은 하지 않는다.

[분량]
- intro는 3~5문장. 이 사주에서 2027년을 볼 때 가장 먼저 보이는 점.
- nature, elements, love, stars, wealth, guide는 headline 한 문장과 paragraphs 2~4개. 문단은 2~4문장.
- years 11개, months 12개는 headline 한 문장과 paragraphs 1~2개. 해마다 같은 문장을 반복하지 않는다.
- closing은 2027년에 가져갈 태도를 3~5문장으로 묶는다.
- 장마다 새 내용을 쓴다. 칭찬을 복사해 길이를 채우지 않는다.

[자체 검수]
입력된 간지와 해석이 맞는가. 없는 살을 만들었는가. 해와 달의 순서가 맞는가. 투자·질병·혼인 확정처럼 단정한 문장이 있는가.`;

export function buildNewYearInput(profile: SajuProfile): string {
  const calendar = buildNewYearCalendar(profile);
  const reading = readDohwa(profile);
  const saju = {
    referenceDate: `${profile.referenceDate.year}-${profile.referenceDate.month}-${profile.referenceDate.day}`,
    age: profile.age,
    birthTimeKnown: profile.calculation.hourPillar !== null,
    dayMaster: {
      glyph: `${profile.dayMaster.korean}(${element(profile.dayMaster.element)})`,
      yinYang: profile.dayMaster.yinYang,
      strength: STRENGTH[profile.dayMaster.strength.level],
    },
    pillars: profile.pillars.map((pillar) => ({
      label: pillar.label,
      stem: `${pillar.stem.korean} ${element(pillar.stem.element)} ${pillar.stem.tenGod}`,
      branch: `${pillar.branch.korean} ${element(pillar.branch.element)} ${pillar.branch.tenGod}`,
      hiddenStems: pillar.branch.hiddenStems.map((stem) => `${stem.role} ${stem.korean} ${stem.tenGod}`).join(", "),
      twelveStage: pillar.branch.twelveStage,
      isVoid: pillar.branch.isVoid,
      uncertain: pillar.uncertain,
    })),
    fiveElements: Object.fromEntries(
      Object.entries(profile.fiveElements.counts).map(([key, count]) => [element(key as keyof typeof ELEMENT_KOREAN), count]),
    ),
    missingElements: profile.fiveElements.missing.map(element),
    tenGodGroups: profile.tenGodGroups,
    relations: profile.relations.map(
      (relation) =>
        `${relation.type} ${relation.positions.join("·")}${relation.resultElement ? ` ${element(relation.resultElement)}` : ""}`,
    ),
    currentLuck: profile.luck.periods
      .filter((period) => period.isCurrent)
      .map((period) => ({
        ages: `${period.startAge}~${period.startAge + 9}세`,
        ganji: period.korean,
        tenGods: `${period.stem.tenGod}/${period.branch.tenGod}`,
        twelveStage: period.branch.twelveStage,
      }))[0] ?? null,
  };
  const stars = reading.stars.map((star) =>
    star.positions.length > 0
      ? `${star.name}: ${star.positions.map((position) => POSITION[position]).join(", ")}`
      : `${star.name}: 원국에 없음`,
  );
  const years = calendar.years.map((year) => ({
    year: year.year,
    age: year.age,
    ganji: year.korean,
    tenGods: `${year.stem.tenGod}/${year.branch.tenGod}`,
    twelveStage: year.branch.twelveStage,
  }));
  const months = calendar.months.map((month) => ({
    month: month.month,
    ganji: month.korean,
    tenGods: `${month.stem.tenGod}/${month.branch.tenGod}`,
    twelveStage: month.branch.twelveStage,
  }));

  return [
    "<saju>",
    JSON.stringify(saju),
    "</saju>",
    "<stars>",
    JSON.stringify(stars),
    "</stars>",
    "<years>",
    JSON.stringify(years),
    "</years>",
    "<months>",
    JSON.stringify(months),
    "</months>",
  ].join("\n");
}
