import "server-only";

/** 스키마 필드명이 문단으로 그대로 새는 경우. */
const SCHEMA_KEY_ONLY = /^(closingLine|headline|intro|conclusion|paragraphs|sections|keywords|name)$/i;

/** 프롬프트 태그·영문 키가 본문에 새면 사용자에게 보이지 않게 고친다. */
export function scrubReportLeakage(value: string): string {
  const trimmed = value.trim();
  if (SCHEMA_KEY_ONLY.test(trimmed)) return "";
  return trimmed
    .replace(/<\/?meetingWindow>/gi, "")
    .replace(/\bmeetingWindow\b/gi, "만남이 열리기 쉬운 시기")
    .replace(/\bclosingLine\b/gi, "")
    .replace(/\bPART\s*([1-5])\b/gi, "파트 $1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function scrubDeep<T>(value: T): T {
  if (typeof value === "string") return scrubReportLeakage(value) as T;
  if (Array.isArray(value)) {
    return value
      .map((item) => scrubDeep(item))
      .filter((item) => !(typeof item === "string" && item.length === 0)) as T;
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) next[key] = scrubDeep(child);
    return next as T;
  }
  return value;
}
