import type { Metadata } from "next";
import { FateNaviHome } from "@/components/newyear/FateNaviHome";
import { themeOf } from "@/lib/constants/fatenaviTheme";

const theme = themeOf("sheep");

export const metadata: Metadata = {
  title: { absolute: theme.orderName },
  description: theme.slogan,
};

export default function FateNavi2Page() {
  return <FateNaviHome theme="sheep" />;
}
