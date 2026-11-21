const ROWS = [
  { label: "분량", a: "한 줄~짧은 글", b: "상담 시간만큼", c: "8챕터 설계서" },
  { label: "근거 설명", a: "거의 없음", b: "말로만", c: "명리 근거 명시" },
  { label: "해결책", a: "없음", b: "상황에 따라", c: "우회로까지 기록" },
  { label: "재열람", a: "어려움", b: "녹음·메모 의존", c: "링크 영구 열람" },
] as const;

export function PriceCompare() {
  return (
    <div className="ny-compare">
      <div className="ny-compare-head">
        <span />
        <span>신년운세</span>
        <span>대면 상담</span>
        <span className="is-focus">운명내비</span>
      </div>
      {ROWS.map((row) => (
        <div key={row.label} className="ny-compare-row">
          <span className="ny-compare-label">{row.label}</span>
          <span>{row.a}</span>
          <span>{row.b}</span>
          <span className="is-focus">{row.c}</span>
        </div>
      ))}
      <div className="ny-compare-foot">
        <span />
        <span>한 줄 풀이</span>
        <span>30분 · 10만 원대</span>
        <span className="is-focus">평생 다시 여는 설계서</span>
      </div>
    </div>
  );
}
