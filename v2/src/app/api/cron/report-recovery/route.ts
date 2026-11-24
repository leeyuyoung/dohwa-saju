import { recoverStuckPaidReports } from "@/lib/server/analysis";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

/**
 * 결제 후 메일 미발송·생성 실패 건을 복구한다.
 * Vercel Cron이 CRON_SECRET Bearer로 호출한다.
 */
export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401, headers: NO_STORE });
  }
  try {
    const result = await recoverStuckPaidReports();
    console.info("[cron/report-recovery]", result);
    return Response.json({ ok: true, ...result }, { headers: NO_STORE });
  } catch (error) {
    console.error("[cron/report-recovery]", error);
    return Response.json({ ok: false, error: "recovery_failed" }, { status: 500, headers: NO_STORE });
  }
}
