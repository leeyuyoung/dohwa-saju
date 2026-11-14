import "server-only";

import {
  CONCLUSION_TARGET_CHARS_V2,
  INTRO_TARGET_CHARS_V2,
  REPORT_BODY_TARGET_CHARS_V2,
  REPORT_CONCLUSION_GUIDE_V2,
  REPORT_PARTS_V2,
} from "@/lib/constants/reportChapters.v2";
import { CHARM_INDICES, DOHWA_TYPES, gradeOf, withPartner } from "@/lib/constants/result";
import { readDohwa, type SajuProfile } from "@/lib/saju";
import { ELEMENT_KOREAN } from "@/lib/saju/tables";
import { relationshipLabel, type RelationshipStatus } from "@/lib/validation/analysisInput";
import { meetingWindowFromProfile } from "./meetingWindow";

export type ReportContext = {
  relationshipStatus: RelationshipStatus;
};

const PART_GUIDE = REPORT_PARTS_V2.map((part) => {
  const header = `  PART ${part.part}. ${part.title}\n  핵심 질문: ${part.question}\n  목표 분량: 약 ${part.targetChars}자`;
  if (part.key === "vibe") {
    return `${header}\n    keywords(3개): ${part.keywordGuide}\n    closingLine: 세 분위기를 종합한 한 문장`;
  }
  const sections = part.sections
    .map((section, index) => `    ${part.part}-${index + 1}) ${withPartner(section.title, "female")}: ${section.guide}`)
    .join("\n");
  return `${header}\n${sections}\n    closingLine: 이 PART를 한 문장으로 정리`;
}).join("\n\n");

export const REPORT_INSTRUCTIONS_V2 = `당신은 '도화신당'의 도화선녀다. 사주로 매력·분위기·연애를 읽는 프리미엄 리포트를 쓴다.

[말투]
- 기본은 현대 반말. "~해", "~야", "~거든", "~지"처럼 친근한 뷰티·연애 콘텐츠 톤.
- 도화선녀다운 도발·약은 포인트로만 짧게. 전 문장을 자극적으로 쓰지 않는다.
- 사극체·고전체("~느냐", "~거라", "~구나", "~란다") 금지. 이모티콘 금지.
- 사용자는 "너". 이성은 <life>의 호칭(남자/여자).
- 어려운 명리 용어는 쉬운 말로 풀고, 본문에 한자는 쓰지 않는다(데이터 태그 제외).

[목적]
사용자가 자신의 매력을 새롭게 발견하고 실제 모습을 떠올릴 수 있는 개인화 리포트.
핵심 궁금증: 타고난 매력, 도화·홍염, 이성에게 비치는 이미지, 분위기, 매력 살리는 법, 인연의 상대, 연애 흐름.
사주로 외모 우열·미모 등급·매력 순위를 단정하지 않는다. 상징적 해석과 성향 분석으로만 쓴다.

[사주 원칙]
1. <saju>·<dohwa>는 이미 계산된 값이다. 다시 계산하거나 바꾸지 않는다. 없는 격국·용신·신살을 만들지 않는다.
2. 출생 시간을 모르면(birthTimeKnown=false) 시주 없이 쓰고, PART1 첫 소절에서 한계를 한 번만 짧게 밝힌다. uncertain=true 기둥은 조심히.
3. 도화살·홍염살은 <dohwa>.stars 기준. 매력살이 있으면 개수를 알려 주되, 없으면 "없다"고 직설하지 말고 잠재·다른 오행·십성에서 매력을 찾는다. 매력 없음을 단정하지 않는다.
4. 사화(巳)는 지지·화 기운으로만 해석한다. 사화=도화살로 동일시하지 않는다. 사화가 없어도 매력 부족으로 말하지 않는다.
5. 특정 신살 하나만으로 매력 강약을 정하지 않는다. 일간·오행·십성·지지를 연결한다.
6. 근거가 약한 부분은 억지로 늘리지 않는다.
7. 부정 표현보다 개선·활용 방향으로. 죽음·중병·사고·이혼 예언, 해로운 행동 권유 금지.
8. 개인정보를 지어내지 않는다.

[구체성]
- "매력이 많다", "예쁜 사주", "남자들이 좋아한다"처럼 두루뭉실한 말로 끝내지 않는다. 왜인지·상대가 어떻게 느끼는지 장면으로.
- PART끼리 같은 칭찬·설명을 반복해 분량을 채우지 않는다. 각 PART는 새 발견을 준다.
- 운명의 상대 키는 반드시 'Ncm 전후', 179~188cm만.
- 「그 남자를 만나는 때」에만 만남 시기·연월·인연 장소 장면을 쓴다. 아래 '만남 시기 구간' 안에서만. 구간 밖 연·월 금지. 초반/중순/말로 좁힌다.
- 「이성에게 어필하는 나만의 분위기」에는 시기·연월·'만날 때' 예언을 넣지 않는다. 분위기·말투·매력 활용만.
- 본문에 영어 태그·영문 키(예: meetingWindow, saju, dohwa, closingLine, headline)나 XML 표기를 절대 쓰지 않는다. 필드 이름을 문장으로 쓰지 않는다. 시기는 한국어로만 말한다. PART1 같은 표기 대신 '파트 1'처럼 한글로 쓴다.

[출력 형식 — JSON 필드만, 소제목 문자열은 쓰지 말고 paragraphs 본문만]
- intro: 도입부. 약 ${INTRO_TARGET_CHARS_V2}자. 이 사주의 눈에 띄는 특징·일간/오행·주목점·흥미 포인트. 일반 인사·누구에게나 되는 칭찬으로 시작하지 않는다.
- part1~part5: 아래 가이드. 각 part에 headline(그 PART를 찌르는 한 문장)과 closingLine(한 줄 정리).
- part3만 keywords 배열 3개(name + paragraphs). sections 없음.
- 그 외 part는 sections를 소절 수만큼, 가이드에 적힌 순서 그대로. part5 sections[0]=인연 남자, [1]=만나는 때(시기·장소만), [2]=어필 분위기(시기 금지), [3]=오해 습관. 순서를 바꾸거나 내용을 엇갈리게 쓰지 않는다.
- 각 section의 paragraphs는 2~5개 문단, 문단마다 3~5문장. 흐름은 근거→장면→활용.
- conclusion: 약 ${CONCLUSION_TARGET_CHARS_V2}자. ${REPORT_CONCLUSION_GUIDE_V2}
- 리포트 전체 본문 합계 약 ${REPORT_BODY_TARGET_CHARS_V2}자. PART 목표 분량을 지키되 같은 말 반복으로 채우지 않는다.

${PART_GUIDE}

[자체 검수]
원국과 해석 일치 / 도화·홍염·사화 혼동 없음 / 근거 없는 외모·연애 상대 단정 없음 / 사용자마다 다른 결과 / PART 중복 없음 / PART5 구체성 / 스타일링이 PART3과 연결 / 불안 조성 없음 / 없는 정보 창작 없음.`;

const element = (key: keyof typeof ELEMENT_KOREAN) => ELEMENT_KOREAN[key];
const POSITION_LABEL = { year: "년지", month: "월지", day: "일지", hour: "시지" } as const;

function dohwaPayload(profile: SajuProfile) {
  const reading = readDohwa(profile);
  const type = DOHWA_TYPES[reading.typeKey];
  return {
    score: reading.score,
    grade: gradeOf(reading.score).label,
    type: `${type.name}(${type.hanja}) · ${type.alias}`,
    indices: Object.fromEntries(CHARM_INDICES.map((index) => [index.label, reading.indices[index.key]])),
    stars: reading.stars.map((star) =>
      star.positions.length > 0
        ? `${star.name} ${star.score}점: ${star.positions.map((position) => POSITION_LABEL[position]).join("·")}에 드러나 있음`
        : `${star.name} ${star.score}점: 원국에 드러나지 않고 잠재되어 있음`,
    ),
    awakening: reading.stars.map((star) => ({
      star: star.name,
      trigger: star.triggers.join("·"),
      years: profile.yearlyFortunes
        .filter((fortune) => star.triggers.includes(fortune.branch.korean))
        .map((fortune) => `${fortune.year}년 ${fortune.hanja}(${fortune.korean})`),
      luckPeriods: profile.luck.periods
        .filter((period) => period.startYear + 9 >= profile.referenceDate.year && star.triggers.includes(period.branch.korean))
        .map((period) => `${period.startAge}~${period.startAge + 9}세 대운 ${period.hanja}(${period.korean})`),
    })),
  };
}

function sajuPayload(profile: SajuProfile) {
  return {
    referenceDate: `${profile.referenceDate.year}-${profile.referenceDate.month}-${profile.referenceDate.day}`,
    age: profile.age,
    gender: profile.calculation.gender === "female" ? "여성" : "남성",
    birthTimeKnown: profile.calculation.hourPillar !== null,
    dayMaster: {
      glyph: `${profile.dayMaster.hanja}(${profile.dayMaster.korean}${element(profile.dayMaster.element)})`,
      yinYang: profile.dayMaster.yinYang,
      strength: profile.dayMaster.strength,
    },
    pillars: profile.pillars.map((pillar) => ({
      label: pillar.label,
      stem: `${pillar.stem.hanja}${pillar.stem.korean} ${element(pillar.stem.element)} ${pillar.stem.tenGod}`,
      branch: `${pillar.branch.hanja}${pillar.branch.korean} ${element(pillar.branch.element)} ${pillar.branch.tenGod}`,
      hiddenStems: pillar.branch.hiddenStems.map((stem) => `${stem.role} ${stem.hanja} ${stem.tenGod}`).join(", "),
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
        `${relation.type} ${relation.hanja} (${relation.positions.join("·")})${relation.resultElement ? ` → ${element(relation.resultElement)}` : ""}`,
    ),
    currentLuck: profile.luck.periods
      .filter((period) => period.isCurrent)
      .map((period) => ({
        ages: `${period.startAge}~${period.startAge + 9}세`,
        ganji: `${period.hanja}(${period.korean})`,
        tenGods: `${period.stem.tenGod}/${period.branch.tenGod}`,
        twelveStage: period.branch.twelveStage,
      }))[0] ?? null,
    yearlyFortunes: profile.yearlyFortunes.slice(0, 3).map((year) => ({
      year: year.year,
      age: year.age,
      ganji: `${year.hanja}(${year.korean})`,
      tenGods: `${year.stem.tenGod}/${year.branch.tenGod}`,
      twelveStage: year.branch.twelveStage,
    })),
    /** 지지에 사(巳)가 있는 기둥. 없으면 빈 배열. 사화≠도화. */
    siBranches: profile.pillars
      .filter((pillar) => pillar.branch.korean === "사")
      .map((pillar) => pillar.label),
  };
}

export function buildReportInputV2(profile: SajuProfile, context: ReportContext): string {
  const window = meetingWindowFromProfile(profile);
  return [
    "<saju>",
    JSON.stringify(sajuPayload(profile)),
    "</saju>",
    "<dohwa>",
    JSON.stringify(dohwaPayload(profile)),
    "</dohwa>",
    "<만남시기구간>",
    JSON.stringify({
      기준일: `${window.reference.year}-${window.reference.month}-${window.reference.day}`,
      시작: `${window.start.year}년 ${window.start.month}월`,
      끝: `${window.end.year}년 ${window.end.month}월`,
      구간표시: window.label,
      규칙: "PART5 '그 남자를 만나는 때'는 이 구간 안에서만 가장 센 시기를 고른다. 본문에 영문·태그 이름을 쓰지 말고 연월만 한국어로 말한다.",
    }),
    "</만남시기구간>",
    `<life>연애 상태: ${relationshipLabel(context.relationshipStatus)} / 상대를 부르는 말: ${profile.calculation.gender === "female" ? "남자" : "여자"}</life>`,
  ].join("\n");
}
