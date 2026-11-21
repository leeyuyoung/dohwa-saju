"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** 정보입력 CTA를 .ny 루트에 붙여 인트로처럼 뷰포트 하단에 고정 */
export function StickyFormCta({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<Element | null>(null);

  useEffect(() => {
    setHost(document.querySelector(".ny"));
  }, []);

  if (!host) return null;
  return createPortal(<div className="ny-sticky-cta">{children}</div>, host);
}
