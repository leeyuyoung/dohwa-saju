import "server-only";

import { SERVICE } from "@/lib/constants/service";
import type { AnalysisRecord } from "@/lib/server/store";
import { getAnalysisStore } from "@/lib/server/store";

const RESEND_API = "https://api.resend.com/emails";
const REQUEST_TIMEOUT_MS = 10_000;
/** 결제 후 리포트 생성 실패 시 받는 운영자 메일. */
const ALERT_TO = "yylee00@naver.com";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/**
 * 결제 후 리포트 생성이 실패하면 운영자에게 바로 알린다.
 * 이미 알림을 보낸 건(reportAlertSentAt)은 다시 보내지 않는다. 수동 재생성 성공 시 초기화된다.
 */
export async function sendReportFailureAlert(record: AnalysisRecord): Promise<boolean> {
  if (record.reportAlertSentAt) return false;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL;
  if (!apiKey || !from || !appUrl) {
    console.error("[alert] RESEND_API_KEY, EMAIL_FROM, APP_URL must be set; failure alert skipped");
    return false;
  }

  const adminUrl = new URL("/admin", appUrl).toString();
  const reportUrl = new URL(`/report/${record.token}`, appUrl).toString();
  const paidAt = record.paidAt
    ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(record.paidAt))
    : "—";
  const reason = record.reportError?.trim() || "사유 없음";
  const subject = `[${SERVICE.name}] 리포트 생성 실패 · ${record.name}`;
  const text = [
    "결제됐는데 리포트 생성이 실패했습니다. 수동으로 재생성·메일 발송이 필요합니다.",
    "",
    `이름: ${record.name}`,
    `이메일: ${record.email ?? "없음"}`,
    `결제: ${paidAt}`,
    `사유: ${reason}`,
    `token: ${record.token}`,
    "",
    `리포트: ${reportUrl}`,
    `관리자: ${adminUrl}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="ko"><body style="font-family:sans-serif;line-height:1.6;color:#222;">
  <p><strong>결제됐는데 리포트 생성이 실패했습니다.</strong></p>
  <p>수동으로 재생성·메일 발송이 필요합니다.</p>
  <ul>
    <li>이름: ${escapeHtml(record.name)}</li>
    <li>이메일: ${escapeHtml(record.email ?? "없음")}</li>
    <li>결제: ${escapeHtml(paidAt)}</li>
    <li>사유: ${escapeHtml(reason)}</li>
    <li>token: <code>${escapeHtml(record.token)}</code></li>
  </ul>
  <p><a href="${escapeHtml(reportUrl)}">리포트 링크</a> · <a href="${escapeHtml(adminUrl)}">관리자</a></p>
</body></html>`;

  try {
    const response = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `report-fail-alert/${record.token}/${Date.now()}`,
      },
      body: JSON.stringify({ from, to: [ALERT_TO], subject, html, text }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[alert] resend HTTP ${response.status} ${body.slice(0, 200)}`);
      return false;
    }
    await getAnalysisStore().update(record.token, { reportAlertSentAt: Date.now() });
    return true;
  } catch (error) {
    console.error("[alert] resend request failed", String(error));
    return false;
  }
}
