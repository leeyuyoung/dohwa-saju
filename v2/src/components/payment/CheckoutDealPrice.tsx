"use client";

import { useEffect, useState } from "react";
import {
  DETAILED_REPORT_LIST_PRICE,
  DETAILED_REPORT_PRICE,
  formatPrice,
  formatWon,
} from "@/lib/constants/service";

/** 서울 자정까지 남은 밀리초. 할인특가 타이머용. */
function msUntilSeoulMidnight(now = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(now));
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  const asUtcMs = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  const nextMidnightAsUtc = Date.UTC(get("year"), get("month") - 1, get("day") + 1, 0, 0, 0);
  return Math.max(0, nextMidnightAsUtc - asUtcMs);
}

function formatRemain(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

type CheckoutDealPriceProps = {
  /** 결제 카드는 오른쪽, sticky CTA는 가운데. */
  align?: "end" | "center";
  /** false면 할인특가·타이머만 두고 가격은 숨긴다(CTA용). */
  showPrice?: boolean;
};

/** 할인특가 배지·자정 타이머. 결제 카드에서는 취소선 정가·할인가도 붙인다. */
export function CheckoutDealPrice({ align = "end", showPrice = true }: CheckoutDealPriceProps) {
  const [remainMs, setRemainMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemainMs(msUntilSeoulMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const centered = align === "center";

  return (
    <div className={`flex flex-col gap-1.5 ${centered ? "items-center text-center" : "items-end text-right"}`}>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#e11d48] px-2.5 py-0.5 font-gothic text-[11px] font-medium tracking-[-0.01em] text-white">
          할인특가
        </span>
        <span
          className="font-mono text-[13px] tabular-nums tracking-wide text-[#e11d48]"
          aria-live="polite"
          aria-label={remainMs === null ? "할인 남은 시간 불러오는 중" : `할인 남은 시간 ${formatRemain(remainMs)}`}
        >
          {remainMs === null ? "--:--:--" : formatRemain(remainMs)}
        </span>
      </div>
      {showPrice && (
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[14px] text-mist-dim line-through">{formatWon(DETAILED_REPORT_LIST_PRICE)}</span>
          <span className={`font-serif text-gold-soft ${centered ? "text-[17px]" : "text-lg"}`}>
            {formatPrice(DETAILED_REPORT_PRICE)}
          </span>
        </div>
      )}
    </div>
  );
}
