type SegmentKind = "go" | "warn" | "stop";

export function SegmentCard({
  year,
  kind = "stop",
  ground,
  likely,
  detour,
}: {
  year: string;
  kind?: SegmentKind;
  ground: string;
  likely: string;
  detour: string;
}) {
  const label = kind === "go" ? "강점 구간" : kind === "warn" ? "주의 구간" : "정체 구간";
  return (
    <article className={`ny-segment ny-segment-${kind}`}>
      <p className="ny-segment-label">
        <span className="ny-signal" data-signal={kind} aria-hidden />
        구간: {year} ({label})
      </p>
      <dl className="ny-segment-blocks">
        <div>
          <dt>근거</dt>
          <dd>{ground}</dd>
        </div>
        <div>
          <dt>이런 일이 생기기 쉬워요</dt>
          <dd>{likely}</dd>
        </div>
        <div>
          <dt>우회로</dt>
          <dd>{detour}</dd>
        </div>
      </dl>
    </article>
  );
}
