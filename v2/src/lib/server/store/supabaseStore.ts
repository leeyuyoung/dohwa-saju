import "server-only";

import { FUNNEL_STEPS, type FunnelStep } from "@/lib/funnelSteps";
import { buildFunnelSummary, type FunnelEvent, type FunnelSummaryRange } from "@/lib/server/funnel";
import type { AnalysisRecord, AnalysisStore, OrderPatch, OrderRecord } from "./types";

const TABLE = "analyses";
const ORDER_TABLE = "orders";
const FUNNEL_TABLE = "funnel_events";
const REQUEST_TIMEOUT_MS = 10_000;

type Row = {
  token: string;
  status: AnalysisRecord["status"];
  created_at: string;
  updated_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  marketing_opt_in: boolean | null;
  relationship_status: AnalysisRecord["relationshipStatus"];
  concern: string | null;
  attribution: AnalysisRecord["attribution"];
  profile: AnalysisRecord["profile"];
  report: AnalysisRecord["report"];
  report_version: number | null;
  paid_at: string | null;
  email_sent_at: string | null;
  email_error: string | null;
};

type Patch = Partial<Omit<AnalysisRecord, "token" | "createdAt">>;

type OrderRow = {
  order_id: string;
  token: string;
  amount: number;
  status: OrderRecord["status"];
  payment_key: string | null;
  method: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  meta_click: OrderRecord["metaClick"];
};

const toIso = (time: number) => new Date(time).toISOString();

const toOrderRow = (order: OrderRecord): OrderRow => ({
  order_id: order.orderId,
  token: order.token,
  amount: order.amount,
  status: order.status,
  payment_key: order.paymentKey,
  method: order.method,
  created_at: toIso(order.createdAt),
  updated_at: toIso(order.updatedAt),
  approved_at: order.approvedAt === null ? null : toIso(order.approvedAt),
  meta_click: order.metaClick,
});

const fromOrderRow = (row: OrderRow): OrderRecord => ({
  orderId: row.order_id,
  token: row.token,
  amount: row.amount,
  status: row.status,
  paymentKey: row.payment_key,
  method: row.method,
  createdAt: Date.parse(row.created_at),
  updatedAt: Date.parse(row.updated_at),
  approvedAt: row.approved_at === null ? null : Date.parse(row.approved_at),
  metaClick: row.meta_click ?? null,
});

function toRow(record: AnalysisRecord): Row {
  return {
    token: record.token,
    status: record.status,
    created_at: toIso(record.createdAt),
    updated_at: toIso(record.updatedAt),
    name: record.name,
    email: record.email,
    phone: record.phone,
    marketing_opt_in: record.marketingOptIn,
    relationship_status: record.relationshipStatus,
    concern: record.concern,
    attribution: record.attribution,
    profile: record.profile,
    report: record.report,
    report_version: record.reportVersion,
    paid_at: record.paidAt === null ? null : toIso(record.paidAt),
    email_sent_at: record.emailSentAt === null ? null : toIso(record.emailSentAt),
    email_error: record.emailError,
  };
}

function fromRow(row: Row): AnalysisRecord {
  return {
    token: row.token,
    status: row.status,
    createdAt: Date.parse(row.created_at),
    updatedAt: Date.parse(row.updated_at),
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    marketingOptIn: row.marketing_opt_in ?? null,
    relationshipStatus: row.relationship_status,
    concern: row.concern,
    attribution: row.attribution ?? null,
    profile: row.profile,
    report: row.report,
    reportVersion: row.report_version ?? null,
    paidAt: row.paid_at === null ? null : Date.parse(row.paid_at),
    emailSentAt: row.email_sent_at == null ? null : Date.parse(row.email_sent_at),
    emailError: row.email_error ?? null,
  };
}

function patchToRow(patch: Patch): Partial<Row> {
  const row: Partial<Row> = { updated_at: toIso(Date.now()) };
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.marketingOptIn !== undefined) row.marketing_opt_in = patch.marketingOptIn;
  if (patch.relationshipStatus !== undefined) row.relationship_status = patch.relationshipStatus;
  if (patch.concern !== undefined) row.concern = patch.concern;
  if (patch.attribution !== undefined) row.attribution = patch.attribution;
  if (patch.profile !== undefined) row.profile = patch.profile;
  if (patch.report !== undefined) row.report = patch.report;
  if (patch.reportVersion !== undefined) row.report_version = patch.reportVersion;
  if (patch.paidAt !== undefined) row.paid_at = patch.paidAt === null ? null : toIso(patch.paidAt);
  if (patch.emailSentAt !== undefined) row.email_sent_at = patch.emailSentAt === null ? null : toIso(patch.emailSentAt);
  if (patch.emailError !== undefined) row.email_error = patch.emailError;
  return row;
}

export class SupabaseStoreError extends Error {
  constructor(message: string) {
    super(`[supabase-store] ${message}`);
    this.name = "SupabaseStoreError";
  }
}

/** Supabase(PostgREST)에 Secret key로 접근하는 저장소. 서버에서만 쓴다. */
export class SupabaseAnalysisStore implements AnalysisStore {
  readonly storeVersion = 4;
  constructor(
    private readonly url: string,
    private readonly secretKey: string,
  ) {}

  private async request(path: string, init: RequestInit & { prefer?: string }) {
    const headers: Record<string, string> = {
      apikey: this.secretKey,
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
    if (init.prefer) headers.Prefer = init.prefer;
    let response: Response;
    try {
      response = await fetch(`${this.url}/rest/v1/${path}`, {
        ...init,
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new SupabaseStoreError(`network ${String(error)}`);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new SupabaseStoreError(`HTTP ${response.status} ${body.slice(0, 200)}`);
    }
    return response;
  }

  async create(record: AnalysisRecord) {
    await this.request(TABLE, { method: "POST", body: JSON.stringify(toRow(record)), prefer: "return=minimal" });
  }

  async get(token: string) {
    const response = await this.request(`${TABLE}?token=eq.${encodeURIComponent(token)}&select=*&limit=1`, {
      method: "GET",
    });
    const rows = (await response.json()) as Row[];
    return rows[0] ? fromRow(rows[0]) : null;
  }

  async update(token: string, patch: Patch) {
    await this.request(`${TABLE}?token=eq.${encodeURIComponent(token)}`, {
      method: "PATCH",
      body: JSON.stringify(patchToRow(patch)),
      prefer: "return=minimal",
    });
  }

  async claimReportGeneration(token: string, staleBefore: number) {
    const filters = [
      `token=eq.${encodeURIComponent(token)}`,
      "paid_at=not.is.null",
      "report=is.null",
      `or=${encodeURIComponent(`(status.neq.generating,updated_at.lt."${toIso(staleBefore)}")`)}`,
      "select=token",
    ].join("&");
    const response = await this.request(`${TABLE}?${filters}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "generating", updated_at: toIso(Date.now()) }),
      prefer: "return=representation",
    });
    const rows = (await response.json()) as { token: string }[];
    return rows.length > 0;
  }

  async createOrder(order: OrderRecord) {
    await this.request(ORDER_TABLE, { method: "POST", body: JSON.stringify(toOrderRow(order)), prefer: "return=minimal" });
  }

  async getOrder(orderId: string) {
    const response = await this.request(
      `${ORDER_TABLE}?order_id=eq.${encodeURIComponent(orderId)}&select=*&limit=1`,
      { method: "GET" },
    );
    const rows = (await response.json()) as OrderRow[];
    return rows[0] ? fromOrderRow(rows[0]) : null;
  }

  async updateOrder(orderId: string, patch: OrderPatch) {
    const row: Partial<OrderRow> = { updated_at: toIso(Date.now()) };
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.paymentKey !== undefined) row.payment_key = patch.paymentKey;
    if (patch.method !== undefined) row.method = patch.method;
    if (patch.approvedAt !== undefined) row.approved_at = patch.approvedAt === null ? null : toIso(patch.approvedAt);
    await this.request(`${ORDER_TABLE}?order_id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      body: JSON.stringify(row),
      prefer: "return=minimal",
    });
  }

  async deleteStalePendingOrders(createdBefore: number) {
    await this.request(
      `${ORDER_TABLE}?status=eq.pending&created_at=lt.${encodeURIComponent(toIso(createdBefore))}`,
      { method: "DELETE", prefer: "return=minimal" },
    );
  }

  async deleteUnpaidAnalysesBefore(createdBefore: number) {
    await this.request(
      `${TABLE}?paid_at=is.null&created_at=lt.${encodeURIComponent(toIso(createdBefore))}`,
      { method: "DELETE", prefer: "return=minimal" },
    );
  }

  async listAnalyses() {
    // report 본문은 목록에 필요 없고 용량이 커서 빼 둔다. 관리자 목록용 컬럼만 가져온다.
    const select = [
      "token",
      "status",
      "created_at",
      "updated_at",
      "name",
      "email",
      "phone",
      "marketing_opt_in",
      "relationship_status",
      "concern",
      "attribution",
      "profile",
      "report_version",
      "paid_at",
      "email_sent_at",
      "email_error",
    ].join(",");
    const pageSize = 1000;
    const records: AnalysisRecord[] = [];
    for (let offset = 0; ; offset += pageSize) {
      const response = await this.request(
        `${TABLE}?select=${select}&order=created_at.desc&limit=${pageSize}&offset=${offset}`,
        { method: "GET" },
      );
      const rows = (await response.json()) as Array<Omit<Row, "report"> & { report?: Row["report"] }>;
      records.push(...rows.map((row) => fromRow({ ...row, report: null })));
      if (rows.length < pageSize) break;
    }
    return records;
  }

  async trackFunnelEvent(event: FunnelEvent) {
    const body = {
      session_id: event.sessionId,
      step: event.step,
      token: event.token,
      created_at: toIso(event.at),
    };
    // 같은 session+step은 PK로 한 번만. 테이블 미생성·중복은 무시한다.
    try {
      await this.request(FUNNEL_TABLE, {
        method: "POST",
        body: JSON.stringify(body),
        prefer: "return=minimal,resolution=ignore-duplicates",
      });
    } catch (error) {
      if (
        error instanceof SupabaseStoreError &&
        /HTTP (404|409)|duplicate|Could not find the table|PGRST/i.test(error.message)
      ) {
        return;
      }
      console.error("[funnel] track failed", error);
    }
  }

  async findFunnelSessionForToken(token: string) {
    try {
      const response = await this.request(
        `${FUNNEL_TABLE}?token=eq.${encodeURIComponent(token)}&select=session_id&order=created_at.desc&limit=1`,
        { method: "GET" },
      );
      const rows = (await response.json()) as Array<{ session_id: string }>;
      return rows[0]?.session_id ?? null;
    } catch (error) {
      console.error("[funnel] find session failed", error);
      return null;
    }
  }

  async hasFunnelStepForToken(step: FunnelStep, token: string) {
    try {
      const response = await this.request(
        `${FUNNEL_TABLE}?step=eq.${encodeURIComponent(step)}&token=eq.${encodeURIComponent(token)}&select=session_id&limit=1`,
        { method: "GET" },
      );
      const rows = (await response.json()) as unknown[];
      return Array.isArray(rows) && rows.length > 0;
    } catch (error) {
      console.error("[funnel] has step failed", error);
      return false;
    }
  }

  async funnelSummary(range?: FunnelSummaryRange) {
    const counts = Object.fromEntries(FUNNEL_STEPS.map((step) => [step, 0])) as Record<FunnelStep, number>;
    try {
      await Promise.all(
        FUNNEL_STEPS.map(async (step) => {
          counts[step] = await this.countFunnelStep(step, range);
        }),
      );
    } catch (error) {
      // funnel_events 테이블이 없으면 0으로 돌려 관리자 화면은 열리게 한다.
      console.error("[funnel] summary failed", error);
    }
    return buildFunnelSummary(counts);
  }

  private async countFunnelStep(step: FunnelStep, range?: FunnelSummaryRange): Promise<number> {
    const headers: Record<string, string> = {
      apikey: this.secretKey,
      Authorization: `Bearer ${this.secretKey}`,
      Prefer: "count=exact",
      Range: "0-0",
    };
    const filters = [`step=eq.${encodeURIComponent(step)}`];
    if (range?.fromMs != null) filters.push(`created_at=gte.${encodeURIComponent(toIso(range.fromMs))}`);
    if (range?.toMsExclusive != null) {
      filters.push(`created_at=lt.${encodeURIComponent(toIso(range.toMsExclusive))}`);
    }
    let response: Response;
    try {
      response = await fetch(
        `${this.url}/rest/v1/${FUNNEL_TABLE}?${filters.join("&")}&select=session_id`,
        { method: "GET", headers, cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
      );
    } catch (error) {
      throw new SupabaseStoreError(`network ${String(error)}`);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new SupabaseStoreError(`HTTP ${response.status} ${body.slice(0, 200)}`);
    }
    const contentRange = response.headers.get("content-range");
    const total = contentRange?.split("/")[1];
    if (total && total !== "*" && /^\d+$/.test(total)) return Number(total);
    const rows = (await response.json().catch(() => [])) as unknown[];
    return Array.isArray(rows) ? rows.length : 0;
  }
}
