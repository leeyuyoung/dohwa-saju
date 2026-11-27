"use client";

import { useState } from "react";
import {
  EMPTY_FORM_VALUES,
  NAME_MAX_LENGTH,
  validateStep,
  type AnalysisFormValues,
  type FieldErrors,
} from "@/lib/validation/analysisInput";

const PARTNER_CONCERN_MAX = 80;

export type DuoCompanionPayload = {
  name: string;
  gender: "male" | "female";
  calendarType: "solar" | "lunar";
  isLeapMonth: boolean;
  year: number;
  month: number;
  day: number;
  hour: number | null;
  minute: number | null;
  birthTimeUnknown: boolean;
  /** 선택. 상대가 궁금한 점. */
  concern: string | null;
};

const PLAIN_ERRORS: Record<string, string> = {
  "이름 정도는 알려주거라.": "이름을 입력해 주세요.",
  "태어난 해와 달, 날을 모두 적거라.": "생년월일을 모두 입력해 주세요.",
  "제대로 된 날을 적거라.": "올바른 날짜를 입력해 주세요.",
  "그런 날은 없다. 날 속일 생각은 마라.": "없는 날짜입니다. 다시 입력해 주세요.",
  "아직 오지도 않은 날에 태어났다고?": "아직 오지 않은 날짜입니다.",
  "윤달은 음력에서만 고를 수 있다.": "윤달은 음력에서만 선택할 수 있습니다.",
  "태어난 시각을 적거나 ‘모름’을 누르거라.": "태어난 시간을 입력하거나 시간 모름을 선택해 주세요.",
};

function plainErrors(errors: FieldErrors): FieldErrors {
  const next: FieldErrors = {};
  for (const [key, message] of Object.entries(errors)) {
    if (!message) continue;
    next[key] = PLAIN_ERRORS[message] ?? message.replace(/자 이내로 줄이거라\.$/, "자 이내로 입력해 주세요.");
  }
  return next;
}

function formatBirthDisplay(digits: string) {
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  if (digits.length <= 4) return y;
  if (digits.length <= 6) return `${y}.${m}`;
  return `${y}.${m}.${d}`;
}

function RadioMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
        checked ? "border-[#1c1c1c] bg-[#1c1c1c]" : "border-[rgb(28_28_28/0.35)] bg-transparent"
      }`}
    >
      {checked ? (
        <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#f5f3ee]" fill="none">
          <path d="m5 12 5 5 9-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

export function useDuoCompanion() {
  const [values, setValues] = useState<AnalysisFormValues>(EMPTY_FORM_VALUES);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [digits, setDigits] = useState("");
  const [concern, setConcern] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const update = (patch: Partial<AnalysisFormValues>) => setValues((previous) => ({ ...previous, ...patch }));

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

  const baseErrors: FieldErrors = showErrors
    ? plainErrors({ ...validateStep(0, values), ...validateStep(1, values), ...validateStep(2, values) })
    : {};
  const errors: FieldErrors = {
    ...baseErrors,
    ...(showErrors && !gender ? { gender: "성별을 선택해 주세요." } : {}),
  };

  const validate = (): string | null => {
    const invalid =
      !gender || [0, 1, 2].some((index) => Object.keys(validateStep(index, values)).length > 0);
    if (invalid) {
      setShowErrors(true);
      return "함께 볼 사람 정보를 확인해 주세요.";
    }
    return null;
  };

  const payload = (): DuoCompanionPayload | null => {
    if (!gender || digits.length !== 8) return null;
    const timeKnown = !values.birthTimeUnknown;
    const concernText = concern.trim().slice(0, PARTNER_CONCERN_MAX);
    return {
      name: values.name.trim(),
      gender,
      calendarType: values.calendarType,
      isLeapMonth: values.calendarType === "lunar" && values.isLeapMonth,
      year: Number(values.birthYear),
      month: Number(values.birthMonth),
      day: Number(values.birthDay),
      hour: timeKnown ? Number(values.birthHour) : null,
      minute: timeKnown ? Number(values.birthMinute) : null,
      birthTimeUnknown: values.birthTimeUnknown,
      concern: concernText || null,
    };
  };

  const fields = (
    <DuoCompanionFieldsView
      values={values}
      gender={gender}
      digits={digits}
      concern={concern}
      errors={errors}
      update={update}
      setGender={setGender}
      setConcern={setConcern}
      changeDigits={changeDigits}
      onlyDigits={onlyDigits}
    />
  );

  return { fields, validate, payload };
}

function DuoCompanionFieldsView({
  values,
  gender,
  digits,
  concern,
  errors,
  update,
  setGender,
  setConcern,
  changeDigits,
  onlyDigits,
}: {
  values: AnalysisFormValues;
  gender: "male" | "female" | "";
  digits: string;
  concern: string;
  errors: FieldErrors;
  update: (patch: Partial<AnalysisFormValues>) => void;
  setGender: (value: "male" | "female") => void;
  setConcern: (value: string) => void;
  changeDigits: (raw: string) => void;
  onlyDigits: (value: string) => string;
}) {
  const unknown = values.birthTimeUnknown;

  return (
    <div className="ny-duo-companion flex flex-col gap-4">
      <div>
        <p className="ny-form-label">함께 볼 사람</p>
        <p className="ny-form-hint mt-1">2인 리포트에 넣을 상대의 사주 정보예요.</p>
      </div>

      <section className="flex flex-col gap-1.5">
        <p className="ny-form-label">이름</p>
        <input
          type="text"
          autoComplete="off"
          maxLength={NAME_MAX_LENGTH}
          placeholder="성함을 입력해주세요"
          value={values.name}
          onChange={(event) => update({ name: event.target.value })}
          className="ny-field"
        />
        {errors.name ? <p className="ny-form-error">{errors.name}</p> : null}
      </section>

      <section className="flex flex-col gap-1.5">
        <p className="ny-form-label">성별</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "male" as const, label: "남성" },
              { value: "female" as const, label: "여성" },
            ]
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

      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <p className="ny-form-label">생일</p>
          <div role="radiogroup" aria-label="달력 유형" className="flex items-center gap-3">
            {(
              [
                { value: "solar" as const, label: "양력" },
                { value: "lunar" as const, label: "음력" },
              ]
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
                      isLeapMonth: option.value === "lunar" ? values.isLeapMonth : false,
                    })
                  }
                  className="flex items-center gap-1.5 text-[12px] text-[rgb(28_28_28/0.8)]"
                >
                  <RadioMark checked={selected} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <input
          type="text"
          inputMode="numeric"
          placeholder="1990.01.01"
          value={formatBirthDisplay(digits)}
          onChange={(event) => changeDigits(event.target.value)}
          className="ny-field"
        />
        {values.calendarType === "lunar" ? (
          <button
            type="button"
            aria-pressed={values.isLeapMonth}
            onClick={() => update({ isLeapMonth: !values.isLeapMonth })}
            className="flex items-center gap-1.5 self-start text-[12px] text-[rgb(28_28_28/0.8)]"
          >
            <RadioMark checked={values.isLeapMonth} />
            윤달
          </button>
        ) : null}
        {errors.birthDate || errors.isLeapMonth ? (
          <p className="ny-form-error">{errors.birthDate ?? errors.isLeapMonth}</p>
        ) : null}
      </section>

      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <p className="ny-form-label">태어난 시간</p>
          <button
            type="button"
            aria-pressed={unknown}
            onClick={() => update({ birthTimeUnknown: !unknown })}
            className="flex items-center gap-1.5 text-[12px] text-[rgb(28_28_28/0.8)]"
          >
            <RadioMark checked={unknown} />
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

      <section className="flex flex-col gap-1.5">
        <p className="ny-form-label">상대가 궁금한 점 (선택)</p>
        <input
          type="text"
          autoComplete="off"
          maxLength={PARTNER_CONCERN_MAX}
          placeholder="이직 시기 등"
          value={concern}
          onChange={(event) => setConcern(event.target.value)}
          className="ny-field"
        />
      </section>
    </div>
  );
}
