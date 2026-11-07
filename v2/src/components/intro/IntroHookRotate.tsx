"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const HOOK_LINES = ["홀리는 데는 다 이유가 있어", "도화살… 너한테도 있을까?"] as const;
const INTERVAL_MS = 2800;

/**
 * CTA 위 흥미 문구 + 방문 수. 순서대로 바꿔 보여 준다.
 */
export function IntroHookRotate() {
  const still = !!useReducedMotion();
  const [index, setIndex] = useState(0);
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/funnel", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { count?: unknown } | null) => {
        if (cancelled) return;
        const value = typeof data?.count === "number" && Number.isFinite(data.count) ? Math.max(0, Math.floor(data.count)) : 0;
        setVisitCount(value);
      })
      .catch(() => {
        if (!cancelled) setVisitCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(() => {
    const hooks = HOOK_LINES.map((text) => ({ key: text, content: text as ReactNode }));
    if (visitCount === null) return hooks;
    return [
      ...hooks,
      {
        key: `visit-${visitCount}`,
        content: (
          <>
            지금까지{" "}
            <span className="font-medium text-blossom-glow tabular-nums">{visitCount.toLocaleString("ko-KR")}</span>
            명 풀이했어요
          </>
        ),
      },
    ];
  }, [visitCount]);

  useEffect(() => {
    if (still || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [still, slides.length]);

  const safeIndex = index % slides.length;
  const slide = still ? slides[0] : slides[safeIndex];

  return (
    <div className="mb-3 flex min-h-8 w-full max-w-md items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={slide.key}
          initial={still ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={still ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-full bg-black/45 px-4 py-2 text-center font-sans text-[13px] tracking-[-0.01em] text-paper/95 backdrop-blur-sm break-keep"
        >
          {slide.content}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
