"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** 뷰포트에 이만큼 들어와야 떠오른다. 목차처럼 하나씩 띄울 때 키운다. */
  amount?: number | "some" | "all";
  /** 떠오르는 데 걸리는 시간(초). 기본 1.2 */
  duration?: number;
};

export function Reveal({ children, delay = 0, className, amount, duration = 1.2 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: amount ?? 0.2, margin: amount ? "0px 0px -18% 0px" : "-60px" }}
      transition={{ duration, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
