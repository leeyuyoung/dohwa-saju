"use client";

import { useState } from "react";
import { NEWYEAR_ROUTE_FROM, NEWYEAR_ROUTE_TO } from "@/lib/constants/newyear";

type SignalKind = "go" | "warn" | "stop";

const YEARS = Array.from(
  { length: NEWYEAR_ROUTE_TO - NEWYEAR_ROUTE_FROM + 1 },
  (_, index) => NEWYEAR_ROUTE_FROM + index,
);

function signalOf(year: number): SignalKind {
  const offset = year - NEWYEAR_ROUTE_FROM;
  return (["go", "warn", "stop"] as const)[offset % 3]!;
}

const BLURBS: Record<SignalKind, string> = {
  go: "흐름이 열리는 구간. 확장보다 정비가 잘 먹힐 수 있습니다.",
  warn: "속도 조절이 필요한 구간. 큰 결정보다 현금·관계를 먼저 보세요.",
  stop: "정체·충돌이 쉬운 구간. 무리한 확장은 미루고 우회로를 쓰세요.",
};

export function RouteTimeline() {
  const [active, setActive] = useState(YEARS[2] ?? NEWYEAR_ROUTE_FROM);
  const kind = signalOf(active);

  return (
    <div className="ny-route">
      <div className="ny-route-track" role="list">
        {YEARS.map((year) => {
          const signal = signalOf(year);
          const selected = year === active;
          return (
            <button
              key={year}
              type="button"
              role="listitem"
              className={`ny-route-node${selected ? " is-on" : ""}`}
              data-signal={signal}
              aria-pressed={selected}
              onClick={() => setActive(year)}
            >
              <i className="ny-signal" data-signal={signal} aria-hidden />
              <span>{String(year).slice(2)}</span>
            </button>
          );
        })}
      </div>
      <div className={`ny-route-card ny-segment-${kind}`}>
        <p className="ny-segment-label">
          <span className="ny-signal" data-signal={kind} aria-hidden />
          {active}년
        </p>
        <p className="ny-body mt-2" style={{ color: "inherit" }}>
          {BLURBS[kind]}
        </p>
      </div>
    </div>
  );
}
