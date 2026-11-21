import Link from "next/link";
import type { ReactNode } from "react";
import { type FateNaviThemeId, themeOf } from "@/lib/constants/fatenaviTheme";
import { NEWYEAR_LEGAL_LINKS } from "@/lib/constants/legal";
import "./newyear.css";
import "./fatenavi2.css";
import "./fatenavi3.css";
import "./fatenavi4.css";

export function NewYearShell({
  children,
  showHeader = true,
  showFooter = false,
  stickyCta,
  /** ink: 입력 화면용 순흑 배경. sheep/hanji/premium은 테마 CSS가 덮는다. */
  tone = "navy",
  theme = "hanji",
}: {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  stickyCta?: ReactNode;
  tone?: "navy" | "ink";
  theme?: FateNaviThemeId;
}) {
  const config = themeOf(theme);
  return (
    <div className={`ny${tone === "ink" ? " ny-ink" : ""} ${config.shellClass}`.trim()}>
      <div className="ny-frame">
        {showHeader && (
          <header className="ny-header">
            <Link href={config.basePath} className="ny-brand">
              {theme === "hanji" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/images/fatenavi3/brand-logo.png?v=5"
                  alt={config.brand}
                  className="ny-brand-logo"
                />
              ) : (
                config.brand
              )}
            </Link>
          </header>
        )}
        <main className="ny-main">{children}</main>
        {showFooter && (
          <footer className="ny-footer ny-caption text-center">
            <p>본 풀이는 명리학에 바탕한 참고용 콘텐츠이며, 의료·법률·투자 판단을 대신하지 않습니다.</p>
            <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              {NEWYEAR_LEGAL_LINKS.map((link, index) => (
                <span key={link.href} className="inline-flex items-center gap-x-2">
                  {index > 0 && <span aria-hidden>·</span>}
                  <Link href={link.href} className="underline-offset-2 hover:underline">
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>
          </footer>
        )}
        {stickyCta ? <div className="ny-sticky-cta">{stickyCta}</div> : null}
      </div>
    </div>
  );
}
