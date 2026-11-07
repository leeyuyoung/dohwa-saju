/**
 * 현재 생성에 쓰는 리포트 스키마 (v2).
 * 이미 저장된 v1은 reportSchema.v1 + reportVersion으로 읽는다.
 */
export {
  AI_REPORT_JSON_SCHEMA_V2 as AI_REPORT_JSON_SCHEMA,
  KEYWORD_COUNT_V2 as KEYWORD_COUNT,
  PARAGRAPH_COUNT_V2 as PARAGRAPH_COUNT,
  aiReportSchemaV2 as aiReportSchema,
  type AiReportV2 as AiReport,
} from "./reportSchema.v2";
