import type { Metadata } from "next";
import { themeOf } from "@/lib/constants/fatenaviTheme";

const theme = themeOf("premium");
const title = "프리미엄 종합사주";
const description =
  "타고난 운명부터 재물운, 연애운, 직업운까지 나를 위한 단 하나의 인생 리포트";
const ogImage = {
  url: "/images/fatenavi4/hero-zodiac.jpg",
  width: 1200,
  height: 800,
  alt: title,
} as const;

export const metadata: Metadata = {
  metadataBase: new URL("https://dohwasindang.com"),
  title: {
    default: title,
    template: "%s",
  },
  description,
  openGraph: {
    title,
    description,
    siteName: theme.brand,
    locale: "ko_KR",
    type: "website",
    url: "/FateNavi",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.url],
  },
};

export default function FateNaviLayout({ children }: { children: React.ReactNode }) {
  return children;
}
