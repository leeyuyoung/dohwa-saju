import "server-only";

import { createHash } from "node:crypto";
import { META_PIXEL_ID } from "@/lib/constants/meta";
import type { OrderMetaClick } from "@/lib/server/store/types";

const GRAPH_VERSION = process.env.META_CAPI_API_VERSION?.trim() || "v21.0";
const REQUEST_TIMEOUT_MS = 8_000;

export type MetaPurchasePayload = {
  orderId: string;
  value: number;
  currency?: string;
  eventTimeSec?: number;
  eventSourceUrl?: string;
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  metaClick?: OrderMetaClick | null;
};

function accessToken() {
  return process.env.META_CAPI_ACCESS_TOKEN?.trim() || "";
}

export function isMetaCapiConfigured() {
  return Boolean(accessToken());
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** 숫자만 남기고, 국내 0으로 시작하면 국가코드 82를 붙인다. */
function normalizePhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `82${digits.slice(1)}`;
  return digits;
}

function hashed(value: string | null | undefined, normalizer: (raw: string) => string): string[] | undefined {
  if (!value?.trim()) return undefined;
  return [sha256Hex(normalizer(value))];
}

/**
 * Conversions API로 Purchase를 보낸다.
 * event_id는 픽셀 eventID와 같은 주문번호여야 중복 제거된다.
 * 토큰이 없으면 no-op. 실패해도 결제를 막지 않는다.
 */
export async function sendMetaPurchaseEvent(payload: MetaPurchasePayload): Promise<void> {
  const token = accessToken();
  if (!token) return;

  const pixelId = process.env.META_PIXEL_ID?.trim() || META_PIXEL_ID;
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  const click = payload.metaClick ?? null;

  const userData: Record<string, unknown> = {};
  const em = hashed(payload.email, normalizeEmail);
  const ph = hashed(payload.phone, normalizePhone);
  const externalId = hashed(payload.externalId, (value) => value.trim());
  if (em) userData.em = em;
  if (ph) userData.ph = ph;
  if (externalId) userData.external_id = externalId;
  if (click?.clientIp) userData.client_ip_address = click.clientIp;
  if (click?.userAgent) userData.client_user_agent = click.userAgent;
  if (click?.fbp) userData.fbp = click.fbp;
  if (click?.fbc) userData.fbc = click.fbc;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: payload.eventTimeSec ?? Math.floor(Date.now() / 1000),
        event_id: payload.orderId,
        action_source: "website",
        ...(payload.eventSourceUrl ? { event_source_url: payload.eventSourceUrl } : {}),
        user_data: userData,
        custom_data: {
          currency: payload.currency ?? "KRW",
          value: payload.value,
          order_id: payload.orderId,
          content_type: "product",
        },
      },
    ],
  };
  if (testCode) body.test_event_code = testCode;

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[meta-capi] Purchase failed", response.status, text.slice(0, 300));
      return;
    }
    console.info(`[meta-capi] Purchase ok order=${payload.orderId}`);
  } catch (error) {
    console.error("[meta-capi] Purchase network error", error);
  }
}
