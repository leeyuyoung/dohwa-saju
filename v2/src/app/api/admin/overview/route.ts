import { relationshipLabel } from "@/lib/validation/analysisInput";
import { buildFunnelSummary, FUNNEL_STEPS, type FunnelStep } from "@/lib/server/funnel";
import { isAdminConfigured, requireAdminSession } from "@/lib/server/adminAuth";
import { jsonError as fail } from "@/lib/server/http";
import { getAnalysisStore } from "@/lib/server/store";

export async function GET() {
  if (!isAdminConfigured()) return fail(404, "Not found");
  if (!(await requireAdminSession())) return fail(401, "로그인이 필요합니다.");

  const store = getAnalysisStore();

  const funnelResult = await store.funnelSummary().catch((error) => {
    console.error("[admin/overview] funnel", error);
    const zeros = Object.fromEntries(FUNNEL_STEPS.map((step) => [step, 0])) as Record<FunnelStep, number>;
    return buildFunnelSummary(zeros);
  });

  let records;
  try {
    records = await store.listAnalyses(100);
  } catch (error) {
    console.error("[admin/overview] analyses", error);
    return fail(500, "현황을 불러오지 못했습니다.");
  }

  const analyses = records.flatMap((record) => {
    try {
      const { solarDate, birthTime, lunarDate } = record.profile.calculation;
      return [
        {
          token: record.token,
          createdAt: record.createdAt,
          name: record.name,
          email: record.email,
          relationshipStatus: record.relationshipStatus,
          relationshipLabel: relationshipLabel(record.relationshipStatus),
          paidAt: record.paidAt,
          status: record.status,
          birth: {
            solar: `${solarDate.year}-${String(solarDate.month).padStart(2, "0")}-${String(solarDate.day).padStart(2, "0")}`,
            lunar: `${lunarDate.year}-${String(lunarDate.month).padStart(2, "0")}-${String(lunarDate.day).padStart(2, "0")}${lunarDate.isLeapMonth ? "(윤)" : ""}`,
            time: birthTime
              ? `${String(birthTime.hour).padStart(2, "0")}:${String(birthTime.minute).padStart(2, "0")}`
              : "모름",
          },
        },
      ];
    } catch (error) {
      console.error("[admin/overview] map record", record.token, error);
      return [
        {
          token: record.token,
          createdAt: record.createdAt,
          name: record.name,
          email: record.email,
          relationshipStatus: record.relationshipStatus,
          relationshipLabel: relationshipLabel(record.relationshipStatus),
          paidAt: record.paidAt,
          status: record.status,
          birth: { solar: "—", lunar: "—", time: "—" },
        },
      ];
    }
  });

  return Response.json(
    { funnel: funnelResult, analyses, generatedAt: Date.now() },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
