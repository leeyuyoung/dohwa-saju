import type { Metadata } from "next";
import { themeOf } from "@/lib/constants/fatenaviTheme";

const theme = themeOf("hanji");

export const metadata: Metadata = {
  title: {
    default: `${theme.orderName} · 한지`,
    template: "%s",
  },
};

export default function FateNavi3Layout({ children }: { children: React.ReactNode }) {
  return children;
}
