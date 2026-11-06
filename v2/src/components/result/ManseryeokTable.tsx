import { OrnateFrameCard } from "@/components/result/OrnateFrameCard";
import { ELEMENT_LABELS, PILLAR_LABELS, TEN_GOD_LABELS, TWELVE_STAGE_LABELS } from "@/lib/constants/sajuLabels";
import { isPeachBranch } from "@/lib/saju/dohwa";
import type { FiveElementKey, PillarView } from "@/types/result";

const ELEMENT_COLOR: Record<FiveElementKey, string> = {
  wood: "var(--color-wood)",
  fire: "var(--color-fire)",
  earth: "var(--color-earth)",
  metal: "var(--color-metal)",
  water: "var(--color-water)",
};

const COLUMN_ORDER: PillarView["label"][] = ["시주", "일주", "월주", "년주"];

type ManseryeokTableProps = {
  name: string;
  dayPillarName: string;
  birthLabel: string;
  pillars: PillarView[];
};

export function ManseryeokTable({ name, dayPillarName, birthLabel, pillars }: ManseryeokTableProps) {
  const columns = COLUMN_ORDER.map((label) => pillars.find((pillar) => pillar.label === label) ?? null);
  const me = pillars.find((pillar) => pillar.label === "일주")?.stem;

  return (
    <OrnateFrameCard variant="medium" bodyClassName="justify-between">
      <div className="flex shrink-0 items-center gap-3 border-b border-[rgb(232_200_154_/_0.22)] px-2 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cinnabar/40 bg-crimson-deep/60 font-eerie text-lg text-blossom">
          {me?.hanja}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="font-serif text-[14px] text-paper">
            {name}
            {me && <span className="ml-1.5 text-[11px] text-blossom">· {ELEMENT_LABELS[me.element].name}의 기운을 타고난 아이</span>}
          </span>
          <span className="text-[11px] text-mist">
            {dayPillarName} · {birthLabel}
          </span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[2.2rem_repeat(4,1fr)] content-center gap-x-1.5 gap-y-1 px-1.5 py-2 text-center">
        <span />
        {COLUMN_ORDER.map((label) => (
          <span key={label} className={`text-[10px] ${label === "일주" ? "text-cinnabar" : "text-mist-dim"}`}>
            {PILLAR_LABELS[label]}
          </span>
        ))}

        <RowLabel>성향</RowLabel>
        {columns.map((pillar, index) => (
          <SmallCell key={index}>{pillar ? TEN_GOD_LABELS[pillar.stem.tenGod] : "-"}</SmallCell>
        ))}

        <RowLabel>하늘</RowLabel>
        {columns.map((pillar, index) => (
          <GlyphTile key={index} glyph={pillar?.stem ?? null} highlight={pillar?.label === "일주"} />
        ))}

        <RowLabel>땅</RowLabel>
        {columns.map((pillar, index) => (
          <GlyphTile
            key={index}
            glyph={pillar?.branch ?? null}
            peach={pillar ? isPeachBranch(pillar.branch.korean) : false}
          />
        ))}

        <RowLabel>성향</RowLabel>
        {columns.map((pillar, index) => (
          <SmallCell key={index}>{pillar ? TEN_GOD_LABELS[pillar.branch.tenGod] : "-"}</SmallCell>
        ))}

        <RowLabel>기운</RowLabel>
        {columns.map((pillar, index) => (
          <SmallCell key={index}>{pillar ? TWELVE_STAGE_LABELS[pillar.branch.twelveStage] : "-"}</SmallCell>
        ))}
      </div>

      {!columns[0] && (
        <p className="shrink-0 border-t border-[rgb(232_200_154_/_0.22)] px-2 py-2 text-[10px] leading-relaxed text-mist-dim">
          출생 시간을 몰라 태어난 시 칸은 비워 뒀다.
        </p>
      )}
    </OrnateFrameCard>
  );
}

function RowLabel({ children }: { children: string }) {
  return <span className="flex items-center justify-center text-[10px] text-mist-dim">{children}</span>;
}

function SmallCell({ children }: { children: string }) {
  return <span className="py-1 text-[11px] text-mist break-keep">{children}</span>;
}

function GlyphTile({
  glyph,
  highlight = false,
  peach = false,
}: {
  glyph: PillarView["stem"] | null;
  highlight?: boolean;
  /** 도화 글자(자·오·묘·유)일 때 꽃빛으로 짚어 준다 */
  peach?: boolean;
}) {
  if (!glyph) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-line/70 bg-ink/40">
        <span className="font-serif text-xl text-mist-dim/60">?</span>
      </div>
    );
  }
  const color = ELEMENT_COLOR[glyph.element];
  return (
    <div
      className={`relative flex aspect-square items-center justify-center rounded-2xl border ${
        peach
          ? "ring-1 ring-blossom/80 shadow-[0_0_18px_rgb(232_137_155_/_0.45)]"
          : highlight
            ? "ring-1 ring-cinnabar/70"
            : ""
      }`}
      style={{
        backgroundColor: peach
          ? `color-mix(in srgb, ${color} 22%, rgb(232 137 155 / 0.18))`
          : `color-mix(in srgb, ${color} 16%, transparent)`,
        borderColor: peach
          ? `color-mix(in srgb, var(--color-blossom) 55%, ${color})`
          : `color-mix(in srgb, ${color} 45%, transparent)`,
      }}
    >
      <span className="font-serif text-[30px] leading-none" style={{ color }}>
        {glyph.hanja}
      </span>
      {peach && (
        <span aria-label="도화" className="absolute top-0.5 left-1 text-[11px] leading-none">
          🪷
        </span>
      )}
    </div>
  );
}
