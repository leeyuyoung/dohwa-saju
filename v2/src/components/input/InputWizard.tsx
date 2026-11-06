"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { PortraitVideo } from "@/components/ui/PortraitVideo";
import { trackFunnel } from "@/lib/client/funnel";
import { clearDraft, loadDraft, saveDraft, savePendingAnalysis } from "@/lib/client/inputStorage";
import type { FunnelStep } from "@/lib/funnelSteps";
import { INPUT_STEPS, SERVICE } from "@/lib/constants/service";
import {
  toAnalysisInput,
  validateStep,
  type AnalysisFormValues,
  type FieldErrors,
} from "@/lib/validation/analysisInput";
import { BirthDateStep } from "./steps/BirthDateStep";
import { BirthTimeStep } from "./steps/BirthTimeStep";
import { LoveStep } from "./steps/LoveStep";
import { NameStep } from "./steps/NameStep";
import type { StepProps } from "./steps/types";

const STEP_FUNNEL: FunnelStep[] = ["birth_date", "birth_time", "name", "relationship"];
const INPUT_VIDEO_SRC = "/videos/input/background-v2.mp4";

const STEP_COMPONENTS: ReadonlyArray<(props: StepProps) => ReactNode> = [
  BirthDateStep,
  BirthTimeStep,
  NameStep,
  LoveStep,
];

const EASE = [0.22, 0.61, 0.36, 1] as const;
/** 이보다 긴 질문은 좁은 폰에서도 한 줄에 들도록 글자 크기를 화면 폭에 맞춰 줄인다. 나눗수 14.4는 가장 긴 질문의 폭(em)이다. */
const LONG_QUESTION_CHARS = 18;

export default function InputWizard() {
  const router = useRouter();
  const [initialDraft] = useState(loadDraft);
  const [values, setValues] = useState<AnalysisFormValues>(initialDraft.values);
  const [stepIndex, setStepIndex] = useState(initialDraft.stepIndex);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const step = INPUT_STEPS[stepIndex];
  const StepComponent = STEP_COMPONENTS[stepIndex];
  const isLastStep = stepIndex === INPUT_STEPS.length - 1;
  const errors: FieldErrors = showErrors ? validateStep(stepIndex, values) : {};

  useEffect(() => {
    if (!submitting) saveDraft({ values, stepIndex });
  }, [values, stepIndex, submitting]);

  useEffect(() => {
    trackFunnel("start");
  }, []);

  useEffect(() => {
    const step = STEP_FUNNEL[stepIndex];
    if (step) trackFunnel(step);
  }, [stepIndex]);

  /** 질문을 넘길 때마다 같은 영상을 처음부터 다시 재생한다. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {
      // 자동재생이 막히면 첫 프레임이 배경처럼 남는다.
    });
  }, [stepIndex]);

  const update = (patch: Partial<AnalysisFormValues>) => setValues((previous) => ({ ...previous, ...patch }));

  const moveTo = (nextIndex: number) => {
    setShowErrors(false);
    setStepIndex(nextIndex);
  };

  const revealFirstError = () => {
    window.requestAnimationFrame(() => {
      const target = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]');
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (Object.keys(validateStep(stepIndex, values)).length > 0) {
      setShowErrors(true);
      revealFirstError();
      return;
    }

    if (!isLastStep) {
      moveTo(stepIndex + 1);
      return;
    }

    const result = toAnalysisInput(values);
    if (!result.ok) {
      moveTo(result.stepIndex);
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    savePendingAnalysis(result.input);
    clearDraft();
    router.push("/analyzing");
  };

  const goBack = () => {
    if (stepIndex === 0) router.push("/");
    else moveTo(stepIndex - 1);
  };

  return (
    <div className="relative isolate flex min-h-dvh w-full flex-col">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
        <PortraitVideo
          src={INPUT_VIDEO_SRC}
          videoRef={videoRef}
          loop
          filterClassName="[filter:contrast(0.98)_brightness(1.04)_saturate(0.94)_blur(0.4px)]"
        />
      </div>

      <div className="relative z-10 bg-gradient-to-b from-ink/45 via-ink/20 to-transparent backdrop-blur-md">
        <header className="grid grid-cols-[3rem_1fr_3rem] items-center px-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={goBack}
            aria-label={stepIndex === 0 ? "처음으로" : "이전 질문"}
            className="flex h-12 w-12 items-center justify-center text-paper transition-colors hover:text-paper"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none">
              <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-center font-serif text-[15px] tracking-[0.2em] text-paper [text-shadow:0_1px_8px_rgb(0_0_0_/_0.55)]">
            {SERVICE.name}
          </p>
          <span />
        </header>
        <div className="mx-5 mt-1 mb-2 h-0.5 overflow-hidden rounded-full bg-white/15" aria-hidden>
          <div
            className="h-full rounded-full bg-cinnabar/80 transition-[width] duration-700"
            style={{ width: `${((stepIndex + 1) / INPUT_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        className="relative z-10 mt-auto w-full bg-gradient-to-t from-ink/70 via-ink/45 to-transparent px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-16"
      >
        <div className="mx-auto w-full max-w-md">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={stepIndex}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex flex-col gap-6"
            >
              <header>
                <h1
                  className={`font-eerie whitespace-nowrap leading-snug tracking-[0.02em] text-paper [text-shadow:0_0_24px_rgb(232_137_155/0.35)] ${
                    step.question.length > LONG_QUESTION_CHARS
                      ? "text-[min(clamp(1.5rem,6.6vw,1.9rem),calc((min(100vw,31rem)-3rem)/14.4))]"
                      : "text-[clamp(1.5rem,6.6vw,1.9rem)]"
                  }`}
                >
                  {step.question}
                </h1>
              </header>
              <StepComponent values={values} errors={errors} update={update} />
            </motion.section>
          </AnimatePresence>

          <Button type="submit" variant="light" disabled={submitting} className="mt-7">
            {isLastStep ? (submitting ? "선녀가 다가오는 중…" : "도화선녀에게 맡기기") : "다음으로"}
          </Button>
        </div>
      </form>
    </div>
  );
}
