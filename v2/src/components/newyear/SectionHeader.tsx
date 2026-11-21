export function SectionHeader({
  number,
  en,
  title,
  dark = false,
}: {
  number: number;
  en: string;
  title: string;
  dark?: boolean;
}) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="ny-section-num">{String(number).padStart(2, "0")}</span>
        <p className="ny-en">{en}</p>
      </div>
      <h2 className={`ny-sub ${dark ? "text-[var(--ny-ink)]" : "text-[var(--text)]"}`}>{title}</h2>
      <div className={`h-px w-full ${dark ? "bg-white/15" : "bg-[var(--line)]"}`} />
    </header>
  );
}
