"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { StickyFormCta } from "@/components/newyear/StickyFormCta";
import { getStoredAttribution } from "@/lib/client/attribution";
import { trackFunnel } from "@/lib/client/funnel";
import { clearPendingNewYear, loadPendingNewYear, savePendingNewYear } from "@/lib/client/inputStorage";
import { type FateNaviThemeId, themeOf } from "@/lib/constants/fatenaviTheme";
import { NEWYEAR_REPORT_PRICE, PRODUCT_NEWYEAR } from "@/lib/constants/newyear";
import { formatPrice } from "@/lib/constants/service";
import {
  PREMIUM_RELATIONSHIP_STATUSES,
  analysisInputSchema,
  type AnalysisInput,
  type RelationshipStatus,
} from "@/lib/validation/analysisInput";
import { sanitizeMultiLine, sanitizeSingleLine } from "@/lib/validation/sanitize";

const JOB_MAX = 40;
const CONCERN_MAX = 500;

export function NewYearConcernForm({ theme = "hanji" }: { theme?: FateNaviThemeId }) {
  const router = useRouter();
  const basePath = themeOf(theme).basePath;
  const isPremium = theme === "premium";
  const [ready, setReady] = useState(false);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | "">("");
  const [job, setJob] = useState("");
  const [concern, setConcern] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pending = analysisInputSchema.safeParse(loadPendingNewYear());
    if (!pending.success) {
      router.replace(`${basePath}/start`);
      return;
    }
    if (PREMIUM_RELATIONSHIP_STATUSES.some((item) => item.value === pending.data.relationshipStatus)) {
      setRelationshipStatus(pending.data.relationshipStatus);
    }
    if (typeof pending.data.job === "string") setJob(pending.data.job);
    if (typeof pending.data.concern === "string") setConcern(pending.data.concern);
    if (isPremium) trackFunnel("concern", null, PRODUCT_NEWYEAR);
    setReady(true);
  }, [basePath, isPremium, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const pending = analysisInputSchema.safeParse(loadPendingNewYear());
    if (!pending.success) {
      router.replace(`${basePath}/start`);
      return;
    }
    if (isPremium && !relationshipStatus) {
      setError("연애/결혼 상태를 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const next: AnalysisInput = {
      ...pending.data,
      relationshipStatus: isPremium && relationshipStatus ? relationshipStatus : pending.data.relationshipStatus,
      job: sanitizeSingleLine(job).slice(0, JOB_MAX) || null,
      concern: sanitizeMultiLine(concern).slice(0, CONCERN_MAX) || null,
    };
    savePendingNewYear(next);

    if (!isPremium) {
      router.push(`${basePath}/analyzing`);
      return;
    }

    try {
      const response = await fetch("/api/FateNavi/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...next,
          attribution: getStoredAttribution(),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { token?: string; message?: string };
      if (!response.ok || !data.token) {
        setError(data.message ?? "결제를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setSubmitting(false);
        return;
      }
      clearPendingNewYear();
      trackFunnel("submit", data.token, PRODUCT_NEWYEAR);
      router.push(`${basePath}/checkout/${data.token}`);
    } catch {
      setError("네트워크 연결을 확인해 주세요.");
      setSubmitting(false);
    }
  };

  const formId = useId();
  const ctaLabel = isPremium
    ? submitting
      ? "결제 준비 중"
      : `${formatPrice(NEWYEAR_REPORT_PRICE)} 결제하기`
    : submitting
      ? "사주 풀이 중"
      : "다음 단계로";

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
        {isPremium ? (
          <section className="flex flex-col gap-2.5">
            <p className="ny-form-label">연애/결혼</p>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label="연애/결혼">
              {PREMIUM_RELATIONSHIP_STATUSES.map((option) => {
                const selected = relationshipStatus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setRelationshipStatus(option.value);
                      setError(null);
                    }}
                    className={`ny-choice ny-choice-sm${selected ? " is-on" : ""}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

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
            placeholder={
              "예: 평생 돈 얼마나 모을 수 있을지, 어떤 직무가 잘 맞는지, 이직하는 게 좋을지 등등"
            }
            value={concern}
            onChange={(event) => setConcern(event.target.value)}
            className="ny-field ny-textarea"
          />
          <p className="ny-form-hint">
            적어두면 풀이 정확도가 더 올라가요. 작성한 내용은 비공개로, 풀이에만 사용돼요.
          </p>
        </section>
        {error ? <p className="ny-form-error">{error}</p> : null}
      </form>
      <StickyFormCta>
        <button type="submit" form={formId} className="ny-btn" disabled={submitting}>
          {ctaLabel}
        </button>
      </StickyFormCta>
    </>
  );
}
