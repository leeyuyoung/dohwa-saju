/** 광고 유입(UTM) 첫 터치 보관. 결제·제출 때까지 따라간다. */

const STORAGE_KEY = "dohwa-attribution:v1";
const MAX_LEN = 120;

export type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  /** 처음 들어온 path+search (짧게) */
  landing: string | null;
  capturedAt: number;
};

function clip(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, MAX_LEN);
  return trimmed.length > 0 ? trimmed : null;
}

function readStored(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.capturedAt !== "number") return null;
    return {
      utmSource: typeof parsed.utmSource === "string" ? parsed.utmSource : null,
      utmMedium: typeof parsed.utmMedium === "string" ? parsed.utmMedium : null,
      utmCampaign: typeof parsed.utmCampaign === "string" ? parsed.utmCampaign : null,
      utmContent: typeof parsed.utmContent === "string" ? parsed.utmContent : null,
      utmTerm: typeof parsed.utmTerm === "string" ? parsed.utmTerm : null,
      landing: typeof parsed.landing === "string" ? parsed.landing : null,
      capturedAt: parsed.capturedAt,
    };
  } catch {
    return null;
  }
}

function writeStored(value: Attribution) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // 저장 실패해도 사용자 흐름은 막지 않는다.
  }
}

function fromSearch(search: string): Omit<Attribution, "capturedAt" | "landing"> | null {
  const params = new URLSearchParams(search);
  const utmSource = clip(params.get("utm_source"));
  const utmMedium = clip(params.get("utm_medium"));
  const utmCampaign = clip(params.get("utm_campaign"));
  const utmContent = clip(params.get("utm_content"));
  const utmTerm = clip(params.get("utm_term"));
  if (!utmSource && !utmMedium && !utmCampaign && !utmContent && !utmTerm) return null;
  return { utmSource, utmMedium, utmCampaign, utmContent, utmTerm };
}

/** URL에 UTM이 있고 아직 첫 터치가 없으면 저장한다. */
export function captureAttributionFromLocation() {
  if (typeof window === "undefined") return;
  const fromUrl = fromSearch(window.location.search);
  if (!fromUrl) return;
  if (readStored()) return;
  const landing = clip(`${window.location.pathname}${window.location.search}`.slice(0, MAX_LEN));
  writeStored({ ...fromUrl, landing, capturedAt: Date.now() });
}

/** 제출·결제 시 서버로 보낼 값. 없으면 null. */
export function getStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  return readStored();
}

/** 관리자/로그용 한 줄. */
export function formatAttribution(attribution: Attribution | null | undefined): string {
  if (!attribution) return "—";
  const parts = [attribution.utmSource, attribution.utmCampaign, attribution.utmContent].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}
