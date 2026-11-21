import type { Metadata } from "next";
import { NEWYEAR_ORDER_NAME } from "@/lib/constants/newyear";

export const metadata: Metadata = {
  title: {
    default: NEWYEAR_ORDER_NAME,
    template: "%s",
  },
};

export default function NewYearLayout({ children }: { children: React.ReactNode }) {
  return children;
}
