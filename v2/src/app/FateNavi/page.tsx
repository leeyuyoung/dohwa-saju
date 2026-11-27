import type { Metadata } from "next";
import { FateNaviHome } from "@/components/newyear/FateNaviHome";

export const metadata: Metadata = {
  title: { absolute: "프리미엄 종합사주" },
  description:
    "타고난 운명부터 재물운, 연애운, 직업운까지 나를 위한 단 하나의 인생 리포트",
};

export default function FateNaviPage() {
  return <FateNaviHome theme="premium" />;
}
