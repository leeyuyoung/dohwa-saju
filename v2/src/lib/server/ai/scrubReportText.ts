import "server-only";

/** 스키마 필드명이 문단으로 그대로 새는 경우. */
const SCHEMA_KEY_ONLY = /^(closingLine|headline|intro|conclusion|paragraphs|sections|keywords|name)$/i;

/** 문장 끝·따옴표 앞에서만 바꿔, 단어 중간은 건드리지 않는다. */
const END = "(?=[.!?…~\\s」』\"'”’]|$)";

/** 존댓말·해설형 종결을 반말 구어체로 되돌린다. 애매한 활용은 건드리지 않는다. */
function scrubSpeechTone(value: string): string {
  return value
    .replace(new RegExp(`입니다${END}`, "g"), "이야")
    .replace(new RegExp(`합니다${END}`, "g"), "해")
    .replace(new RegExp(`됩니다${END}`, "g"), "돼")
    .replace(new RegExp(`있습니다${END}`, "g"), "있어")
    .replace(new RegExp(`없습니다${END}`, "g"), "없어")
    .replace(new RegExp(`많습니다${END}`, "g"), "많아")
    .replace(new RegExp(`좋습니다${END}`, "g"), "좋아")
    .replace(new RegExp(`같습니다${END}`, "g"), "같아")
    .replace(new RegExp(`아닙니다${END}`, "g"), "아니야")
    .replace(new RegExp(`아니다${END}`, "g"), "아니야")
    .replace(new RegExp(`이다${END}`, "g"), "이야")
    .replace(new RegExp(`있다${END}`, "g"), "있어")
    .replace(new RegExp(`없다${END}`, "g"), "없어")
    .replace(/당신은/g, "넌")
    .replace(/당신이/g, "네가")
    .replace(/당신의/g, "네")
    /** 모델이 '너는'을 '네는'으로 쓰는 오타 */
    .replace(/네는/g, "너는");
}

/** JSON 구조 조각만으로 이뤄진 문단(예: ]}], ). */
const JSON_DEBRIS_ONLY = /^[\s\[\]{},:"'\\]+$/;

/** 프롬프트 태그·영문 키가 본문에 새면 사용자에게 보이지 않게 고친다. */
export function scrubReportLeakage(value: string): string {
  const trimmed = value.trim();
  if (SCHEMA_KEY_ONLY.test(trimmed)) return "";
  if (JSON_DEBRIS_ONLY.test(trimmed)) return "";
  return scrubSpeechTone(
    trimmed
      .replace(/<\/?meetingWindow>/gi, "")
      .replace(/\bmeetingWindow\b/gi, "만남이 열리기 쉬운 시기")
      .replace(/\bclosingLine\b/gi, "")
      .replace(/\bPART\s*([1-5])\b/gi, "파트 $1")
      /** 문단 끝에 붙는 JSON 꼬리 */
      .replace(/\s*"?\s*\]\s*\}\s*\]\s*,?\s*$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  );
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
