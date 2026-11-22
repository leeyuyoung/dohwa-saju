import type { EarthlyBranch, HeavenlyStem } from "manseryeok";
import type { FiveElementKey, PillarPosition, SajuProfile } from "./profileTypes";

/**
 * 색기력·신살을 만세력 결과만으로 계산한다. AI를 쓰지 않으므로 같은 사주는 항상 같은 값이 나온다.
 * 색기력 = 관능·유혹·요염 가중합(도화 끌어당김과 등치하지 않음).
 * 도화·화개는 년지·일지의 삼합 기준, 홍염은 일간 기준 표를 쓴다.
 */

type TriadGroup = { members: EarthlyBranch[]; dohwa: EarthlyBranch; hwagae: EarthlyBranch };

const TRIAD_GROUPS: TriadGroup[] = [
  { members: ["인", "오", "술"], dohwa: "묘", hwagae: "술" },
  { members: ["신", "자", "진"], dohwa: "유", hwagae: "진" },
  { members: ["사", "유", "축"], dohwa: "오", hwagae: "축" },
  { members: ["해", "묘", "미"], dohwa: "자", hwagae: "미" },
];

const HONGYEOM: Record<HeavenlyStem, EarthlyBranch> = {
  갑: "오",
  을: "오",
  병: "인",
  정: "미",
  무: "진",
  기: "진",
  경: "술",
  신: "유",
  임: "자",
  계: "신",
};

/** 子午卯酉. 그 자체로 도화의 기운이 강한 글자 */
export const PEACH_BRANCHES: EarthlyBranch[] = ["자", "오", "묘", "유"];

/** 원국 지지 중 도화 글자(자·오·묘·유)인지 */
export function isPeachBranch(korean: string): boolean {
  return (PEACH_BRANCHES as readonly string[]).includes(korean);
}

/** 원국에 새겨진 도화 글자 개수 */
export function countPeachBranches(pillars: { branch: { korean: string } }[]): number {
  return pillars.filter((pillar) => isPeachBranch(pillar.branch.korean)).length;
}

export type CharmStarKey = "dohwa" | "hongyeom" | "hwagae";

export type CharmStar = {
  key: CharmStarKey;
  name: string;
  hanja: string;
  /** 이 살이 놓인 기둥. 비어 있으면 사주에 없다. */
  positions: PillarPosition[];
  /** 이 살을 이루는 지지. 대운·세운에서 이 글자가 들어오면 살이 깨어난다. */
  triggers: EarthlyBranch[];
  /** 원국에 있으면 80~99, 없으면 잠재력으로 70~79 */
  score: number;
};

/** 화면에 보이는 색기 3축. 히어로 색기력은 이 셋의 가중 합. */
export type CharmIndexKey = "sensual" | "flirt" | "enchant";

export type DohwaReading = {
  /** 히어로 색기력 78~99. indices도 같은 범위 */
  score: number;
  indices: Record<CharmIndexKey, number>;
  /** 도화살·자오묘유 기반. 히어로가 아님 — 재료/서브 */
  dohwaPower: number;
  stars: CharmStar[];
  /** 유형은 일간 오행으로 정한다. */
  typeKey: FiveElementKey;
};

const SCORE_RANGE = { min: 40, max: 99 } as const;
/** 누구에게나 꽃은 있다는 세계관에 맞춰 점수의 바닥을 올려 둔다. 종합 점수 중앙값이 70점대 초반이 된다. */
const SCORE_LIFT = 5;
const clampScore = (value: number) => Math.round(Math.min(SCORE_RANGE.max, Math.max(SCORE_RANGE.min, value)));
/**
 * 실망하지 않도록 화면에는 78점 미만이 나오지 않게, 계산한 점수를 순서는 지킨 채 78~99점으로 옮겨 보여준다.
 * 계산 점수는 실제로 55점 아래가 거의 없어서 55점을 바닥으로 잡아야 점수가 고르게 퍼진다.
 */
const DISPLAY_RANGE = { min: 78, max: 99 } as const;
const RAW_FLOOR = 55;
const toDisplay = (value: number) =>
  Math.round(
    DISPLAY_RANGE.min +
      (Math.max(0, value - RAW_FLOOR) * (DISPLAY_RANGE.max - DISPLAY_RANGE.min)) / (SCORE_RANGE.max - RAW_FLOOR),
  );

const triadOf = (branch: EarthlyBranch) => TRIAD_GROUPS.find((group) => group.members.includes(branch))!;

function triadStarTriggers(profile: SajuProfile, pick: (group: TriadGroup) => EarthlyBranch): EarthlyBranch[] {
  const bases = profile.pillars.filter((pillar) => pillar.position === "year" || pillar.position === "day");
  return [...new Set(bases.map((base) => pick(triadOf(base.branch.korean))))];
}

function triadStarPositions(profile: SajuProfile, pick: (group: TriadGroup) => EarthlyBranch): PillarPosition[] {
  const found = new Set<PillarPosition>();
  for (const base of profile.pillars.filter((pillar) => pillar.position === "year" || pillar.position === "day")) {
    const target = pick(triadOf(base.branch.korean));
    for (const pillar of profile.pillars) {
      if (pillar.position !== base.position && pillar.branch.korean === target) found.add(pillar.position);
    }
  }
  return profile.pillars.map((pillar) => pillar.position).filter((position) => found.has(position));
}

/** 살이 놓인 자리마다 더하는 점수. 나 자신과 가장 가까운 일지가 가장 짙다. */
const STAR_POSITION_WEIGHT: Record<PillarPosition, number> = { day: 6, month: 4, hour: 3, year: 2 };

/**
 * 매력살 점수. 원국에 있으면 자리와 개수로 80~99점,
 * 없으면 70점에서 시작해 앞으로 10년 세운과 남은 대운에 살을 깨우는 글자가 들어오는 만큼 79점까지 올린다.
 */
function starScore(profile: SajuProfile, positions: PillarPosition[], triggers: EarthlyBranch[]): number {
  if (positions.length > 0) {
    const weight = positions.reduce((sum, position) => sum + STAR_POSITION_WEIGHT[position], 0);
    return Math.min(99, 82 + weight + (positions.length - 1) * 4);
  }
  const years = profile.yearlyFortunes.filter((fortune) => triggers.includes(fortune.branch.korean)).length;
  const periods = profile.luck.periods.filter(
    (period) => period.startYear + 9 >= profile.referenceDate.year && triggers.includes(period.branch.korean),
  ).length;
  return 70 + Math.min(9, years * 2 + periods * 3);
}

export function readDohwa(profile: SajuProfile): DohwaReading {
  const hongyeomTarget = HONGYEOM[profile.dayMaster.korean];
  const starBases: Omit<CharmStar, "score">[] = [
    {
      key: "dohwa",
      name: "도화살",
      hanja: "桃花煞",
      positions: triadStarPositions(profile, (group) => group.dohwa),
      triggers: triadStarTriggers(profile, (group) => group.dohwa),
    },
    {
      key: "hongyeom",
      name: "홍염살",
      hanja: "紅艶煞",
      positions: profile.pillars.filter((pillar) => pillar.branch.korean === hongyeomTarget).map((pillar) => pillar.position),
      triggers: [hongyeomTarget],
    },
    {
      key: "hwagae",
      name: "화개살",
      hanja: "華蓋煞",
      positions: triadStarPositions(profile, (group) => group.hwagae),
      triggers: triadStarTriggers(profile, (group) => group.hwagae),
    },
  ];
  const stars: CharmStar[] = starBases.map((star) => ({ ...star, score: starScore(profile, star.positions, star.triggers) }));
  const starOf = (key: CharmStarKey) => stars.find((star) => star.key === key)!;
  const starCount = (key: CharmStarKey) => starOf(key).positions.length;
  const positionWeight = (key: CharmStarKey) =>
    starOf(key).positions.reduce((sum, position) => sum + STAR_POSITION_WEIGHT[position], 0);

  const branches = profile.pillars.map((pillar) => pillar.branch);
  const peach = branches.filter((branch) => PEACH_BRANCHES.includes(branch.korean)).length;
  const bath = branches.filter((branch) => branch.twelveStage === "목욕").length;
  const dayBranchPeach = PEACH_BRANCHES.includes(profile.pillars.find((pillar) => pillar.position === "day")!.branch.korean);
  const { counts } = profile.fiveElements;
  const groups = profile.tenGodGroups;
  const partner = profile.calculation.gender === "female" ? groups.관성 : groups.재성;

  const lifted = (raw: number) => clampScore(raw + SCORE_LIFT);

  /** 관능: 홍염·수/화·일지 도화·목욕 — 분위기·결의 야함 */
  const sensual = lifted(
    48 + positionWeight("hongyeom") * 2 + starCount("hongyeom") * 8 + (dayBranchPeach ? 6 : 0) + counts.water * 4 + counts.fire * 3 + bath * 4,
  );
  /** 유혹: 식상·화·관성/재성 — 말투·거리감으로 흔듦 */
  const flirt = lifted(48 + groups.식상 * 8 + counts.fire * 4 + partner * 3);
  /** 요염: 화개·인성·수 + 도화살 소량 — 묘하고 은근한 아우라. 도화 없어도 성립 */
  const enchant = lifted(48 + starCount("hwagae") * 12 + positionWeight("hwagae") + groups.인성 * 5 + counts.water * 3 + starCount("dohwa") * 4);

  const indices: Record<CharmIndexKey, number> = { sensual, flirt, enchant };
  /** 색기력 = 관능 0.4 + 유혹 0.3 + 요염 0.3 */
  const saekgi = clampScore(sensual * 0.4 + flirt * 0.3 + enchant * 0.3);
  const dohwaPower = lifted(52 + starCount("dohwa") * 14 + peach * 6);

  const displayIndices = Object.fromEntries(
    Object.entries(indices).map(([key, value]) => [key, toDisplay(value)]),
  ) as Record<CharmIndexKey, number>;

  return {
    score: toDisplay(saekgi),
    indices: displayIndices,
    dohwaPower: toDisplay(dohwaPower),
    stars,
    typeKey: profile.dayMaster.element,
  };
}
