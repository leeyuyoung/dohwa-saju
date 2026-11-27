import type { Metadata } from "next";
import { FateNaviHome } from "@/components/newyear/FateNaviHome";
import { themeOf } from "@/lib/constants/fatenaviTheme";

const theme = themeOf("premium");

export const metadata: Metadata = {
  title: { absolute: `${theme.orderName} · 프리미엄` },
  description: theme.slogan,
};

export default function FateNaviPage() {
  return <FateNaviHome theme="premium" />;
}
