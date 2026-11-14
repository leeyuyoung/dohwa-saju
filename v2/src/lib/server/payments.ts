import "server-only";

import { createHash, randomBytes } from "node:crypto";
import {
  DETAILED_REPORT_ALLOWED_AMOUNTS,
  DETAILED_REPORT_ORDER_NAME,
  reportCheckoutAmount,
} from "@/lib/constants/service";
import { markAnalysisPaid, revokeAnalysisPaid } from "./analysis";
import { sendMetaPurchaseEvent } from "./metaCapi";
import { getAnalysisStore, type OrderMetaClick, type OrderRecord } from "./store";

const PAYAPP_API = "https://api.payapp.kr/oapi/v2";
const REQUEST_TIMEOUT_MS = 30_000;
/** 하루 지난 대기 주문은 다시 쓰일 일이 없다. */
const STALE_ORDER_MS = 24 * 60 * 60 * 1000;

export const ORDER_NAME = DETAILED_REPORT_ORDER_NAME;
export const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

/** 결제 완료(4). 그 외 취소·대기 등은 문서 기준. */
const PAY_STATE_PAID = "4";
const PAY_STATE_REQUEST = "1";
const PAY_STATE_CANCEL = new Set(["8", "9", "32", "64"]);

export class PaymentError extends Error {
  constructor(
    readonly status: number,
    readonly userMessage: string,
    detail?: string,
    readonly retryable = false,
  ) {
    super(`[payment] ${detail ?? userMessage}`);
    this.name = "PaymentError";
  }
}

function payappUserId() {
  const userid = process.env.PAYAPP_USERID?.trim();
  if (!userid) throw new PaymentError(500, "결제 설정에 문제가 있습니다.", "PAYAPP_USERID missing");
  return userid;
}

function payappLinkKey() {
  const key = process.env.PAYAPP_LINKKEY?.trim();
  if (!key) throw new PaymentError(500, "결제 설정에 문제가 있습니다.", "PAYAPP_LINKKEY missing");
  return key;
}

function payappLinkVal() {
  const val = process.env.PAYAPP_LINKVAL?.trim();
  if (!val) throw new PaymentError(500, "결제 설정에 문제가 있습니다.", "PAYAPP_LINKVAL missing");
  return val;
}

function appBaseUrl() {
  const url = process.env.APP_URL?.replace(/\/+$/, "");
  if (!url) throw new PaymentError(500, "결제 설정에 문제가 있습니다.", "APP_URL missing");
  return url;
}

export function isPayappConfigured() {
  return Boolean(
    process.env.PAYAPP_USERID?.trim() &&
      process.env.PAYAPP_LINKKEY?.trim() &&
      process.env.PAYAPP_LINKVAL?.trim() &&
      process.env.APP_URL?.trim(),
  );
}

function parseFormBody(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of text.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const rawKey = eq === -1 ? part : part.slice(0, eq);
    const rawVal = eq === -1 ? "" : part.slice(eq + 1);
    out[decodeURIComponent(rawKey.replace(/\+/g, " "))] = decodeURIComponent(rawVal.replace(/\+/g, " "));
  }
  return out;
}

async function callPayapp(fields: Record<string, string>) {
  const body = new URLSearchParams(fields);
  try {
    const response = await fetch(PAYAPP_API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const text = await response.text();
    const parsed = parseFormBody(text);
    return { ok: response.ok, status: response.status, parsed, raw: text };
  } catch (error) {
    throw new PaymentError(502, "결제사와 통신하지 못했습니다. 잠시 후 다시 시도해주세요.", String(error), true);
  }
}

export type CreatePayappOrderResult = {
  order: OrderRecord;
  payurl: string;
  mulNo: string;
};

/**
 * 주문을 만들고 페이앱 결제 URL을 받는다.
 * var1=orderId, var2=token 으로 웹훅에서 주문을 찾는다.
 */
export async function createPayappOrder(
  token: string,
  email: string,
  phone: string,
  marketingOptIn = false,
  couponApplied = false,
  metaClick: OrderMetaClick | null = null,
): Promise<CreatePayappOrderResult> {
  const store = getAnalysisStore();
  const record = await store.get(token);
  if (!record) throw new PaymentError(404, "결제할 리포트를 찾지 못했습니다.");
  if (record.paidAt !== null) throw new PaymentError(409, "이미 결제가 완료된 리포트입니다.");
  if (record.email !== email || record.phone !== phone || record.marketingOptIn !== marketingOptIn) {
    await store.update(token, { email, phone, marketingOptIn });
  }

  const amount = reportCheckoutAmount(couponApplied);
  if (!(DETAILED_REPORT_ALLOWED_AMOUNTS as readonly number[]).includes(amount)) {
    throw new PaymentError(400, "결제 금액이 올바르지 않습니다.", `amount not allowed: ${amount}`);
  }

  const now = Date.now();
  await store.deleteStalePendingOrders(now - STALE_ORDER_MS).catch((error) => {
    console.error("[payment] stale order cleanup failed", error);
  });

  const orderId = `dohwa_${randomBytes(16).toString("base64url")}`;
  const order: OrderRecord = {
    orderId,
    token,
    amount,
    status: "pending",
    paymentKey: null,
    method: null,
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
    metaClick,
  };
  await store.createOrder(order);

  const base = appBaseUrl();
  const feedbackurl = `${base}/api/payments/payapp/feedback`;
  const returnurl = `${base}/payment/return?token=${encodeURIComponent(token)}&orderId=${encodeURIComponent(orderId)}`;

  const pay = await callPayapp({
    cmd: "payrequest",
    userid: payappUserId(),
    goodname: ORDER_NAME,
    price: String(amount),
    recvphone: phone,
    smsuse: "n",
    reqaddr: "0",
    feedbackurl,
    checkretry: "y",
    returnurl,
    var1: orderId,
    var2: token,
    charset: "utf-8",
    openpaytype: "card,kakaopay,naverpay",
    redirectpay: "1",
  });

  if (pay.parsed.state !== "1" || !pay.parsed.payurl || !pay.parsed.mul_no) {
    console.error("[payment] payapp payrequest failed", pay.raw.slice(0, 500));
    throw new PaymentError(
      502,
      pay.parsed.errorMessage || "결제창을 열지 못했습니다. 잠시 후 다시 시도해주세요.",
      `payapp state=${pay.parsed.state} errno=${pay.parsed.errorCode ?? ""}`,
      true,
    );
  }

  await store.updateOrder(orderId, { paymentKey: pay.parsed.mul_no });
  return {
    order: { ...order, paymentKey: pay.parsed.mul_no, updatedAt: Date.now() },
    payurl: pay.parsed.payurl,
    mulNo: pay.parsed.mul_no,
  };
}

/** 결제 확정 시 퍼널 paid를 서버에서 찍는다. 탭을 닫아도 누락되지 않게 한다. */
async function trackPaidFunnel(token: string, orderId: string, at = Date.now()) {
  const store = getAnalysisStore();
  try {
    if (await store.hasFunnelStepForToken("paid", token)) return;
    const sessionId = (await store.findFunnelSessionForToken(token)) ?? `pay_${orderId}`;
    await store.trackFunnelEvent({ sessionId, step: "paid", token, at });
  } catch (error) {
    console.error("[funnel] paid track failed", error);
  }
}

async function completePaidOrder(order: OrderRecord, mulNo: string, method: string | null) {
  const store = getAnalysisStore();
  const approvedAt = Date.now();
  await store.updateOrder(order.orderId, {
    status: "paid",
    paymentKey: mulNo,
    method,
    approvedAt,
  });
  await markAnalysisPaid(order.token);
  await trackPaidFunnel(order.token, order.orderId, approvedAt);

  // 픽셀과 같은 event_id(주문번호)로 CAPI Purchase를 보낸다. 실패해도 결제는 유지한다.
  const record = await store.get(order.token).catch(() => null);
  const base = process.env.APP_URL?.replace(/\/+$/, "") ?? "";
  void sendMetaPurchaseEvent({
    orderId: order.orderId,
    value: order.amount,
    eventTimeSec: Math.floor(approvedAt / 1000),
    eventSourceUrl: base
      ? `${base}/payment/return?token=${encodeURIComponent(order.token)}&orderId=${encodeURIComponent(order.orderId)}`
      : undefined,
    email: record?.email ?? null,
    phone: record?.phone ?? null,
    externalId: order.token,
    metaClick: order.metaClick,
  });
}

/**
 * 페이앱 feedbackurl 본문을 검증하고 주문 상태를 맞춘다.
 * 응답 본문은 반드시 평문 SUCCESS 여야 한다.
 */
export async function handlePayappFeedback(fields: Record<string, string>): Promise<"ok" | "ignore"> {
  const userid = fields.userid ?? "";
  const linkkey = fields.linkkey ?? "";
  const linkval = fields.linkval ?? "";
  const payState = fields.pay_state ?? "";
  const price = fields.price ?? "";
  const orderId = fields.var1 ?? "";
  const mulNo = fields.mul_no ?? "";

  if (userid !== payappUserId() || linkkey !== payappLinkKey() || linkval !== payappLinkVal()) {
    console.error("[payment] payapp feedback auth mismatch");
    throw new PaymentError(403, "결제 통보 검증에 실패했습니다.", "linkkey/linkval mismatch");
  }

  // 결제 진행을 위해 요청 상태에도 SUCCESS를 돌려준다.
  if (payState === PAY_STATE_REQUEST) return "ok";

  if (!ORDER_ID_PATTERN.test(orderId) || !mulNo) return "ignore";

  const store = getAnalysisStore();
  const order = await store.getOrder(orderId);
  if (!order) {
    console.error(`[payment] payapp feedback unknown order ${orderId}`);
    return "ignore";
  }

  if (String(order.amount) !== String(price)) {
    console.error(`[payment] payapp price mismatch order=${order.amount} feedback=${price}`);
    throw new PaymentError(400, "결제 금액이 일치하지 않습니다.", "price mismatch");
  }

  if (payState === PAY_STATE_PAID) {
    if (order.status === "paid") {
      await markAnalysisPaid(order.token);
      await trackPaidFunnel(order.token, order.orderId, order.approvedAt ?? Date.now());
      return "ok";
    }
    if (order.status === "canceled") return "ignore";
    const method = fields.pay_type ? `payapp:${fields.pay_type}` : "payapp";
    await completePaidOrder(order, mulNo, method);
    return "ok";
  }

  if (PAY_STATE_CANCEL.has(payState)) {
    if (order.status === "paid" && (order.paymentKey === mulNo || !order.paymentKey)) {
      await store.updateOrder(order.orderId, { status: "canceled" });
      await revokeAnalysisPaid(order.token);
      console.info(`[payment] order ${order.orderId} canceled via payapp state=${payState}`);
    }
    return "ok";
  }

  return "ok";
}

/** 레거시 토스 성공 URL 검증용. */
export const PAYMENT_KEY_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;

/** 디버그·감사 로그용. 민감값은 넣지 않는다. */
export function feedbackFingerprint(fields: Record<string, string>) {
  const seed = `${fields.var1 ?? ""}|${fields.mul_no ?? ""}|${fields.pay_state ?? ""}|${fields.price ?? ""}`;
  return createHash("sha256").update(seed).digest("hex").slice(0, 12);
}
