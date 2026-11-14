import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Noto_Sans_KR, Noto_Serif_KR, Song_Myung } from "next/font/google";
import localFont from "next/font/local";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import { KarrotPixel } from "@/components/analytics/KarrotPixel";
import { MetaPixelPageView } from "@/components/analytics/MetaPixel";
import { META_PIXEL_ID } from "@/lib/constants/meta";
import { SERVICE } from "@/lib/constants/service";
import "./globals.css";

const META_PIXEL_SCRIPT = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
`;

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  preload: false,
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  preload: false,
});

const classicKr = Song_Myung({
  variable: "--font-classic-kr",
  weight: "400",
});

/** 클로바 나눔손글씨 성실체(OFL, 라이선스는 fonts/OFL.txt). 예약 글꼴명 조항 때문에 글자를 덜어 내지 않고 원본 그대로 쓴다. */
const handwriting = localFont({
  src: "./fonts/NanumSeongSirCe.woff2",
  variable: "--font-handwriting",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `숨겨진 도화력 분석 | ${SERVICE.name}`,
    template: `%s | ${SERVICE.name}`,
  },
  description: SERVICE.description,
  openGraph: {
    title: `숨겨진 도화력 분석 | ${SERVICE.name}`,
    description: SERVICE.description,
    siteName: SERVICE.name,
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07060e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${notoSansKr.variable} ${classicKr.variable} ${handwriting.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        {/* Meta Pixel Code — head 안에 설치 (메타 가이드와 동일) */}
        <script dangerouslySetInnerHTML={{ __html: META_PIXEL_SCRIPT }} />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height={1}
            width={1}
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="min-h-full flex flex-col">
        <MetaPixelPageView />
        <KarrotPixel />
        <AttributionCapture />
        {children}
      </body>
    </html>
  );
}
