"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StickyFormCta } from "@/components/newyear/StickyFormCta";

const POLL_MS = 2000;
const GIVE_UP_MS = 5 * 60 * 1000;
const PROGRESS_TIME_CONSTANT_MS = 4000;
const MAX_PENDING_PROGRESS = 0.95;

const CHECKLIST = ["사주 원국을 세우는 중", "대운의 흐름을 읽는 중", "인생 설계서를 정리하는 중"];

/** FateNavi2 직결제 후: 유료 리포트 생성 완료까지 프리미엄 로딩 UI. */
export function NewYearAfterPayLoading({ token }: { token: string }) {
  const router = useRouter();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef(Date.now());
  const reportHref = `/FateNavi/report/${token}`;

  useEffect(() => {
    let active = true;
    startRef.current = Date.now();
    const tick = window.setInterval(() => setElapsedMs(Date.now() - startRef.current), 200);

    const poll = async () => {
      while (active) {
        if (Date.now() - startRef.current > GIVE_UP_MS) {
          setTimedOut(true);
          return;
        }
        try {
          const response = await fetch(`/api/analysis/${token}`, { cache: "no-store" });
          const data = (await response.json().catch(() => ({}))) as {
            paid?: boolean;
            reportReady?: boolean;
            message?: string;
          };
          if (!response.ok) {
            setError(data.message ?? "리포트 상태를 확인하지 못했습니다.");
            return;
          }
          if (data.paid && data.reportReady) {
            router.replace(reportHref);
            return;
          }
          if (data.paid && !data.reportReady) {
            // 생성 중 — 계속 폴링
          } else if (!data.paid) {
            // 웹훅 지연 — 계속 대기
          }
        } catch {
          // 다음 폴링
        }
        await new Promise((resolve) => window.setTimeout(resolve, POLL_MS));
      }
    };
    void poll();
    return () => {
      active = false;
      window.clearInterval(tick);
    };
  }, [reportHref, router, token]);

  const progress = timedOut || error
    ? 1
    : Math.min(1 - Math.exp(-elapsedMs / PROGRESS_TIME_CONSTANT_MS), MAX_PENDING_PROGRESS);

  return (
    <div className="ny-loading">
      <div className="ny-loading-media" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/fatenavi4/loading-ink.jpg" alt="" className="ny-loading-img" />
        <div className="ny-loading-scrim" />
      </div>
      <div className="ny-loading-body">
        {!timedOut && !error ? (
          <>
            <p className="ny-loading-title whitespace-pre-line">{"인생 설계서를\n펼치는 중"}</p>
            <div
              role="progressbar"
              aria-label="사주를 읽는 중"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              className="ny-loading-bar"
            >
              <motion.div
                className="ny-loading-bar-fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <ul className="ny-loading-checklist" aria-label="진행 단계">
              {CHECKLIST.map((item, index) => {
                const done = progress >= (index + 1) / (CHECKLIST.length + 0.35);
                return (
                  <li key={item} className={`ny-loading-checklist-item${done ? " is-done" : ""}`}>
                    <span className="ny-loading-checklist-mark" aria-hidden>
                      {done ? "✓" : ""}
                    </span>
                    <span>{item}</span>
                  </li>
                );
              })}
            </ul>
            <p className="ny-loading-caption">프리미엄 사주를 정리하는 중</p>
          </>
        ) : (
          <>
            <p className="ny-loading-title">
              {error ? "리포트 확인에 문제가 있습니다" : "리포트 작성이 조금 더 걸리고 있습니다"}
            </p>
            <p className="ny-loading-caption">
              {error ?? "잠시 후 리포트 페이지에서 확인할 수 있어요."}
            </p>
          </>
        )}
      </div>
      {(timedOut || error) && (
        <StickyFormCta>
          <a href={reportHref} className="ny-cta">
            리포트 확인하기
          </a>
        </StickyFormCta>
      )}
    </div>
  );
}
