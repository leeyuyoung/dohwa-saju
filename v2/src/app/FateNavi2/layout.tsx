import type { Metadata } from "next";
import { themeOf } from "@/lib/constants/fatenaviTheme";

const theme = themeOf("hanji");

export const metadata: Metadata = {
  title: {
    default: theme.orderName,
    template: "%s",
  },
};

export default function FateNavi2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
