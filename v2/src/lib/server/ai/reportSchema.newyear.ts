import { z } from "zod";
import { NEWYEAR_YEAR_FROM, NEWYEAR_YEAR_TO } from "@/lib/constants/newyear";
import { scrubDeep } from "./scrubReportText";

const YEAR_COUNT = NEWYEAR_YEAR_TO - NEWYEAR_YEAR_FROM + 1;
const FOREIGN_SCRIPT = /[^\p{Script=Hangul}\p{Script=Han}\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/u;

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !FOREIGN_SCRIPT.test(value), "한국어 외의 문자가 섞여 있습니다.");

const chapter = z.object({
  headline: text(80),
  paragraphs: z.array(text(700)).min(2).max(4),
});

const period = z.object({
  headline: text(60),
  paragraphs: z.array(text(400)).min(1).max(2),
});

const reportObjectSchema = z.object({
  intro: text(500),
  nature: chapter,
  elements: chapter,
  love: chapter,
  stars: chapter,
  wealth: chapter,
  years: z.array(period).length(YEAR_COUNT),
  months: z.array(period).length(12),
  guide: chapter,
  closing: text(400),
});

export const aiNewYearSchema = z.preprocess((raw) => {
  if (!raw || typeof raw !== "object") return raw;
  return scrubDeep(raw);
}, reportObjectSchema);

export type AiNewYearReport = z.infer<typeof reportObjectSchema>;

const paragraphSchema = {
  type: "array",
  items: { type: "string" },
  minItems: 2,
  maxItems: 4,
} as const;

const chapterSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "paragraphs"],
  properties: {
    headline: { type: "string" },
    paragraphs: paragraphSchema,
  },
} as const;

const periodSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "paragraphs"],
  properties: {
    headline: { type: "string" },
    paragraphs: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 2 },
  },
} as const;

/** OpenAI Structured Outputs용. years는 2027~2037 순, months는 1~12월 순. */
export const AI_NEWYEAR_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["intro", "nature", "elements", "love", "stars", "wealth", "years", "months", "guide", "closing"],
  properties: {
    intro: { type: "string" },
    nature: chapterSchema,
    elements: chapterSchema,
    love: chapterSchema,
    stars: chapterSchema,
    wealth: chapterSchema,
    years: { type: "array", minItems: YEAR_COUNT, maxItems: YEAR_COUNT, items: periodSchema },
    months: { type: "array", minItems: 12, maxItems: 12, items: periodSchema },
    guide: chapterSchema,
    closing: { type: "string" },
  },
} as const;
