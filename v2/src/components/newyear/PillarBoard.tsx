import type { NewYearPillar } from "@/lib/server/newyearView";

const STEM: Record<string, string> = {
  甲: "목",
  乙: "목",
  丙: "화",
  丁: "화",
  戊: "토",
  己: "토",
  庚: "금",
  辛: "금",
  壬: "수",
  癸: "수",
};

const BRANCH: Record<string, string> = {
  寅: "목",
  卯: "목",
  巳: "화",
  午: "화",
  辰: "토",
  戌: "토",
  丑: "토",
  未: "토",
  申: "금",
  酉: "금",
  亥: "수",
  子: "수",
};

function EmptyHourPillar() {
  return (
    <div className="ny-pillar ny-pillar-empty" aria-label="시주 없음">
      <span className="ny-caption text-[11px]">시주</span>
      <span className="ny-hanja ny-hanja-empty" aria-hidden />
      <span className="ny-hanja ny-hanja-empty mt-1" aria-hidden />
      <span className="ny-caption text-[11px]">&nbsp;</span>
    </div>
  );
}

export function PillarBoard({
  pillars,
  showEmptyHour = false,
}: {
  pillars: NewYearPillar[];
  showEmptyHour?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {showEmptyHour ? <EmptyHourPillar /> : null}
      {pillars.map((pillar) => (
        <div key={pillar.label} className="ny-pillar">
          <span className="ny-caption text-[11px]">{pillar.stemTenGod || pillar.label}</span>
          <span className="ny-hanja" data-el={STEM[pillar.stem] ?? ""}>
            {pillar.stem}
          </span>
          <span className="ny-hanja mt-1" data-el={BRANCH[pillar.branch] ?? ""}>
            {pillar.branch}
          </span>
          <span className="ny-caption text-[11px]">{pillar.branchTenGod}</span>
        </div>
      ))}
    </div>
  );
}
