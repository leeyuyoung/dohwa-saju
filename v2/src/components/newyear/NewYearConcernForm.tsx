"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { StickyFormCta } from "@/components/newyear/StickyFormCta";
import { loadPendingNewYear, savePendingNewYear } from "@/lib/client/inputStorage";
import { type FateNaviThemeId, themeOf } from "@/lib/constants/fatenaviTheme";
import { analysisInputSchema, type AnalysisInput } from "@/lib/validation/analysisInput";
import { sanitizeMultiLine, sanitizeSingleLine } from "@/lib/validation/sanitize";

const JOB_MAX = 40;
const CONCERN_MAX = 500;

export function NewYearConcernForm({ theme = "hanji" }: { theme?: FateNaviThemeId }) {
  const router = useRouter();
  const basePath = themeOf(theme).basePath;
  const [ready, setReady] = useState(false);
  const [job, setJob] = useState("");
  const [concern, setConcern] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const pending = analysisInputSchema.safeParse(loadPendingNewYear());
    if (!pending.success) {
      router.replace(`${basePath}/start`);
      return;
    }
    if (typeof pending.data.job === "string") setJob(pending.data.job);
    if (typeof pending.data.concern === "string") setConcern(pending.data.concern);
    setReady(true);
  }, [basePath, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const pending = analysisInputSchema.safeParse(loadPendingNewYear());
    if (!pending.success) {
      router.replace(`${basePath}/start`);
      return;
    }
    setSubmitting(true);
    const next: AnalysisInput = {
      ...pending.data,
      job: sanitizeSingleLine(job).slice(0, JOB_MAX) || null,
      concern: sanitizeMultiLine(concern).slice(0, CONCERN_MAX) || null,
    };
    savePendingNewYear(next);
    router.push(`${basePath}/analyzing`);
  };

  const formId = useId();

  if (!ready) {
    return <div className="ny-form min-h-[40vh]" aria-hidden />;
  }

  return (
    <>
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit}
      className="ny-form ny-form-bottom flex flex-col gap-7"
    >
      <section className="flex flex-col gap-2.5">
        <p className="ny-form-label">직업/직무</p>
        <input
          id="ny-job"
          type="text"
          autoComplete="off"
          maxLength={JOB_MAX}
          placeholder="직업 및 분야를 입력해주세요."
          value={job}
          onChange={(event) => setJob(event.target.value)}
          className="ny-field"
        />
      </section>

      <section className="flex flex-col gap-2.5">
        <p className="ny-form-label">심화 고민 및 질문</p>
        <textarea
          id="ny-concern"
          rows={6}
          maxLength={CONCERN_MAX}
          placeholder={"적어두면 풀이 정확도가 더 올라가요.\n작성한 내용은 비공개로, 풀이에만 사용돼요."}
          value={concern}
          onChange={(event) => setConcern(event.target.value)}
          className="ny-field ny-textarea"
        />
      </section>

    </form>
    <StickyFormCta>
      <button type="submit" form={formId} className="ny-btn" disabled={submitting}>
        {submitting ? "사주 풀이 중" : "다음 단계로"}
      </button>
    </StickyFormCta>
    </>
  );
}
