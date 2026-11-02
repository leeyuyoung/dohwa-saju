"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { OrnateCtaSurface } from "./OrnateCta";

type Props = { children: ReactNode } & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

/**
 * 화면의 마무리를 맡는 큰 CTA.
 * 장식 프레임 외곽선 위에 고딕 글씨를 올리고, 은은한 후광만 남긴다.
 */
export function MythicButtonLink({ href, onClick, children }: Props) {
  const still = !!useReducedMotion();

  const surface = <OrnateCtaSurface>{children}</OrnateCtaSurface>;

  return (
    <div className="relative w-full">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(232_137_155_/_0.28),transparent)] blur-2xl"
        animate={still ? undefined : { opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {href !== undefined ? (
        <Link href={href} className="relative z-10 block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50">
          {surface}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="relative z-10 block w-full cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
        >
          {surface}
        </button>
      )}
    </div>
  );
}
