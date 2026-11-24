import "server-only";

import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { buildSajuProfile, calculateSaju } from "@/lib/saju";
import type { AnalysisInput } from "@/lib/validation/analysisInput";
import { PRODUCT_DOHWA, productOf, type ProductId } from "@/lib/constants/newyear";
import { CURRENT_REPORT_VERSION, resolveReportVersion } from "@/lib/constants/reportVersion";
import { AiReportError, generateReport } from "./ai/generateReport";
import { generateNewYearReport } from "./ai/generateNewYearReport";
import { aiReportSchemaV1, type AiReportV1 } from "./ai/reportSchema.v1";
import { aiReportSchemaV2, type AiReportV2 } from "./ai/reportSchema.v2";
import { aiNewYearSchema, type AiNewYearReport } from "./ai/reportSchema.newyear";
import { sendReportEmail } from "./email/sendReportEmail";
import { sendReportFailureAlert } from "./email/sendReportFailureAlert";
import { getAnalysisStore, type AnalysisRecord, type StoredAiReport } from "./store";

/** 이 시간보다 오래 generating이면 생성이 중단된 것으로 보고 다시 시작할 수 있다. 생성 제한 시간(300초)보다 길어야 한다. */
const STALE_GENERATION_MS = 10 * 60 * 1000;
/** 미결제 분석은 이 기간이 지나면 삭제한다. 개인정보 보관 최소화. */
const UNPAID_ANALYSIS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** 결제 후 이 시간이 지나도 메일이 없으면 복구 대상. 첫 생성(최대 ~4분)보다 길어야 한다. */
const PAID_EMAIL_GRACE_MS = 5 * 60 * 1000;
/** 크론이 자동으로 돌리는 재생성 상한(결제 1건당). */
const MAX_AUTO_REPORT_RETRIES = 2;
/** 크론 한 번에 재생성하는 최대 건수. 건당 AI 호출이 길어 제한한다. */
const MAX_REGENS_PER_SWEEP = 2;
/** 크론 한 번에 메일만 재시도하는 최대 건수. */
const MAX_EMAILS_PER_SWEEP = 10;

export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;
const newToken = () => randomBytes(16).toString("base64url");

/** 저장된 리포트가 해당 버전 스키마에 맞을 때만 돌려준다. */
export function storedReport(record: AnalysisRecord): StoredAiReport | null {
  if (!record.report) return null;
  if (productOf(record) === "newyear2027") {
    const parsed = aiNewYearSchema.safeParse(record.report);
    return parsed.success ? parsed.data : null;
  }
  const version = resolveReportVersion(record.reportVersion);
  if (version === 1) {
    const parsed = aiReportSchemaV1.safeParse(record.report);
    return parsed.success ? parsed.data : null;
  }
  if (version === 2) {
    const parsed = aiReportSchemaV2.safeParse(record.report);
    return parsed.success ? parsed.data : null;
  }
  return null;
}

export type { AiReportV1, AiReportV2, AiNewYearReport };

/** 만세력 계산만으로 무료 결과를 만든다. AI는 결제 후에만 호출한다. 계산 오류는 그대로 던진다(SajuCalculationError). */
export async function createAnalysis(input: AnalysisInput, product: ProductId = PRODUCT_DOHWA): Promise<AnalysisRecord> {
  const profile = buildSajuProfile(calculateSaju({ birth: input.birth, gender: input.gender }));
  const now = Date.now();
  const record: AnalysisRecord = {
    token: newToken(),
    product,
    status: "ready",
    createdAt: now,
    updatedAt: now,
    name: input.name,
    email: null,
    emailSentAt: null,
    emailError: null,
    reportError: null,
    reportRetryCount: 0,
    reportAlertSentAt: null,
    phone: null,
    marketingOptIn: null,
    relationshipStatus: input.relationshipStatus,
    concern: (() => {
      const job = typeof input.job === "string" ? input.job.trim() : "";
      const concern = typeof input.concern === "string" ? input.concern.trim() : "";
      if (!job && !concern) return null;
      return [job ? `직업/직무: ${job}` : null, concern || null].filter(Boolean).join("\n\n");
    })(),
    attribution: input.attribution
      ? {
          utmSource: input.attribution.utmSource ?? null,
          utmMedium: input.attribution.utmMedium ?? null,
          utmCampaign: input.attribution.utmCampaign ?? null,
          utmContent: input.attribution.utmContent ?? null,
          utmTerm: input.attribution.utmTerm ?? null,
          landing: input.attribution.landing ?? null,
          capturedAt: input.attribution.capturedAt ?? null,
        }
      : null,
    profile,
    report: null,
    reportVersion: null,
    paidAt: null,
  };
  const store = getAnalysisStore();
  await store.create(record);
  // 미결제·오래된 건은 조용히 정리한다. 실패해도 새 제출은 막지 않는다.
  void store.deleteUnpaidAnalysesBefore(now - UNPAID_ANALYSIS_TTL_MS).catch((error) => {
    console.error("[analysis] unpaid cleanup failed", error);
  });
  return record;
}

/** 결제가 확인된 분석을 열고 리포트 생성을 시작한다. 결제 승인 검증을 마친 서버 코드에서만 호출한다. */
export async function markAnalysisPaid(token: string): Promise<boolean> {
  const store = getAnalysisStore();
  const record = await store.get(token);
  if (!record) return false;
  if (record.paidAt === null) {
    await store.update(token, { paidAt: Date.now() });
    if (storedReport(record)) after(() => sendReportEmail(record));
  }
  await startReportGeneration(token);
  return true;
}

/** 환불된 리포트를 다시 잠근다. */
export async function revokeAnalysisPaid(token: string): Promise<void> {
  await getAnalysisStore().update(token, { paidAt: null });
}

/**
 * 결제된 분석의 리포트 생성을 백그라운드로 시작한다. 이미 완성됐거나 다른 요청이 생성 중이면 아무것도 하지 않는다.
 * after()를 쓰므로 요청을 처리하는 중에만 호출한다.
 */
export async function startReportGeneration(token: string): Promise<void> {
  const store = getAnalysisStore();
  const record = await store.get(token);
  if (!record || record.paidAt === null || storedReport(record)) return;
  if (record.report) await store.update(token, { report: null, reportVersion: null });
  const claimed = await store.claimReportGeneration(token, Date.now() - STALE_GENERATION_MS);
  if (claimed) after(() => runReportGeneration(token));
}

/** 리포트를 한 번 생성해 저장하고 메일을 보낸다. 실패해도 예외를 밖으로 던지지 않고 상태만 바꾼다. */
async function runReportGeneration(token: string): Promise<boolean> {
  const store = getAnalysisStore();
  try {
    const record = await store.get(token);
    if (!record) return false;
    const report =
      productOf(record) === "newyear2027"
        ? await generateNewYearReport(record.profile)
        : await generateReport(record.profile, { relationshipStatus: record.relationshipStatus });
    await store.update(token, {
      status: "ready",
      report,
      reportVersion: productOf(record) === "newyear2027" ? null : CURRENT_REPORT_VERSION,
      reportError: null,
      reportAlertSentAt: null,
    });
    const latest = await store.get(token);
    if (latest?.paidAt) await sendReportEmail(latest);
    return true;
  } catch (error) {
    // 사용자 입력이 섞이지 않도록 오류 코드와 메시지만 남긴다. 관리자에서 원인을 본다.
    const detail =
      error instanceof AiReportError
        ? `${error.code}: ${error.message.replace(/^\[ai-report\]\s*[A-Z_]+:\s*/, "").slice(0, 400)}`
        : String(error).slice(0, 400);
    console.error(`[analysis] ${token.slice(0, 6)}… report generation failed: ${detail}`);
    await store
      .update(token, { status: "failed", reportError: detail })
      .catch((storeError) => console.error(`[analysis] could not mark failed: ${String(storeError)}`));
    return false;
  }
}

export type ReportRecoveryResult = {
  emailed: string[];
  regenerated: string[];
  alerted: string[];
  skipped: number;
};

/**
 * 결제됐는데 메일이 안 간 건을 훑어, 리포트가 있으면 메일만 보내고
 * failed·미완성·멈춘 generating이면 자동 재생성(건당 최대 2회) 후 메일을 보낸다.
 * Vercel Cron 등에서 await로 호출한다.
 */
export async function recoverStuckPaidReports(now = Date.now()): Promise<ReportRecoveryResult> {
  const store = getAnalysisStore();
  const rows = await store.listAnalyses();
  const graceBefore = now - PAID_EMAIL_GRACE_MS;
  const staleBefore = now - STALE_GENERATION_MS;
  const candidates = rows.filter(
    (row) => row.paidAt !== null && row.paidAt <= graceBefore && row.emailSentAt === null,
  );

  const result: ReportRecoveryResult = { emailed: [], regenerated: [], alerted: [], skipped: 0 };
  let regenBudget = MAX_REGENS_PER_SWEEP;
  let emailBudget = MAX_EMAILS_PER_SWEEP;

  for (const summary of candidates) {
    const record = await store.get(summary.token);
    if (!record || record.paidAt === null || record.emailSentAt !== null) {
      result.skipped += 1;
      continue;
    }

    const report = storedReport(record);
    if (report) {
      if (emailBudget <= 0) {
        result.skipped += 1;
        continue;
      }
      emailBudget -= 1;
      const ok = await sendReportEmail(record);
      if (ok) result.emailed.push(record.token);
      else result.skipped += 1;
      continue;
    }

    const generatingFresh = record.status === "generating" && record.updatedAt >= staleBefore;
    if (generatingFresh) {
      result.skipped += 1;
      continue;
    }
    if (record.reportRetryCount >= MAX_AUTO_REPORT_RETRIES) {
      const latest = await store.get(record.token);
      if (latest && (await sendReportFailureAlert(latest))) result.alerted.push(record.token);
      else result.skipped += 1;
      continue;
    }
    if (regenBudget <= 0) {
      result.skipped += 1;
      continue;
    }

    regenBudget -= 1;
    const nextRetry = record.reportRetryCount + 1;
    await store.update(record.token, {
      report: null,
      reportVersion: null,
      reportRetryCount: nextRetry,
    });
    const claimed = await store.claimReportGeneration(record.token, staleBefore);
    if (!claimed) {
      result.skipped += 1;
      continue;
    }
    const ok = await runReportGeneration(record.token);
    if (ok) {
      result.regenerated.push(record.token);
      continue;
    }
    if (nextRetry >= MAX_AUTO_REPORT_RETRIES) {
      const latest = await store.get(record.token);
      if (latest && (await sendReportFailureAlert(latest))) result.alerted.push(record.token);
      else result.skipped += 1;
    } else {
      result.skipped += 1;
    }
  }

  return result;
}
