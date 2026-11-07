import { z } from "zod";
import { REPORT_PARTS_V2 } from "@/lib/constants/reportChapters.v2";
import { scrubDeep } from "./scrubReportText";

export const KEYWORD_COUNT_V2 = { min: 3, max: 3 } as const;
export const PARAGRAPH_COUNT_V2 = { min: 2, max: 5 } as const;

/** 한글·한자·영문·숫자·문장부호 외의 문자(모델이 가끔 섞는 다른 언어 단어)를 잡아낸다. */
const FOREIGN_SCRIPT = /[^\p{Script=Hangul}\p{Script=Han}\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/u;

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !FOREIGN_SCRIPT.test(value), "한국어 외의 문자가 섞여 있습니다.");

const paragraphs = z.array(text(2200)).min(PARAGRAPH_COUNT_V2.min).max(PARAGRAPH_COUNT_V2.max);

const sectionBlock = z.object({
  paragraphs,
});

/** 예전 5소절 저장본을 합칠 때 문단이 늘어날 수 있어 읽기용으로만 느슨하게 둔다. */
const sectionBlockLoose = z.object({
  paragraphs: z.array(text(2200)).min(1).max(10),
});

const partWithSections = (sectionCount: number) =>
  z.object({
    headline: text(160),
    sections: z.array(sectionBlock).length(sectionCount),
    closingLine: text(120),
  });

const part1Meta = REPORT_PARTS_V2.find((part) => part.part === 1)!;
const part2Meta = REPORT_PARTS_V2.find((part) => part.part === 2)!;
const part4Meta = REPORT_PARTS_V2.find((part) => part.part === 4)!;
const part5Meta = REPORT_PARTS_V2.find((part) => part.part === 5)!;

function mergeParagraphs(left: string[], right: string[]): string[] {
  const all = [...left, ...right];
  if (all.length <= 10) return all;
  return [...all.slice(0, 9), all.slice(9).join(" ")];
}

function sectionText(section: { paragraphs: string[] }): string {
  return section.paragraphs.join(" ");
}

/** 만남 시기 소절인지. 연·월 + 만남/인연 시기가 함께 보이면 true. */
function looksLikeMeetingTiming(section: { paragraphs: string[] }): boolean {
  const text = sectionText(section);
  const hasWhen = /그 남자를 만나는 때|만남이 열리기 쉬운 시기|\d{4}년.{0,24}\d{1,2}월/.test(text);
  const hasMeet = /만나|인연이 들어오|시기가|초반|중순/.test(text);
  return hasWhen && hasMeet;
}

/**
 * 예전 5소절이면 어필·필승을 합친다.
 * 모델이 5-2(시기)와 5-3(어필) 본문을 바꿔 넣으면 자리를 바로잡는다.
 */
function normalizePart5Sections(sections: { paragraphs: string[] }[]): { paragraphs: string[] }[] {
  let next = sections;
  if (next.length === 5) {
    next = [
      next[0],
      next[1],
      { paragraphs: mergeParagraphs(next[2].paragraphs, next[3].paragraphs) },
      next[4],
    ];
  }
  if (next.length >= 3 && looksLikeMeetingTiming(next[2]) && !looksLikeMeetingTiming(next[1])) {
    const swapped = [...next];
    swapped[1] = next[2];
    swapped[2] = next[1];
    return swapped;
  }
  return next;
}

const reportObjectSchema = z.object({
  intro: text(700),
  part1: partWithSections(part1Meta.sections.length),
  part2: partWithSections(part2Meta.sections.length),
  part3: z.object({
    headline: text(160),
    keywords: z
      .array(
        z.object({
          name: text(20),
          paragraphs,
        }),
      )
      .length(KEYWORD_COUNT_V2.min),
    closingLine: text(160),
  }),
  part4: partWithSections(part4Meta.sections.length),
  part5: z.object({
    headline: text(160),
    sections: z.array(sectionBlockLoose).length(part5Meta.sections.length),
    closingLine: text(120),
  }),
  conclusion: text(600),
});

/** v2 유료 리포트 JSON. loveTimeline 없음. */
export const aiReportSchemaV2 = z.preprocess((raw) => {
  if (!raw || typeof raw !== "object") return raw;
  const scrubbed = scrubDeep(raw) as {
    part5?: { sections?: { paragraphs: string[] }[]; headline?: string; closingLine?: string };
  };
  if (scrubbed.part5?.sections) {
    scrubbed.part5 = {
      ...scrubbed.part5,
      sections: normalizePart5Sections(scrubbed.part5.sections),
    };
  }
  return scrubbed;
}, reportObjectSchema);

export type AiReportV2 = z.infer<typeof reportObjectSchema>;

const sectionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["paragraphs"],
  properties: {
    paragraphs: { type: "array", items: { type: "string" }, minItems: PARAGRAPH_COUNT_V2.min, maxItems: PARAGRAPH_COUNT_V2.max },
  },
} as const;

const partSchema = (sectionCount: number) =>
  ({
    type: "object",
    additionalProperties: false,
    required: ["headline", "sections", "closingLine"],
    properties: {
      headline: { type: "string" },
      sections: {
        type: "array",
        minItems: sectionCount,
        maxItems: sectionCount,
        items: sectionSchema,
      },
      closingLine: { type: "string" },
    },
  }) as const;

/**
 * OpenAI Structured Outputs용 JSON Schema (v2). 신규는 항상 4소절 part5.
 */
export const AI_REPORT_JSON_SCHEMA_V2 = {
  type: "object",
  additionalProperties: false,
  required: ["intro", "part1", "part2", "part3", "part4", "part5", "conclusion"],
  properties: {
    intro: { type: "string" },
    part1: partSchema(part1Meta.sections.length),
    part2: partSchema(part2Meta.sections.length),
    part3: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "keywords", "closingLine"],
      properties: {
        headline: { type: "string" },
        keywords: {
          type: "array",
          minItems: KEYWORD_COUNT_V2.min,
          maxItems: KEYWORD_COUNT_V2.max,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "paragraphs"],
            properties: {
              name: { type: "string" },
              paragraphs: {
                type: "array",
                items: { type: "string" },
                minItems: PARAGRAPH_COUNT_V2.min,
                maxItems: PARAGRAPH_COUNT_V2.max,
              },
            },
          },
        },
        closingLine: { type: "string" },
      },
    },
    part4: partSchema(part4Meta.sections.length),
    part5: partSchema(part5Meta.sections.length),
    conclusion: { type: "string" },
  },
} as const;
