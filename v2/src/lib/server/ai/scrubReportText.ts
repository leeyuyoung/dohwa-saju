import "server-only";

/** 프롬프트 태그·영문 키가 본문에 새면 사용자에게 보이지 않게 고친다. */
export function scrubReportLeakage(value: string): string {
  return value
    .replace(/<\/?meetingWindow>/gi, "")
    .replace(/\bmeetingWindow\b/gi, "만남이 열리기 쉬운 시기")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function scrubDeep<T>(value: T): T {
  if (typeof value === "string") return scrubReportLeakage(value) as T;
  if (Array.isArray(value)) return value.map((item) => scrubDeep(item)) as T;
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) next[key] = scrubDeep(child);
    return next as T;
  }
  return value;
}
