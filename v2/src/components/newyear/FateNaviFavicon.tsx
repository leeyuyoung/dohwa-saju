"use client";

import { useEffect } from "react";

const HREF = "/images/fatenavi4/favicon-premium.png?v=3";
const APPLE = "/FateNavi/apple-icon.png?v=3";

/** 루트 /favicon.ico(도화)가 탭에 남는 걸 FateNavi에서 덮어쓴다. */
export function FateNaviFavicon() {
  useEffect(() => {
    const head = document.head;

    head.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']").forEach((node) => {
      node.parentElement?.removeChild(node);
    });

    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    icon.sizes = "32x32";
    icon.href = HREF;
    head.appendChild(icon);

    const any = document.createElement("link");
    any.rel = "icon";
    any.type = "image/png";
    any.sizes = "any";
    any.href = HREF;
    head.appendChild(any);

    let apple = head.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      head.appendChild(apple);
    }
    apple.href = APPLE;
  }, []);

  return null;
}
