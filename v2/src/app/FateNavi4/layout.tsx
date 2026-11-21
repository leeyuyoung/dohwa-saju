import type { Metadata } from "next";
import { themeOf } from "@/lib/constants/fatenaviTheme";

const theme = themeOf("premium");

export const metadata: Metadata = {
  title: {
    default: `${theme.orderName} · 프리미엄`,
    template: "%s",
  },
};

export default function FateNavi4Layout({ children }: { children: React.ReactNode }) {
  return children;
}
