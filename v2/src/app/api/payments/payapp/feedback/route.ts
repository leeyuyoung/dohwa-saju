import { PaymentError, feedbackFingerprint, handlePayappFeedback } from "@/lib/server/payments";

export const runtime = "nodejs";

/** 페이앱 웹노티. 본문은 반드시 평문 SUCCESS. */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const fields: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") fields[key] = value;
    }
    await handlePayappFeedback(fields);
    console.info(`[payment] payapp feedback ok fp=${feedbackFingerprint(fields)} state=${fields.pay_state ?? ""}`);
    return new Response("SUCCESS", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      console.error("[payment] payapp feedback rejected", error.message);
      return new Response("FAIL", { status: error.status >= 500 ? 500 : 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    console.error("[payment] payapp feedback error", error);
    return new Response("FAIL", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
