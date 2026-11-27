"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { StickyFormCta } from "@/components/newyear/StickyFormCta";

const POLL_MS = 3000;
const RETRY_COOLDOWN_MS = 60_000;
const STEP1_DONE_MS = 520;
/** 미리보기: step1 체크 후 step2 스피너 유지 시간 */
const DEMO_STEP2_SPIN_MS = 1700;

type Phase = "generating" | "ready";
type StepStatus = "pending" | "active" | "done";

function IconCheck() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M6.2 10.2l2.4 2.4 5.2-5.2"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCircle() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2.75" y="4.75" width="14.5" height="10.5" rx="1.6" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M3.4 6.2L10 11.1l6.6-4.9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="ny-afterpay-spinner" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle
        cx="10"
        cy="10"
        r="8.25"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.22"
      />
      <circle
        cx="10"
        cy="10"
        r="8.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeDasharray="14 38"
      />
    </svg>
  );
}

function StepIcon({ status, pendingIcon }: { status: StepStatus; pendingIcon?: "mail" | "circle" }) {
  return (
    <span className="ny-afterpay-step-icon">
      <AnimatePresence mode="wait" initial={false}>
        {status === "done" ? (
          <motion.span
            key="check"
            className="ny-afterpay-step-icon-inner"
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 24, mass: 0.7 }}
          >
            <IconCheck />
          </motion.span>
        ) : status === "active" ? (
          <motion.span
            key="spinner"
            className="ny-afterpay-step-icon-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <IconSpinner />
          </motion.span>
        ) : (
          <motion.span
            key="pending"
            className="ny-afterpay-step-icon-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {pendingIcon === "mail" ? <IconMail /> : <IconCircle />}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * FateNavi premium 직결제 후 안내.
 * 생성/폴링/재시도는 백그라운드에서만 하고, 실패·오류는 UI에 노출하지 않는다.
 * ready일 때만 「리포트 보러 가기」로 전환한다.
 */
export function NewYearAfterPayLoading({
  token,
  demoReady = false,
}: {
  token: string;
  /** 로컬 미리보기: API 폴링 없이 순차 애니메이션 후 ready */
  demoReady?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("generating");
  const [step1, setStep1] = useState<StepStatus>("pending");
  const [step2, setStep2] = useState<StepStatus>("pending");
  const reportHref = demoReady
    ? "/FateNavi/report/sample"
    : `/FateNavi/report/${token}`;
  const lastRetryAt = useRef(0);
  const triggeredOnce = useRef(false);
  const reportReadyRef = useRef(false);
  const isReady = phase === "ready";

  // 진입: step1 짧은 딜레이 후 체크 → step2 active(스피너). 이미 ready면 step2도 바로 done.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setStep1("done");
      setStep2(reportReadyRef.current ? "done" : "active");
    }, STEP1_DONE_MS);
    return () => window.clearTimeout(t);
  }, []);

  // 미리보기: step1 → step2 스피너 → ready (폴링 없음)
  useEffect(() => {
    if (!demoReady) return;
    const t = window.setTimeout(() => {
      reportReadyRef.current = true;
      setPhase("ready");
      setStep1("done");
      setStep2("done");
    }, STEP1_DONE_MS + DEMO_STEP2_SPIN_MS);
    return () => window.clearTimeout(t);
  }, [demoReady]);

  useEffect(() => {
    if (demoReady) return;

    let active = true;

    const markReady = () => {
      reportReadyRef.current = true;
      if (!active) return;
      setPhase("ready");
      setStep1("done");
      setStep2("done");
    };

    const triggerGeneration = async () => {
      const now = Date.now();
      if (triggeredOnce.current && now - lastRetryAt.current < RETRY_COOLDOWN_MS) return;
      triggeredOnce.current = true;
      lastRetryAt.current = now;
      try {
        await fetch(`/api/analysis/${token}`, { method: "POST" });
      } catch {
        // 조용히 다음 폴링에서 다시 시도
      }
    };

    const poll = async () => {
      await triggerGeneration();

      while (active) {
        try {
          const response = await fetch(`/api/analysis/${token}`, { cache: "no-store" });
          const data = (await response.json().catch(() => ({}))) as {
            status?: string;
            paid?: boolean;
            reportReady?: boolean;
          };

          if (data.reportReady) {
            markReady();
            return;
          }

          // failed·미결제·네트워크 오류 모두 생성 중 UI 유지. 실패 시만 조용히 재시도.
          if (data.status === "failed" || (data.paid && data.status !== "generating")) {
            await triggerGeneration();
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
    };
  }, [token, demoReady]);

  const step1Class =
    step1 === "done" ? " is-done" : step1 === "active" ? " is-active" : " is-pending";
  const step2Class =
    step2 === "done" ? " is-done" : step2 === "active" ? " is-active" : " is-pending";
  const step3Class = isReady ? " is-done" : " is-pending";

  return (
    <div className={`ny-afterpay${isReady ? " is-ready" : ""}`}>
      <motion.div
        className="ny-afterpay-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="ny-afterpay-intro">
          <h1 className="ny-afterpay-title">결제가 완료되었습니다.</h1>
          <p className="ny-afterpay-lead">
            {isReady
              ? "종합사주 리포트가 준비되었습니다. 아래에서 바로 확인하세요."
              : "당신만을 위한 종합사주 리포트를 제작하고 있습니다."}
          </p>
        </div>

        <div className="ny-afterpay-divider" aria-hidden />

        <section className="ny-afterpay-progress" aria-live="polite">
          <div className="ny-afterpay-progress-head">
            <span className={`ny-afterpay-badge${isReady ? " is-done" : ""}`}>
              {isReady ? "완료" : "진행 중"}
            </span>
            <h2 className="ny-afterpay-progress-title">리포트 제작 현황</h2>
          </div>

          <ol className="ny-afterpay-steps">
            <li className={`ny-afterpay-step${step1Class}`}>
              <StepIcon status={step1} />
              <span className="ny-afterpay-step-label">결제 및 정보 확인</span>
              <span className="ny-afterpay-step-state">
                {step1 === "done" ? "완료" : "확인 중"}
              </span>
            </li>
            <li className={`ny-afterpay-step${step2Class}`}>
              <StepIcon status={step2} />
              <span className="ny-afterpay-step-label">사주 분석 및 리포트 생성</span>
              <span className="ny-afterpay-step-state">
                {step2 === "done" ? "완료" : step2 === "active" ? "진행 중" : "대기 중"}
              </span>
            </li>
            <li className={`ny-afterpay-step${step3Class}`}>
              <StepIcon status={isReady ? "done" : "pending"} pendingIcon="mail" />
              <span className="ny-afterpay-step-label">이메일 발송</span>
              <span className="ny-afterpay-step-state">
                {isReady ? "발송 예정" : "대기 중"}
              </span>
            </li>
          </ol>
        </section>

        <div className="ny-afterpay-divider" aria-hidden />

        <aside className="ny-afterpay-delivery">
          <p className="ny-afterpay-delivery-title">최대 6시간 이내 이메일 발송</p>
          <p className="ny-afterpay-delivery-copy">
            완성된 리포트는 입력하신 이메일로 보내드립니다.
          </p>
        </aside>
      </motion.div>

      {isReady ? (
        <StickyFormCta>
          <a href={reportHref} className="ny-cta">
            리포트 보러 가기
          </a>
        </StickyFormCta>
      ) : null}
    </div>
  );
}
