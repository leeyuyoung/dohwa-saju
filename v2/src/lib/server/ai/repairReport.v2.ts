import { REPORT_PARTS_V2 } from "@/lib/constants/reportChapters.v2";
import {
  KEYWORD_COUNT_V2,
  PARAGRAPH_COUNT_V2,
  aiReportSchemaV2Strict,
  type AiReportV2Strict,
} from "./reportSchema.v2";

const part1SectionCount = REPORT_PARTS_V2.find((part) => part.part === 1)!.sections.length;
const part2SectionCount = REPORT_PARTS_V2.find((part) => part.part === 2)!.sections.length;
const part4SectionCount = REPORT_PARTS_V2.find((part) => part.part === 4)!.sections.length;
const part5SectionCount = REPORT_PARTS_V2.find((part) => part.part === 5)!.sections.length;

type LooseSection = { paragraphs: string[] };
type LoosePart = {
  headline?: string;
  sections?: LooseSection[];
  closingLine?: string;
};
type LooseKeyword = { name?: string; paragraphs?: string[] };

function asNonEmptyString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) out.push(trimmed);
    return out;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    out.push(String(value));
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>)) collectStrings(child, out);
  }
  return out;
}

/** 긴 문단을 문장 경계 근처에서 둘로 나눈다. 의미를 새로 쓰지 않는다. */
function splitParagraph(text: string): [string, string] | null {
  const trimmed = text.trim();
  if (trimmed.length < 40) return null;

  const boundaries: number[] = [];
  for (let i = 0; i < trimmed.length - 1; i++) {
    const ch = trimmed[i];
    if (ch === "." || ch === "!" || ch === "?" || ch === "…" || ch === "~" || ch === "。" || ch === "！") {
      boundaries.push(i + 1);
    } else if (ch === "다" || ch === "요" || ch === "네" || ch === "어" || ch === "지") {
      const next = trimmed[i + 1];
      if (next === "." || next === "!" || next === "?" || next === " " || next === "\n") {
        boundaries.push(i + (next === " " || next === "\n" ? 1 : 2));
      }
    }
  }

  if (boundaries.length === 0) {
    const mid = Math.floor(trimmed.length / 2);
    const space = trimmed.indexOf(" ", mid);
    if (space <= mid || space >= trimmed.length - 8) return null;
    const left = trimmed.slice(0, space).trim();
    const right = trimmed.slice(space).trim();
    if (left.length < 12 || right.length < 12) return null;
    return [left, right];
  }

  const mid = trimmed.length / 2;
  let best = boundaries[0];
  let bestDist = Math.abs(best - mid);
  for (const at of boundaries) {
    const dist = Math.abs(at - mid);
    if (dist < bestDist) {
      best = at;
      bestDist = dist;
    }
  }
  const left = trimmed.slice(0, best).trim();
  const right = trimmed.slice(best).trim();
  if (left.length < 12 || right.length < 12) return null;
  return [left, right];
}

/**
 * 같은 블록 안 기존 문단만으로 min~max를 맞춘다.
 * 새 문장을 만들지 못하면 null → 재시도에 맡긴다.
 */
function ensureParagraphCount(paragraphs: string[]): string[] | null {
  let next = paragraphs.map((p) => p.trim()).filter((p) => p.length > 0);
  if (next.length === 0) return null;

  while (next.length > PARAGRAPH_COUNT_V2.max) {
    const last = next.pop()!;
    next[next.length - 1] = `${next[next.length - 1]} ${last}`.trim();
  }

  let guard = 0;
  while (next.length < PARAGRAPH_COUNT_V2.min && guard < 8) {
    guard += 1;
    const longestIdx = next.reduce((best, p, i) => (p.length > next[best].length ? i : best), 0);
    const split = splitParagraph(next[longestIdx]);
    if (split) {
      next.splice(longestIdx, 1, split[0], split[1]);
      continue;
    }
    // 분할 불가면 같은 블록의 유효 문단을 복제해 구조만 맞춘다.
    next.push(next[next.length - 1]);
  }

  if (next.length < PARAGRAPH_COUNT_V2.min || next.length > PARAGRAPH_COUNT_V2.max) return null;
  if (next.some((p) => !p.trim())) return null;
  return next;
}

function repairParagraphList(raw: unknown): string[] | null {
  const cleaned: string[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const text = asNonEmptyString(item);
      if (text) cleaned.push(text);
    }
  } else {
    const text = asNonEmptyString(raw);
    if (text) cleaned.push(text);
  }
  return ensureParagraphCount(cleaned);
}

function repairSection(raw: unknown): LooseSection | null {
  if (!raw || typeof raw !== "object") return null;
  const paragraphs = repairParagraphList((raw as { paragraphs?: unknown }).paragraphs);
  if (!paragraphs) return null;
  return { paragraphs };
}

function repairSections(raw: unknown, expected: number): LooseSection[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length !== expected) return null;
  const sections: LooseSection[] = [];
  for (const item of raw) {
    const section = repairSection(item);
    if (!section) return null;
    sections.push(section);
  }
  return sections;
}

function lastSentence(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/(?<=[.!?…~]|다\.|요\.|네\.)\s+/);
  const last = (parts[parts.length - 1] ?? trimmed).trim();
  if (!last) return null;
  return last.length > 120 ? last.slice(0, 120).trim() : last;
}

function deriveClosingLine(sections: LooseSection[]): string | null {
  for (let i = sections.length - 1; i >= 0; i--) {
    const paras = sections[i]?.paragraphs ?? [];
    for (let j = paras.length - 1; j >= 0; j--) {
      const sentence = lastSentence(paras[j]);
      if (sentence) return sentence;
    }
  }
  return null;
}

function repairPart(raw: unknown, sectionCount: number, closing: "required" | "optional"): LoosePart | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const headline = asNonEmptyString(obj.headline);
  if (!headline) return null;
  const sections = repairSections(obj.sections, sectionCount);
  if (!sections) return null;

  const closingLine = asNonEmptyString(obj.closingLine) ?? (closing === "required" ? deriveClosingLine(sections) : null);
  if (closing === "required" && !closingLine) return null;

  const next: LoosePart = { headline, sections };
  if (closingLine) next.closingLine = closingLine;
  return next;
}

function repairSaekgi(raw: unknown): { paragraphs: string[] } | null {
  if (!raw || typeof raw !== "object") return null;
  const paragraphs = repairParagraphList((raw as { paragraphs?: unknown }).paragraphs);
  if (!paragraphs) return null;
  return { paragraphs };
}

function repairPart3(raw: unknown): {
  headline: string;
  keywords: { name: string; paragraphs: string[] }[];
  closingLine: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const headline = asNonEmptyString(obj.headline);
  if (!headline) return null;
  if (!Array.isArray(obj.keywords) || obj.keywords.length !== KEYWORD_COUNT_V2.min) return null;

  const keywords: { name: string; paragraphs: string[] }[] = [];
  for (const item of obj.keywords as LooseKeyword[]) {
    if (!item || typeof item !== "object") return null;
    const name = asNonEmptyString(item.name);
    const paragraphs = repairParagraphList(item.paragraphs);
    if (!name || !paragraphs) return null;
    keywords.push({ name, paragraphs });
  }

  const closingLine =
    asNonEmptyString(obj.closingLine) ??
    lastSentence(keywords.flatMap((k) => k.paragraphs).join(" "));
  if (!closingLine) return null;

  return { headline, keywords, closingLine };
}

/**
 * 엄격 파싱 실패 시에만 쓰는 구조 보정.
 * 같은 섹션/블록의 기존 문장만 split·복제·정리하며, 없는 소절·본문을 새로 지어내지 않는다.
 */
export function repairIncompleteReportV2(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = raw as Record<string, unknown>;

  const intro = asNonEmptyString(obj.intro);
  const conclusion = asNonEmptyString(obj.conclusion);
  const saekgi = repairSaekgi(obj.saekgi);
  const part1 = repairPart(obj.part1, part1SectionCount, "optional");
  const part2 = repairPart(obj.part2, part2SectionCount, "required");
  const part3 = repairPart3(obj.part3);
  const part4 = repairPart(obj.part4, part4SectionCount, "required");
  const part5 = repairPart(obj.part5, part5SectionCount, "required");

  // 보정 불가 필드는 원본을 그대로 남겨 검증이 실패하고 재시도로 넘어가게 한다.
  return {
    intro: intro ?? obj.intro,
    saekgi: saekgi ?? obj.saekgi,
    part1: part1 ?? obj.part1,
    part2: part2 ?? obj.part2,
    part3: part3 ?? obj.part3,
    part4: part4 ?? obj.part4,
    part5: part5 ?? obj.part5,
    conclusion: conclusion ?? obj.conclusion,
  };
}

function hasEmptyOrNullParagraphs(value: unknown): boolean {
  if (value === null) return true;
  // optional 필드 부재(undefined)는 허용. zod가 필수값을 이미 걸러낸다.
  if (value === undefined) return false;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.some((item) => hasEmptyOrNullParagraphs(item));
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((child) => hasEmptyOrNullParagraphs(child));
  }
  return false;
}

function everyParagraphBlockMinTwo(report: AiReportV2Strict): boolean {
  const blocks: string[][] = [
    report.saekgi.paragraphs,
    ...report.part1.sections.map((s) => s.paragraphs),
    ...report.part2.sections.map((s) => s.paragraphs),
    ...report.part3.keywords.map((k) => k.paragraphs),
    ...report.part4.sections.map((s) => s.paragraphs),
    ...report.part5.sections.map((s) => s.paragraphs),
  ];
  return blocks.every((paras) => paras.length >= PARAGRAPH_COUNT_V2.min && paras.every((p) => p.trim().length > 0));
}

/** 보정 결과가 원문 조각의 재조합인지 확인한다. 새 LLM 문장 삽입을 거부한다. */
function meaningPreserved(source: unknown, repaired: AiReportV2Strict): boolean {
  const pool = collectStrings(source);
  if (pool.length === 0) return false;
  const joined = pool.join(" ");
  const compactJoined = joined.replace(/\s+/g, "");
  const outputs = collectStrings(repaired);
  return outputs.every((piece) => {
    if (pool.some((src) => src.includes(piece))) return true;
    if (joined.includes(piece)) return true;
    const compactPiece = piece.replace(/\s+/g, "");
    return compactPiece.length > 0 && compactJoined.includes(compactPiece);
  });
}

export type FinalValidationResultV2 =
  | { ok: true; data: AiReportV2Strict }
  | { ok: false; reasons: string[] };

/**
 * 최종 출력 전 자체 검증.
 * 필수 파트·소절 수, 문단 ≥2, 빈/null 없음, 엄격 스키마를 통과해야 한다.
 * `meaningSource`를 넘기면(오류 경로 보정 후) 의미 보존까지 검사한다.
 */
export function validateReportForFinalOutputV2(report: unknown, meaningSource?: unknown): FinalValidationResultV2 {
  const reasons: string[] = [];
  const parsed = aiReportSchemaV2Strict.safeParse(report);
  if (!parsed.success) {
    reasons.push(
      ...parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`.trim()),
    );
    return { ok: false, reasons };
  }

  const data = parsed.data;
  if (!data.saekgi) reasons.push("saekgi missing");
  if (data.part1.sections.length !== part1SectionCount) reasons.push(`part1 sections want ${part1SectionCount}`);
  if (data.part2.sections.length !== part2SectionCount) reasons.push(`part2 sections want ${part2SectionCount}`);
  if (data.part3.keywords.length !== KEYWORD_COUNT_V2.min) reasons.push("part3 keywords count");
  if (data.part4.sections.length !== part4SectionCount) reasons.push(`part4 sections want ${part4SectionCount}`);
  if (data.part5.sections.length !== part5SectionCount) reasons.push(`part5 sections want ${part5SectionCount}`);
  if (!everyParagraphBlockMinTwo(data)) reasons.push("paragraphs min 2 or empty paragraph");
  if (hasEmptyOrNullParagraphs(data)) reasons.push("null/empty values present");

  if (meaningSource !== undefined && !meaningPreserved(meaningSource, data)) {
    reasons.push("meaning not preserved from source");
  }

  if (reasons.length > 0) return { ok: false, reasons };
  return { ok: true, data };
}
