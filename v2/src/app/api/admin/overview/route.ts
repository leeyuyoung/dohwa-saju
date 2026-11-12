import { buildFunnelSummary, FUNNEL_STEPS, parseFunnelDateRange, type FunnelStep } from "@/lib/server/funnel";
import { isAdminConfigured, requireAdminSession } from "@/lib/server/adminAuth";
import { jsonError as fail } from "@/lib/server/http";
import { getAnalysisStore, type Attribution } from "@/lib/server/store";

function attributionLabel(attribution: Attribution | null | undefined) {
  if (!attribution) return "—";
  const parts = [attribution.utmSource, attribution.utmCampaign, attribution.utmContent].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export async function GET(request: Request) {
  if (!isAdminConfigured()) return fail(404, "Not found");
  if (!(await requireAdminSession())) return fail(401, "로그인이 필요합니다.");

  const params = new URL(request.url).searchParams;
  const funnelRange = parseFunnelDateRange(params.get("from"), params.get("to"));
  const store = getAnalysisStore();

  const funnelResult = await store.funnelSummary(funnelRange).catch((error) => {
    console.error("[admin/overview] funnel", error);
    const zeros = Object.fromEntries(FUNNEL_STEPS.map((step) => [step, 0])) as Record<FunnelStep, number>;
    return buildFunnelSummary(zeros);
  });

  let records;
  try {
    records = await store.listAnalyses();
  } catch (error) {
    console.error("[admin/overview] analyses", error);
    const detail = error instanceof Error ? error.message.replace(/sb_secret_[^\s]+/g, "[secret]") : "unknown";
    return fail(500, `제출 목록을 불러오지 못했습니다. (${detail.slice(0, 160)})`);
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
          phone: record.phone,
          marketingOptIn: record.marketingOptIn,
          attributionLabel: attributionLabel(record.attribution),
          paidAt: record.paidAt,
          status: record.status,
          emailSentAt: record.emailSentAt,
          emailError: record.emailError,
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
          phone: record.phone,
          marketingOptIn: record.marketingOptIn,
          attributionLabel: attributionLabel(record.attribution),
          paidAt: record.paidAt,
          status: record.status,
          emailSentAt: record.emailSentAt,
          emailError: record.emailError,
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
