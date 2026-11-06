import Link from "next/link";
import type { ReactNode } from "react";
import { NightGardenBackground } from "@/components/night/NightGardenBackground";
import { LEGAL_LINKS } from "@/lib/constants/legal";
import { SERVICE } from "@/lib/constants/service";

type PageShellProps = {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  /** 소개 화면처럼 분위기를 더 강하게 보여줄 때 full */
  intensity?: "full" | "soft";
  /** garden: 도화 정원, navy: 법률 문서용 짙은 네이비 단색 */
  background?: "garden" | "navy";
  /** 화면 아래에 떠 있는 버튼이 있으면 맨 끝 내용이 가리지 않게 그만큼 비워 둔다 */
  withStickyBar?: boolean;
};

export function PageShell({
  children,
  showHeader = true,
  showFooter = true,
  intensity = "soft",
  background = "garden",
  withStickyBar = false,
}: PageShellProps) {
  return (
    <div className={`relative isolate flex min-h-dvh flex-col ${withStickyBar ? "pb-34" : ""}`}>
      {background === "navy" ? <NavyDocumentBackground /> : <NightGardenBackground intensity={intensity} />}
      {showHeader && (
        <header
          className={`sticky top-0 z-30 border-b border-line/50 backdrop-blur-md ${
            background === "navy" ? "bg-[#0a1220]/90" : "bg-ink/60"
          }`}
        >
          <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-5">
            <Link href="/">
              <span className="font-serif text-[15px] tracking-[0.2em] text-gold-soft">{SERVICE.name}</span>
            </Link>
          </div>
        </header>
      )}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5">{children}</main>
      {showFooter && <SiteFooter compact={withStickyBar} />}
    </div>
  );
}

function NavyDocumentBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: "linear-gradient(180deg, #0a1220 0%, #0c1526 50%, #09101c 100%)",
      }}
    />
  );
}

function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`border-t border-line/50 ${compact ? "mt-3" : "mt-12"}`}>
      <div
        className={`mx-auto flex max-w-xl flex-col gap-3 px-5 pb-6 text-xs leading-relaxed text-mist-dim ${
          compact ? "pt-4" : "pt-8"
        }`}
      >
        <p className="font-serif tracking-[0.2em] text-mist">
          {SERVICE.tagline} | {SERVICE.name}
        </p>
        <p>
          본 서비스의 해석은 사주 명리학의 전통적 해석 체계를 바탕으로 한 참고용 콘텐츠이며, 의료·법률·투자 등
          전문적인 판단을 대신하지 않습니다.
        </p>
        <nav className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {LEGAL_LINKS.map((link, index) => (
            <span key={link.href} className="inline-flex items-center gap-x-1.5">
              {index > 0 && <span aria-hidden>·</span>}
              <Link href={link.href} className="underline-offset-2 hover:text-mist hover:underline">
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
