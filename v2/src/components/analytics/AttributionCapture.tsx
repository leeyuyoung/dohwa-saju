"use client";

import { useEffect } from "react";
import { captureAttributionFromLocation } from "@/lib/client/attribution";

/** 첫 방문 URL의 UTM을 localStorage에 남긴다. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttributionFromLocation();
  }, []);
  return null;
}
