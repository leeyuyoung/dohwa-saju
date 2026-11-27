import "server-only";

import { PRODUCT_DOHWA, type ProductId } from "@/lib/constants/newyear";
import type { FunnelStep } from "@/lib/funnelSteps";
import {
  buildFunnelSummary,
  funnelLabelsForProduct,
  funnelStepsForProduct,
  type FunnelEvent,
  type FunnelSummaryOptions,
  type FunnelSummaryRange,
} from "@/lib/server/funnel";
import type { AnalysisRecord, AnalysisStore, OrderPatch, OrderRecord } from "./types";

/** 개발용 보관 기간. 서버를 재시작해도 사라진다. */
const RECORD_TTL_MS = 24 * 60 * 60 * 1000;

function funnelBucketKey(product: ProductId, step: FunnelStep) {
  return `${product}\0${step}`;
}

/**
 * 개발용 메모리 저장소. Supabase 설정이 없을 때만 쓰며, 서버 프로세스 하나에서만 유효해 배포 환경에서는 쓸 수 없다.
 */
export class MemoryAnalysisStore implements AnalysisStore {
  readonly storeVersion = 4;
  private records = new Map<string, AnalysisRecord>();
  private orders = new Map<string, OrderRecord>();
  private funnel = new Map<string, Set<string>>();
  private funnelMeta = new Map<string, FunnelEvent>();

  private sweep() {
    const now = Date.now();
    for (const [token, record] of this.records) {
      if (now - record.createdAt > RECORD_TTL_MS) this.records.delete(token);
    }
  }

  async create(record: AnalysisRecord) {
    this.sweep();
    this.records.set(record.token, structuredClone(record));
  }

  async get(token: string) {
    this.sweep();
    const record = this.records.get(token);
    return record ? structuredClone(record) : null;
  }

  async update(token: string, patch: Partial<Omit<AnalysisRecord, "token" | "createdAt">>) {
    const record = this.records.get(token);
    if (!record) return;
    this.records.set(token, { ...record, ...structuredClone(patch), updatedAt: Date.now() });
  }

  async claimReportGeneration(token: string, staleBefore: number) {
    const record = this.records.get(token);
    if (!record || record.paidAt === null || record.report !== null) return false;
    if (record.status === "generating" && record.updatedAt >= staleBefore) return false;
    this.records.set(token, {
      ...record,
      status: "generating",
      reportError: null,
      reportAlertSentAt: null,
      updatedAt: Date.now(),
    });
    return true;
  }

  async createOrder(order: OrderRecord) {
    if (this.orders.has(order.orderId)) throw new Error("duplicate orderId");
    this.orders.set(order.orderId, { ...order });
  }

  async getOrder(orderId: string) {
    const order = this.orders.get(orderId);
    return order ? { ...order } : null;
  }

  async updateOrder(orderId: string, patch: OrderPatch) {
    const order = this.orders.get(orderId);
    if (!order) return;
    this.orders.set(orderId, { ...order, ...patch, updatedAt: Date.now() });
  }

  async deleteStalePendingOrders(createdBefore: number) {
    for (const [orderId, order] of this.orders) {
      if (order.status === "pending" && order.createdAt < createdBefore) this.orders.delete(orderId);
    }
  }

  async deleteUnpaidAnalysesBefore(createdBefore: number) {
    for (const [token, record] of this.records) {
      if (record.paidAt === null && record.createdAt < createdBefore) this.records.delete(token);
    }
  }

  async listAnalyses() {
    this.sweep();
    return [...this.records.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((record) => structuredClone(record));
  }

  async trackFunnelEvent(event: FunnelEvent) {
    const product = event.product ?? PRODUCT_DOHWA;
    const key = `${product}\0${event.sessionId}\0${event.step}`;
    if (this.funnelMeta.has(key)) return;
    const stored = { ...event, product };
    this.funnelMeta.set(key, stored);
    const bucket = funnelBucketKey(product, event.step);
    const set = this.funnel.get(bucket) ?? new Set<string>();
    set.add(event.sessionId);
    this.funnel.set(bucket, set);
  }

  async findFunnelSessionForToken(token: string) {
    let latest: FunnelEvent | null = null;
    for (const event of this.funnelMeta.values()) {
      if (event.token !== token) continue;
      if (!latest || event.at > latest.at) latest = event;
    }
    return latest?.sessionId ?? null;
  }

  async hasFunnelStepForToken(step: FunnelStep, token: string) {
    for (const event of this.funnelMeta.values()) {
      if (event.step === step && event.token === token) return true;
    }
    return false;
  }

  async funnelSummary(range?: FunnelSummaryRange, options?: FunnelSummaryOptions) {
    const product = options?.product ?? PRODUCT_DOHWA;
    const steps = options?.steps ?? funnelStepsForProduct(product);
    const labels = options?.labels ?? funnelLabelsForProduct(product);
    const counts = Object.fromEntries(steps.map((step) => [step, 0])) as Record<FunnelStep, number>;

    if (!range?.fromMs && !range?.toMsExclusive) {
      for (const step of steps) {
        counts[step] = this.funnel.get(funnelBucketKey(product, step))?.size ?? 0;
      }
      return buildFunnelSummary(counts, { steps, labels, product });
    }

    for (const event of this.funnelMeta.values()) {
      if ((event.product ?? PRODUCT_DOHWA) !== product) continue;
      if (range.fromMs != null && event.at < range.fromMs) continue;
      if (range.toMsExclusive != null && event.at >= range.toMsExclusive) continue;
      if (!steps.includes(event.step)) continue;
      counts[event.step] = (counts[event.step] ?? 0) + 1;
    }
    return buildFunnelSummary(counts, { steps, labels, product });
  }
}
