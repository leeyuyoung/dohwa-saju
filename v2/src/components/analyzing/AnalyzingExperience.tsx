"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { MythicButtonLink } from "@/components/ui/MythicButtonLink";
import { trackFunnel } from "@/lib/client/funnel";
import { trackKarrot } from "@/lib/client/karrotPixel";
import { clearPendingAnalysis, loadPendingAnalysis } from "@/lib/client/inputStorage";
import { ANALYSIS_MISSING_COPY, ANALYSIS_READY_COPY, ANALYSIS_WORKING_COPY } from "@/lib/constants/service";
import { analysisInputSchema } from "@/lib/validation/analysisInput";

const LOADING_VIDEO_SRC = "/videos/loading/ritual.mp4";
/** 계산은 금방 끝나지만, 의식처럼 보이도록 이 시간만큼은 영상을 보여준다. */
const MIN_RITUAL_MS = 2500;
/** 진행 바가 대략 이 시간에 63%쯤 차도록 한다. 실제 진행률이 아니라 기다림을 보여주는 장치다. */
const PROGRESS_TIME_CONSTANT_MS = 700;
const MAX_PENDING_PROGRESS = 0.95;

type Phase =
  | { kind: "working" }
  | { kind: "ready"; token: string }
  | { kind: "error"; message: string; canRetry: boolean }
  | { kind: "missing" };

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** 보관된 입력으로 무료 결과를 저장하고 토큰을 받는다. AI는 호출하지 않는다. */
async function runAnalysis(): Promise<Phase> {
  const pending = analysisInputSchema.safeParse(loadPendingAnalysis());
  if (!pending.success) return { kind: "missing" };
  try {
    const response = await fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pending.data),
    });
    const data = (await response.json().catch(() => ({}))) as { token?: string; message?: string };
    if (response.ok && data.token) {
      clearPendingAnalysis();
      trackFunnel("submit", data.token);
      trackKarrot("SubmitApplication");
      return { kind: "ready", token: data.token };
    }
    return {
      kind: "error",
      message: data.message ?? "분석을 시작하지 못했습니다.",
      canRetry: response.status === 429 || response.status >= 500,
    };
  } catch {
    return { kind: "error", message: "네트워크 연결을 확인해주세요.", canRetry: true };
  }
}

export function AnalyzingExperience() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "working" });
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedRef = useRef(false);
  const activeRef = useRef(true);
  const startTimeRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const begin = useCallback(() => {
    const startedAt = Date.now();
    startTimeRef.current = startedAt;
    setElapsedMs(0);
    setPhase({ kind: "working" });
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {
        // 자동재생이 막히면 첫 프레임이 배경처럼 남는다.
      });
    }
    void runAnalysis().then(async (next) => {
      if (!activeRef.current) return;
      if (next.kind === "ready") {
        await wait(Math.max(0, MIN_RITUAL_MS - (Date.now() - startedAt)));
        if (!activeRef.current) return;
        setPhase(next);
        return;
      }
      setPhase(next);
    });
  }, []);

  useEffect(() => {
    activeRef.current = true;
    if (!startedRef.current) {
      startedRef.current = true;
      begin();
    }
    return () => {
      activeRef.current = false;
    };
  }, [begin]);

  const working = phase.kind === "working";

  useEffect(() => {
    if (!working) return;
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startTimeRef.current), 200);
    return () => window.clearInterval(timer);
  }, [working]);

  /** 로딩이 끝나면 마지막 프레임에서 멈춘다. 반복하지 않는다. */
  useEffect(() => {
    if (working) return;
    const video = videoRef.current;
    if (!video) return;
    const freezeAtEnd = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      video.pause();
      video.currentTime = Math.max(0, video.duration - 0.05);
    };
    if (video.readyState >= 1) freezeAtEnd();
    else video.addEventListener("loadedmetadata", freezeAtEnd, { once: true });
  }, [working]);

  const progress =
    phase.kind === "ready"
      ? 1
      : Math.min(1 - Math.exp(-elapsedMs / PROGRESS_TIME_CONSTANT_MS), MAX_PENDING_PROGRESS);
  const centerCopy =
    phase.kind === "ready" ? ANALYSIS_READY_COPY : phase.kind === "missing" ? ANALYSIS_MISSING_COPY : null;

  return (
    <div className="relative flex flex-1 flex-col text-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
        <video
          ref={videoRef}
          src={LOADING_VIDEO_SRC}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover object-center [filter:contrast(0.94)_brightness(1.06)_saturate(0.9)_blur(0.55px)]"
        />
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 bg-ink"
        initial={{ opacity: 0.92 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeIn" }}
      />

      <div
        role="progressbar"
        aria-label="사주를 읽는 중"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="fixed inset-x-0 top-[env(safe-area-inset-top)] z-30 h-[5px] bg-ink/60"
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-[#7a1f6e] via-[#b0308a] to-[#e04aa6] shadow-[0_0_14px_rgb(200_50_150_/_0.9)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence>
        {working && (
          <motion.p
            key="working"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none fixed inset-x-0 top-1/2 z-20 mx-auto w-fit -translate-y-1/2 rounded-full bg-black/45 px-4 py-2 font-sans text-[13px] tracking-[-0.01em] text-paper/95 backdrop-blur-sm [text-shadow:0_1px_6px_rgb(0_0_0_/_0.55)]"
          >
            {ANALYSIS_WORKING_COPY}
          </motion.p>
        )}
        {centerCopy && (
          <motion.p
            key={phase.kind}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="pointer-events-none fixed inset-x-0 top-[46%] z-20 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-[2rem] bg-[radial-gradient(closest-side,rgb(10_6_20_/_0.6),rgb(10_6_20_/_0.3)_75%,transparent)] px-6 py-4 font-serif text-[clamp(16px,5vw,20px)] font-light whitespace-nowrap leading-relaxed [text-shadow:0_1px_4px_rgba(10,6,20,0.95),0_0_14px_rgba(10,6,20,0.8)]"
          >
            {centerCopy.found}
            <br />
            <span className="text-gold-soft">{centerCopy.tease}</span>
          </motion.p>
        )}
      </AnimatePresence>

      <div
        className={`relative z-20 flex flex-1 flex-col items-center justify-end px-4 ${
          centerCopy ? "pb-[max(12dvh,env(safe-area-inset-bottom))]" : "pb-[max(2.5rem,env(safe-area-inset-bottom))]"
        }`}
      >
        <AnimatePresence mode="wait">
          {phase.kind === "ready" && (
            <motion.div
              key="done"
              className="w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 16 }}
            >
              <MythicButtonLink onClick={() => router.replace(`/result/${phase.token}`)}>
                {ANALYSIS_READY_COPY.cta}
              </MythicButtonLink>
            </motion.div>
          )}
          {phase.kind === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex w-full max-w-xs flex-col items-center gap-6"
            >
              <p role="alert" className="font-serif text-base leading-relaxed text-paper">
                {phase.message}
              </p>
              {phase.canRetry ? (
                <Button onClick={begin}>다시 시도하기</Button>
              ) : (
                <ButtonLink href="/start">입력 다시 확인하기</ButtonLink>
              )}
            </motion.div>
          )}
          {phase.kind === "missing" && (
            <motion.div
              key="missing"
              className="w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 16 }}
            >
              <MythicButtonLink href="/start">{ANALYSIS_MISSING_COPY.cta}</MythicButtonLink>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
