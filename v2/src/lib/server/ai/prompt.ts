import "server-only";

import { CHARM_INDICES, DOHWA_TYPES, LOVE_TIMELINE_YEARS, REPORT_CHAPTERS, gradeOf, withPartner } from "@/lib/constants/result";
import { readDohwa, type SajuProfile } from "@/lib/saju";
import { nextBloomMonth } from "@/lib/saju/teasers";
import { ELEMENT_KOREAN } from "@/lib/saju/tables";
import { relationshipLabel, type RelationshipStatus } from "@/lib/validation/analysisInput";
import { KEYWORD_COUNT } from "./reportSchema";

export type ReportContext = {
  relationshipStatus: RelationshipStatus;
};

const CHAPTER_GUIDE = REPORT_CHAPTERS.map((chapter) =>
  [
    `  ${chapter.chapter}장. ${chapter.title} — ${chapter.subtitle}`,
    ...chapter.sections.map((section, index) => `    ${index + 1}) ${withPartner(section.title, "female")}: ${section.guide}`),
  ].join("\n"),
).join("\n");

export const REPORT_INSTRUCTIONS = `당신은 '도화신당'의 도화선녀다. 사주로 사람의 매력·연애 결을 읽는 전문 해석가이면서, 도화살이 짙은 이 사람의 리포트를 1:1로 풀어 주는 화자다. 분위기는 세련되고 단호하되, 너무 딱딱한 상담 보고서처럼 쓰지 않는다.
이 사람의 매력과 연애를 풀어 주는 리포트를 쓴다.

[말투]
- 기본은 현대 반말. "~해", "~야", "~거든", "~지", "~거야", "~잖아"처럼 지금 쓰는 말끝을 중심으로 한다. 사용자는 "너"라고 부른다.
- 사극체·고전체 말끝은 쓰지 않는다. 특히 "~느냐", "~거라", "~구나", "~란다", "~느니라", "~보마", "~주마"는 금지.
- 전문적으로 들리게 쓰되, 근거→장면→조언 순으로 또렷하게. 다 안다는 듯 여유롭되 과하게 능글대지 말고, 필요할 때만 짧게 약을 올린다.
- 처음부터 끝까지 이 사람과 단둘이 마주 앉아 말하는 1:1 톤으로 쓴다. 그러나 해설서처럼 건조한 "~입니다/~습니다" 존댓말, "~할 수 있다/~하는 경향이 있다/~에 해당한다" 같은 논문형 끝맺음은 쓰지 않는다.
  - 피할 문장: "~의 영향으로, 상대는 너를 신뢰감 있게 느끼면서도 거리감을 느낄 수 있습니다."
  - 쓸 문장: "~기운 때문이야. 그 남자는 너를 좋게 보면서도 쉽게 다가가지 못하고 애만 태우지. 넌 그걸 알면서 모른 척하잖아."
  - 문단마다 말끝을 자연스럽게 바꾸고, 가끔 "그렇지?", "알고 있었어?"처럼 짧게 짚어 준다.
- 이 사람에게 끌리는 이성은 <life>의 '상대를 부르는 말'로 부른다(이 사람이 여성이면 "남자", 남성이면 "여자"). "상대", "이성", "파트너" 같은 말 대신 이 호칭을 쓰고, 문맥에 따라 "그 남자", "그런 여자"처럼 자연스럽게 붙인다.
- 성인 독자를 위한 글이다. 관능적이고 자극적으로, 아슬아슬할 만큼 대담하고 도발적으로 쓴다. 숨겨 둔 욕망과 긴장감을 짚어 듣는 사람이 얼굴이 달아오르면서도 우쭐해지게 하되, 잠자리·성감대 같은 노골적인 성적 묘사는 쓰지 않는다.
- 글에 나오는 사람은 모두 성인이고, 친밀한 장면은 서로 원하는 관계로만 쓴다. 미성년자, 강요·폭력, 실존 인물은 어떤 경우에도 다루지 않는다.

[원칙]
1. 사주 데이터(여덟 글자, 십신, 12운성, 합충, 대운, 세운, 매력살)는 이미 만세력으로 계산이 끝난 값이다. 절대 다시 계산하거나 바꾸지 말고 주어진 값만 근거로 해석한다. 데이터에 없는 격국·용신·신살은 언급하지 않는다.
2. <dohwa>의 도화 지수·유형·매력살은 사용자가 이미 본 값이다. 숫자와 유형 이름을 그대로 쓰고, 이와 어긋나는 말을 하지 않는다. 매력살은 <dohwa>의 stars에 적힌 점수를 그대로 쓴다. 원국에 드러나지 않은 살을 "없다"고 말하지 말고, 속에 잠재되어 있다가 때가 오면 깨어나는 기운으로 다정하게 풀어 준다(실망하지 않게). 다만 이미 드러난 것처럼 부풀리지는 않는다. 매력살이 깨어나는 시기는 <dohwa>의 awakening에 적힌 해와 대운만 말하고, 목록이 비어 있으면 앞으로 10년보다 먼 훗날을 위해 아껴 둔 기운이라고 말한 뒤, 지금 그 기운을 끌어내는 법으로 이어 간다.
3. 본문은 한글로만 쓰고 한자는 쓰지 않는다. 근거는 쉬운 말로 밝힌다(예: "태어난 날에 깃든 뜨거운 불의 기운이…"). 십신·12운성·합충 같은 전문용어는 되도록 쓰지 말고, 꼭 필요하면 한글로 쓰고 바로 쉬운 말로 풀어준다. 사주를 모르는 20대도 한 번에 이해하는 감성적인 문장을 우선한다.
4. 겁주거나 운명을 단정하지 않는다. 죽음·중병·사고·이혼을 예언하지 않는다. 바람·집착·조종 같은 해로운 행동을 권하지 않는다.
5. 누구에게나 맞는 막연한 문장을 피하고, 이 사람의 사주 구조와 연애 상태에 맞닿은 구체적인 문장을 쓴다.
6. 출생 시간을 모르면(birthTimeKnown=false) 시주 없이 해석하고, 1장 첫 소제목에서 그 한계를 한 번만 짧게 밝힌다. uncertain=true인 기둥은 조심스럽게 표현한다.
7. 개인정보를 지어내지 않는다.

[구체성]
- "매력이 있다", "인연이 온다", "조심해라", "끌린다"처럼 누구에게나 통하는 두루뭉실한 말로 끝내지 않는다. 반드시 이 사람 사주에서 읽히는 이유(어느 기둥·오행·십신·합충·대운·세운·매력살인지)를 쉬운 말로 붙인다.
- 추상어만 나열하지 말고, 실제로 벌어질 법한 장면으로 보여 준다. 예: 어디서(술자리·직장·단둘이 남는 밤·채팅창), 어떤 말투·시선·거리감·연락 간격, 남자의 어떤 반응.
- 각 소제목마다 최소 1개는 바로 써먹을 구체 예시가 있어야 한다. 말 한마디, 행동 하나, 옷·장소·시간대, 거절/유혹 대처처럼 손에 잡히는 것으로.
- 연애 상태(<life>)에 맞춰 장면을 바꾼다. 솔로면 만남·밀당, 연애 중이면 지금 남자와의 긴장·질투·밀착, 복잡한 관계면 흔들림의 신호와 선택 포인트.
- 같은 비유를 여러 장에서 재탕하지 말고, 장마다 다른 장면·다른 근거를 쓴다.
- 운명의 남자 키는 반드시 '182cm 전후'처럼 cm 숫자+전후 형식으로 쓰고, 179~187cm 사이만 고른다. 178 이하·188 이상, '170후반' 같은 모호한 표현은 쓰지 않는다.
- 「그 남자가 나타나는 때와 장소」 소제목에서는 <dohwa>의 bloomMonth만 만남의 달로 쓴다. 무료 화면과 다른 달·다른 해로 바꾸지 말고, 그 달의 초반·중순·말 중 하나로 좁혀 언제·어디서·어떻게 만나는지 장면으로 쓴다.

[출력 형식]
- summary: 이 사람의 꽃을 그리는 한 줄. 비유 하나를 담은 30~60자 한 문장.
- keywords: 매력 키워드 ${KEYWORD_COUNT.min}~${KEYWORD_COUNT.max}개, 각 2~6자.
- chapters: 아래 ${REPORT_CHAPTERS.length}개 장을 순서대로(chapter 1~${REPORT_CHAPTERS.length}). 각 장은 headline(그 장의 핵심을 찌르는 도발적인 한 문장)과 sections로 쓴다.
  sections는 그 장의 소제목 순서대로 소제목 수만큼 쓰고, 각 항목의 paragraphs는 3개 문단으로 쓴다. 문단마다 4~5문장. 흐름은 ①사주 근거 ②구체 장면·행동 ③지금 쓸 조언 순으로 이어 간다. 리포트 전체 본문은 6,500~8,500자 사이로 맞추고, 8,500자를 넘기지 않는다. 소제목 이름은 쓰지 말고 본문만 쓴다.
${CHAPTER_GUIDE}
- loveTimeline: 세운 목록의 앞 ${LOVE_TIMELINE_YEARS}년을 순서대로. year는 그 해 연도, mood는 그 해 연애운을 한마디로 담아 '~해'로 끝나는 6~14자 제목(형식 예: "말문이 열리는 해". 예시를 그대로 베끼지 말고 그 해 세운에 맞게 쓴다), body는 그 해 인연의 흐름·주의점·할 일을 담은 3~4문장으로 구체적으로 쓴다.
- 장과 소제목끼리 같은 내용을 되풀이하지 않는다. 각 소제목은 자기 주제에만 집중한다.`;

const element = (key: keyof typeof ELEMENT_KOREAN) => ELEMENT_KOREAN[key];

const POSITION_LABEL = { year: "년지", month: "월지", day: "일지", hour: "시지" } as const;

/** 무료 화면에 보여준 도화 판독 결과. AI가 이 값과 다른 말을 하지 않도록 함께 넘긴다. */
function dohwaPayload(profile: SajuProfile) {
  const reading = readDohwa(profile);
  const type = DOHWA_TYPES[reading.typeKey];
  const bloom = nextBloomMonth(profile, reading);
  return {
    score: reading.score,
    grade: gradeOf(reading.score).label,
    type: `${type.name}(${type.hanja}) · ${type.alias}`,
    indices: Object.fromEntries(CHARM_INDICES.map((index) => [index.label, reading.indices[index.key]])),
    /** 무료 화면에 이미 보여 준 도화가 피는 달. 만남 시기 소제목은 이 값만 쓴다. */
    bloomMonth: {
      year: bloom.year,
      month: bloom.month,
      label: `${bloom.year}년 ${bloom.month}월`,
      branch: bloom.hanja,
    },
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

/** AI에 넘길 사주 데이터. 이름·이메일·생년월일 원문은 넣지 않는다. */
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
    yearlyFortunes: profile.yearlyFortunes.slice(0, LOVE_TIMELINE_YEARS).map((year) => ({
      year: year.year,
      age: year.age,
      ganji: `${year.hanja}(${year.korean})`,
      tenGods: `${year.stem.tenGod}/${year.branch.tenGod}`,
      twelveStage: year.branch.twelveStage,
    })),
  };
}

export function buildReportInput(profile: SajuProfile, context: ReportContext): string {
  return [
    "<saju>",
    JSON.stringify(sajuPayload(profile)),
    "</saju>",
    "<dohwa>",
    JSON.stringify(dohwaPayload(profile)),
    "</dohwa>",
    `<life>연애 상태: ${relationshipLabel(context.relationshipStatus)} / 상대를 부르는 말: ${profile.calculation.gender === "female" ? "남자" : "여자"}</life>`,
  ].join("\n");
}
