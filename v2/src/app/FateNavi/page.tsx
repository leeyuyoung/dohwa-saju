import type { Metadata } from "next";
import { FateNaviHome } from "@/components/newyear/FateNaviHome";
import { themeOf } from "@/lib/constants/fatenaviTheme";

const theme = themeOf("navi");

export const metadata: Metadata = {
  title: { absolute: theme.orderName },
  description: theme.slogan,
};

export default function FateNaviPage() {
  return <FateNaviHome theme="navi" />;
}
