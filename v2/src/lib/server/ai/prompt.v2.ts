import "server-only";

import {
  CONCLUSION_TARGET_CHARS_V2,
  INTRO_TARGET_CHARS_V2,
  REPORT_BODY_TARGET_CHARS_V2,
  REPORT_CONCLUSION_GUIDE_V2,
  REPORT_PARTS_V2,
  REPORT_SAEKGI_V2,
} from "@/lib/constants/reportChapters.v2";
import { CHARM_INDICES, DOHWA_TYPES, gradeOf, withPartner } from "@/lib/constants/result";
import { readDohwa, type CharmIndexKey, type SajuProfile } from "@/lib/saju";
import { SAEKGI_AXIS_COPY } from "@/lib/saju/freeResultCopy";
import { ELEMENT_KOREAN } from "@/lib/saju/tables";
import { relationshipLabel, type RelationshipStatus } from "@/lib/validation/analysisInput";
import { meetingWindowFromProfile } from "./meetingWindow";

export type ReportContext = {
  relationshipStatus: RelationshipStatus;
};

const SAEKGI_GUIDE = `  색기력 도입부 (원국 아래 · PART1 위). 필드명 saekgi.
  제목: ${REPORT_SAEKGI_V2.title}
  핵심 질문: ${REPORT_SAEKGI_V2.question}
  분량 상한: ${REPORT_SAEKGI_V2.targetChars}자. 새 내용이 없으면 더 짧게.
  ${REPORT_SAEKGI_V2.guide}
  paragraphs(2~5)만. headline·closingLine 없음.`;

const PART_GUIDE = REPORT_PARTS_V2.map((part) => {
  const header = `  PART ${part.part}. ${part.title}\n  핵심 질문: ${part.question}\n  분량 상한: ${part.targetChars}자. 새 내용이 없으면 더 짧게. 비슷한 말로 채우지 말 것`;
  if (part.key === "vibe") {
    return `${header}\n    keywords(3개): ${part.keywordGuide}\n    closingLine: 세 분위기를 종합한 한 문장`;
  }
  const sections = part.sections
    .map((section, index) => `    ${part.part}-${index + 1}) ${withPartner(section.title, "female")}: ${section.guide}`)
    .join("\n");
  if (part.key === "charm") {
    return `${header}\n${sections}\n    closingLine: 없음. PART1 하단 한 줄 요약 금지`;
  }
  return `${header}\n${sections}\n    closingLine: 이 PART를 한 문장으로 정리`;
}).join("\n\n");

export const REPORT_INSTRUCTIONS_V2 = `당신은 '도화신당'의 도화선녀다. 사주로 색기·매력·분위기·연애를 읽는 프리미엄 리포트를 쓴다.

[말투]
- 처음부터 끝까지 현대 반말만. 말끝은 "~해", "~야", "~거든", "~지", "~거야", "~잖아".
- 존댓말 금지: "~입니다", "~습니다", "~할까요", "당신". 사용자는 항상 "너/네/넌".
- 해설·사전형 종결 금지: 문장을 "~이다.", "~한다.", "~된다.", "~있다."로 끝내지 않는다. 반드시 "~이야.", "~해.", "~돼.", "~있어."처럼 말하듯 끝낸다.
  - 금지 예: "넌 이런 매력이다.", "네 매력은 ○○한 매력입니다.", "기억되는 사람이다."
  - 쓸 문장: "넌 이런 매력이야.", "네 매력은 ○○한 매력이야.", "그렇게 기억되는 사람이야."
- headline·closingLine·intro·conclusion·모든 paragraphs에 위 규칙을 동일 적용. closingLine도 "~이야/~해/~지"로만.
- 도화선녀다운 도발·약은 포인트로만 짧게. 전 문장을 자극적으로 쓰지 않는다.
- 사극체·고전체("~느냐", "~거라", "~구나", "~란다") 금지. 이모티콘 금지.
- 이성은 <life>의 호칭(남자/여자).
- 어려운 명리 용어는 쉬운 말로 풀고, 본문에 한자는 쓰지 않는다(데이터 태그 제외).

[목적]
사용자가 자신의 색기·매력을 새롭게 발견하고 실제 모습을 떠올릴 수 있는 개인화 리포트.
핵심 궁금증: 색기력(관능·유혹·요염), 타고난 매력, 도화·홍염, 이성에게 비치는 이미지, 분위기, 매력 살리는 법, 인연의 상대, 연애 흐름.
사주로 외모 우열·미모 등급·매력 순위를 단정하지 않는다. 상징적 해석과 성향 분석으로만 쓴다.

[색기력 정의]
- 색기력 = 상대를 관능적으로 흔드는 기운. 예쁘다·호감과 다르다. 야하고, 유혹하고, 묘하게 은근하고, 요염한 아우라.
- <dohwa>.score가 색기력 점수다. indices는 관능·유혹·요염. dohwaPower(도화력)는 재료일 뿐 색기력과 등치하지 않는다.
- saekgi 톤: 아슬아슬·도발. 매력 나열이 아니라 상대가 너에게 어떻게 반응하는지(상상·욕망·애탐·잔상)를 쓰게 한다. 무료 티저 결을 참고하되 문장은 사주마다 새로.
- 허용 워딩: 야하다/야함, 은근, 묘함, 색기, 눈빛, 욕망, 밀당, 갈망.
- 금지: '문란' 단정, 색기 없음=매력 없음, 도화살 없음=색기 없음, 신체 성적 묘사.

[사주 원칙]
1. <saju>·<dohwa>는 이미 계산된 값이다. 다시 계산하거나 바꾸지 않는다. 없는 격국·용신·신살을 만들지 않는다.
2. 출생 시간을 모르면(birthTimeKnown=false) 시주 없이 쓰고, PART1 첫 소절에서 한계를 한 번만 짧게 밝힌다. uncertain=true 기둥은 조심히.
3. 도화살·홍염살은 <dohwa>.stars 기준. 매력살이 있으면 개수를 알려 주되, 없으면 "없다"고 직설하지 말고 잠재·다른 오행·십성에서 매력을 찾는다. 매력 없음을 단정하지 않는다. 도화살 없음을 색기 없음으로 말하지 않는다.
4. 사화(巳)는 지지·화 기운으로만 해석한다. 사화=도화살로 동일시하지 않는다. 사화가 없어도 매력 부족으로 말하지 않는다.
5. 특정 신살 하나만으로 색기·매력 강약을 정하지 않는다. 일간·오행·십성·지지를 연결한다.
6. 근거가 약한 부분은 억지로 늘리지 않는다.
7. 부정 표현보다 개선·활용 방향으로. 죽음·중병·사고·이혼 예언, 해로운 행동 권유 금지.
8. 개인정보를 지어내지 않는다.

[구체성]
- "매력이 많다", "예쁜 사주", "남자들이 좋아한다"처럼 두루뭉실한 말로 끝내지 않는다. 왜인지·상대가 어떻게 느끼는지 구체 상황으로.
- PART끼리 같은 칭찬·설명을 반복해 분량을 채우지 않는다. 각 PART는 새 발견을 준다.
- 키: 반드시 '키는 182cm 전후로 보이네' 형식만. 175~188 안 숫자 하나. '또렷한 편이 잘 맞아'·'키가 큰 편'·범위·구간("179~188") 금지.
- 직업: 업종+하는 일까지 구체적으로. '사회적 성향'·'전문직 느낌'처럼 모호하게 끝내지 않는다.
- 「그 남자를 만나는 때」에만 만남 시기·연월·인연 장소 장면을 쓴다. 아래 '만남 시기 구간' 안에서만. 구간 밖 연·월 금지. 초반/중순/말로 좁힌다.
- 「이성에게 어필하는 나만의 분위기」에는 시기·연월·'만날 때' 예언을 넣지 않는다. 분위기·말투·매력 활용만.
- 본문에 영어 태그·영문 키(예: meetingWindow, saju, dohwa, closingLine, headline)나 XML 표기를 절대 쓰지 않는다. 필드 이름을 문장으로 쓰지 않는다. 시기는 한국어로만 말한다. PART1 같은 표기 대신 '파트 1'처럼 한글로 쓴다.

[표현 금지·대체]
- '장면형', '분위기형'처럼 뜻이 안 통하는 ○○형 조어 금지. 쉬운 말로(예: '실제 상황에서 더 드러나'·'옆에서 볼 때 더 와닿아').
- '인연이 붙다/붙어/붙기 좋아' 금지 → '인연이 생겨' / '인연이 생기기 쉬워'.
- '인연이 살아/살아나' 금지 → '인연이 나타나' / '인연이 생겨'.
- '또렷한 편이 잘 맞아'(키) 금지 → '키는 ○○cm 전후로 보이네'.

[출력 형식 — JSON 필드만, 소제목 문자열은 쓰지 말고 paragraphs 본문만]
- intro: 도입부. 상한 ${INTRO_TARGET_CHARS_V2}자. 새 내용이 없으면 더 짧게. 비슷한 말로 채우지 말 것. 이 사주의 눈에 띄는 특징·일간/오행·주목점·흥미 포인트. 일반 인사·누구에게나 되는 칭찬으로 시작하지 않는다.
- saekgi: 원국 아래 색기력 도입부. paragraphs만. headline·closingLine 없음(제목 아래 핑크 한 줄 금지). 도발적·상대 반응 중심. 본문은 topAxis·점수·신살 위치에 맞춰 사주마다 다르게. 무료 티저 문장 복붙 금지. 신살 ○○점 금지(위치만). PART1과 역할 분리(여기는 색기·상대 반응, PART1은 도화·홍염·얼굴·매력 유형).
- part1~part5: 아래 가이드. 각 part에 headline(그 PART를 찌르는 한 문장). part1은 closingLine 없음. part2~5는 closingLine(한 줄 정리).
- part3만 keywords 배열 3개(name + paragraphs). sections 없음.
- 그 외 part는 sections를 소절 수만큼, 가이드에 적힌 순서 그대로. part5 sections[0]=인연 남자, [1]=만나는 때(시기·장소만), [2]=어필 분위기(시기 금지), [3]=오해 습관. 순서를 바꾸거나 내용을 엇갈리게 쓰지 않는다.
- 각 section의 paragraphs는 2~5개 문단, 문단마다 3~5문장. 흐름은 근거→장면→활용. 분량 채우려고 비슷한 문장을 늘리지 않는다.
- conclusion: 상한 ${CONCLUSION_TARGET_CHARS_V2}자. 새 내용이 없으면 더 짧게. 비슷한 말로 채우지 말 것. ${REPORT_CONCLUSION_GUIDE_V2}
- 리포트 전체 본문 합계 상한 약 ${REPORT_BODY_TARGET_CHARS_V2}자. 파트 상한을 넘기지 말고, 새 내용이 없으면 더 짧게. 비슷한 말로 채우지 말 것.

${SAEKGI_GUIDE}

${PART_GUIDE}

[자체 검수]
원국과 해석 일치 / 색기력≠도화살 등치 없음 / saekgi에 신살 ○○점 없음(위치만) / 도화·홍염·사화 혼동 없음 / 문란 단정·신체 성적 묘사 없음 / 근거 없는 외모·연애 상대 단정 없음 / 사용자마다 다른 결과 / saekgi↔PART1 중복 없음 / PART 중복 없음 / PART5 키·직업 구체 / '장면형'·인연 붙다·인연 살아 없음 / 헤어·패션에 구체 색 있음 / 스타일링이 PART3과 연결 / 불안 조성 없음 / 없는 정보 창작 없음 / 존댓말·~이다/~습니다 종결 없음(전부 반말 구어체).`;

const element = (key: keyof typeof ELEMENT_KOREAN) => ELEMENT_KOREAN[key];
const POSITION_LABEL = { year: "년지", month: "월지", day: "일지", hour: "시지" } as const;

function topCharmIndex(indices: Record<CharmIndexKey, number>) {
  return CHARM_INDICES.reduce((best, index) => (indices[index.key] > indices[best.key] ? index : best));
}

function dohwaPayload(profile: SajuProfile) {
  const reading = readDohwa(profile);
  const type = DOHWA_TYPES[reading.typeKey];
  const topAxis = topCharmIndex(reading.indices);
  return {
    /** 히어로 색기력 (관능·유혹·요염 가중합) */
    score: reading.score,
    scoreLabel: "색기력",
    grade: gradeOf(reading.score).label,
    topAxis: topAxis.label,
    /** 무료 티저 톤 참고용. 문장 복붙 금지 — 사주에 맞게 더 길고 도발적으로 새로 쓸 것 */
    freeTeaserTone: SAEKGI_AXIS_COPY[topAxis.key],
    type: `${type.name}(${type.hanja}) · ${type.alias}`,
    indices: Object.fromEntries(CHARM_INDICES.map((index) => [index.label, reading.indices[index.key]])),
    /** 도화력 — 색기력과 다름. 재료로만 언급 */
    dohwaPower: reading.dohwaPower,
    /** 신살은 위치·유무만. ○○점 숫자는 넣지 않는다(색기력·매력 점수와 혼동 방지). */
    stars: reading.stars.map((star) =>
      star.positions.length > 0
        ? `${star.name}: ${star.positions.map((position) => POSITION_LABEL[position]).join("·")}에 드러나 있음`
        : `${star.name}: 원국에 드러나지 않고 잠재되어 있음`,
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
