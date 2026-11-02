"use client";

import { useEffect } from "react";
import { trackFunnel } from "@/lib/client/funnel";
import type { FunnelStep } from "@/lib/funnelSteps";

/** 서버 페이지에 심어 마운트 시 한 번 퍼널 단계를 기록한다. */
export function FunnelBeacon({ step, token }: { step: FunnelStep; token?: string | null }) {
  useEffect(() => {
    trackFunnel(step, token);
  }, [step, token]);
  return null;
}
