import "server-only";

import type { SajuProfile } from "@/lib/saju";
import { AiReportError, requestStructuredReport } from "./generateReport";
import { NEWYEAR_INSTRUCTIONS, buildNewYearInput } from "./prompt.newyear";
import { AI_NEWYEAR_JSON_SCHEMA, aiNewYearSchema, type AiNewYearReport } from "./reportSchema.newyear";

export async function generateNewYearReport(profile: SajuProfile): Promise<AiNewYearReport> {
  return requestStructuredReport({
    instructions: NEWYEAR_INSTRUCTIONS,
    input: buildNewYearInput(profile),
    schemaName: "newyear_2027_report",
    schema: AI_NEWYEAR_JSON_SCHEMA,
    parse(json) {
      const parsed = aiNewYearSchema.safeParse(json);
      if (!parsed.success) {
        throw new AiReportError(
          "INVALID_OUTPUT",
          parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; "),
        );
      }
      return parsed.data;
    },
  });
}
