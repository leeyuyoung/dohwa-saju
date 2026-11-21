"use client";

import { useEffect, useState } from "react";
import { NEWYEAR_READING_COUNT_DISPLAY } from "@/lib/constants/newyear";

/** CTA 위 풀이 수. 1초마다 2명씩 올리며 두근거림. */
export function ReadingCountBubble() {
  const [count, setCount] = useState(NEWYEAR_READING_COUNT_DISPLAY);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCount((value) => value + 2);
      setBeat((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p key={beat} className="ny-cta-bubble ny-cta-bubble--beat">
      <span className="ny-cta-bubble-num">{count.toLocaleString("ko-KR")}</span>
      명 풀이 중
    </p>
  );
}
