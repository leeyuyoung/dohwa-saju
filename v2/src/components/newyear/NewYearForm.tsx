"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { StickyFormCta } from "@/components/newyear/StickyFormCta";
import { trackFunnel } from "@/lib/client/funnel";
import { savePendingNewYear } from "@/lib/client/inputStorage";
import { type FateNaviThemeId, themeOf } from "@/lib/constants/fatenaviTheme";
import { PRODUCT_NEWYEAR } from "@/lib/constants/newyear";
import {
  EMPTY_FORM_VALUES,
  NAME_MAX_LENGTH,
  toAnalysisInput,
  validateStep,
  type AnalysisFormValues,
  type FieldErrors,
} from "@/lib/validation/analysisInput";

type Gender = "female" | "male";

const PLAIN_ERRORS: Record<string, string> = {
  "이름 정도는 알려주거라.": "이름을 입력해 주세요.",
  "태어난 해와 달, 날을 모두 적거라.": "생년월일을 모두 입력해 주세요.",
  "제대로 된 날을 적거라.": "올바른 날짜를 입력해 주세요.",
  "그런 날은 없다. 날 속일 생각은 마라.": "없는 날짜입니다. 다시 입력해 주세요.",
  "아직 오지도 않은 날에 태어났다고?": "아직 오지 않은 날짜입니다.",
  "윤달은 음력에서만 고를 수 있다.": "윤달은 음력에서만 선택할 수 있습니다.",
  "태어난 시각을 적거나 ‘모름’을 누르거라.": "태어난 시간을 입력하거나 시간 모름을 선택해 주세요.",
  "다시 한번 확인해 보거라.": "입력 내용을 다시 확인해 주세요.",
};

function plainErrors(errors: FieldErrors): FieldErrors {
  const next: FieldErrors = {};
  for (const [key, message] of Object.entries(errors)) {
    if (!message) continue;
    next[key] = PLAIN_ERRORS[message] ?? message.replace(/자 이내로 줄이거라\.$/, "자 이내로 입력해 주세요.");
  }
  return next;
}

/** 1990.01.01 형식 (스크린샷과 동일) */
function formatBirthDisplay(digits: string) {
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  if (digits.length <= 4) return y;
  if (digits.length <= 6) return `${y}.${m}`;
  return `${y}.${m}.${d}`;
}

function RadioMark({ checked, light }: { checked: boolean; light?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
        light
          ? checked
            ? "border-[#2a2118] bg-[#2a2118]"
            : "border-[rgb(42_33_24/0.35)] bg-transparent"
          : checked
            ? "border-white bg-white"
            : "border-white/35 bg-transparent"
      }`}
    >
      {checked ? (
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 ${light ? "text-[#fff8f0]" : "text-black"}`}
          fill="none"
        >
          <path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

export function NewYearForm({ theme = "hanji" }: { theme?: FateNaviThemeId }) {
  const router = useRouter();
  const basePath = themeOf(theme).basePath;
  const trackPremiumFunnel = theme === "premium";
  /** sheep/premium만 크림 배경. hanji(FateNavi3) 폼은 어두운 바탕이라 밝은 글자. */
  const isLight = theme === "sheep" || theme === "premium";
  const muteClass = isLight ? "text-[rgb(42_33_24/0.8)]" : theme === "hanji" ? "text-[#f6ecd8]" : "text-white";
  const softClass = isLight
    ? "text-[rgb(42_33_24/0.8)]"
    : theme === "hanji"
      ? "text-[rgb(246_236_216/0.85)]"
      : "text-white/80";
  const [values, setValues] = useState<AnalysisFormValues>(EMPTY_FORM_VALUES);
  const [gender, setGender] = useState<Gender | "">("");
  const [digits, setDigits] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (trackPremiumFunnel) trackFunnel("start", null, PRODUCT_NEWYEAR);
  }, [trackPremiumFunnel]);

  const update = (patch: Partial<AnalysisFormValues>) => setValues((previous) => ({ ...previous, ...patch }));
  const baseErrors: FieldErrors = showErrors
    ? plainErrors({ ...validateStep(0, values), ...validateStep(1, values), ...validateStep(2, values) })
    : {};
  const errors: FieldErrors = {
    ...baseErrors,
    ...(showErrors && !gender ? { gender: "성별을 선택해 주세요." } : {}),
  };

  const changeDigits = (raw: string) => {
    const next = raw.replace(/\D/g, "").slice(0, 8);
    setDigits(next);
    if (next.length === 8) {
      update({
        birthYear: next.slice(0, 4),
        birthMonth: String(Number(next.slice(4, 6))),
        birthDay: String(Number(next.slice(6, 8))),
      });
    } else {
      update({ birthYear: "", birthMonth: "", birthDay: "" });
    }
  };

  const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 2);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const invalid =
      !gender || [0, 1, 2].some((index) => Object.keys(validateStep(index, values)).length > 0);
    if (invalid) {
      setShowErrors(true);
      return;
    }
    const result = toAnalysisInput(values);
    if (!result.ok) {
      setShowErrors(true);
      return;
    }
    setSubmitting(true);
    savePendingNewYear({ ...result.input, gender });
    router.push(`${basePath}/concern`);
  };

  const unknown = values.birthTimeUnknown;
  const formId = useId();

  return (
    <>
    <form
      id={formId}
      noValidate
      onSubmit={handleSubmit}
      className="ny-form ny-form-bottom flex flex-col gap-7"
    >
      <section className="flex flex-col gap-2.5">
        <p className="ny-form-label">이름</p>
        <input
          id="ny-name"
          type="text"
          autoComplete="off"
          maxLength={NAME_MAX_LENGTH}
          placeholder="성함을 입력해주세요"
          value={values.name}
          onChange={(event) => update({ name: event.target.value })}
          aria-invalid={!!errors.name}
          className="ny-field"
        />
        {errors.name ? <p className="ny-form-error">{errors.name}</p> : null}
      </section>

      <section className="flex flex-col gap-2.5">
        <p className="ny-form-label">성별</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "male", label: "남성" },
              { value: "female", label: "여성" },
            ] as const
          ).map((option) => {
            const selected = gender === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setGender(option.value)}
                className={`ny-choice${selected ? " is-on" : ""}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {errors.gender ? <p className="ny-form-error">{errors.gender}</p> : null}
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="ny-form-label">생일</p>
          <div role="radiogroup" aria-label="달력 유형" className="flex items-center gap-3">
            {(
              [
                { value: "solar", label: "양력" },
                { value: "lunar", label: "음력" },
              ] as const
            ).map((option) => {
              const selected = values.calendarType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() =>
                    update({
                      calendarType: option.value,
                      ...(option.value === "solar" ? { isLeapMonth: false } : {}),
                    })
                  }
                  className={`flex items-center gap-1.5 text-[13px] ${muteClass}`}
                >
                  <RadioMark checked={selected} light={isLight} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <input
          id="ny-birth-date"
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          placeholder="1990.01.01"
          value={formatBirthDisplay(digits)}
          onChange={(event) => changeDigits(event.target.value)}
          aria-invalid={!!errors.birthDate}
          className="ny-field"
        />
        {values.calendarType === "lunar" ? (
          <button
            type="button"
            aria-pressed={values.isLeapMonth}
            onClick={() => update({ isLeapMonth: !values.isLeapMonth })}
            className={`flex items-center gap-2 self-start text-[13px] ${softClass}`}
          >
            <RadioMark checked={values.isLeapMonth} light={isLight} />
            윤달이에요
          </button>
        ) : null}
        {errors.birthDate || errors.isLeapMonth ? (
          <p className="ny-form-error">{errors.birthDate ?? errors.isLeapMonth}</p>
        ) : null}
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="ny-form-label">태어난 시간</p>
          <button
            type="button"
            aria-pressed={unknown}
            onClick={() => update({ birthTimeUnknown: !unknown })}
            className={`flex items-center gap-1.5 text-[13px] ${muteClass}`}
          >
            <RadioMark checked={unknown} light={isLight} />
            시간모름
          </button>
        </div>
        {unknown ? (
          <div className="ny-field is-disabled" aria-disabled>
            시간 모름
          </div>
        ) : (
          <div className="ny-field ny-time">
            <input
              id="ny-birth-hour"
              type="text"
              inputMode="numeric"
              aria-label="태어난 시 (0~23)"
              placeholder="13"
              value={values.birthHour}
              onChange={(event) => update({ birthHour: onlyDigits(event.target.value) })}
              className="ny-time-part"
            />
            <span aria-hidden>:</span>
            <input
              id="ny-birth-minute"
              type="text"
              inputMode="numeric"
              aria-label="태어난 분 (0~59)"
              placeholder="30"
              value={values.birthMinute}
              onChange={(event) => update({ birthMinute: onlyDigits(event.target.value) })}
              className="ny-time-part"
            />
          </div>
        )}
        {errors.birthTime ? <p className="ny-form-error">{errors.birthTime}</p> : null}
      </section>

    </form>
    <StickyFormCta>
      <button type="submit" form={formId} className="ny-btn" disabled={submitting}>
        {submitting ? "사주 입력 중" : "다음 단계로"}
      </button>
    </StickyFormCta>
    </>
  );
}
