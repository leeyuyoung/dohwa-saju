import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { NewYearShell } from "@/components/newyear/NewYearShell";
import type { FateNaviThemeId } from "@/lib/constants/fatenaviTheme";
import { LEGAL_LINKS } from "@/lib/constants/legal";

export function LegalDoc({
  title,
  children,
  brand = "dohwa",
  theme = "hanji",
  links = LEGAL_LINKS,
}: {
  title: string;
  children: ReactNode;
  brand?: "dohwa" | "newyear";
  /** FateNavi 셸 테마. brand=newyear일 때만 사용. */
  theme?: FateNaviThemeId;
  links?: readonly { href: string; label: string }[];
}) {
  const isPremium = brand === "newyear" && theme === "premium";

  const article = isPremium ? (
    <article className="ny-legal-doc">
      <header className="ny-legal-doc-header">
        <p className="ny-legal-doc-kicker">LEGAL</p>
        <h1 className="ny-legal-doc-title">{title}</h1>
      </header>
      <div className="ny-legal-doc-body">{children}</div>
      <nav className="ny-legal-doc-nav" aria-label="약관 바로가기">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </article>
  ) : (
    <article className="flex flex-col gap-8 py-10 pb-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs tracking-[0.16em] text-cinnabar">LEGAL</p>
        <h1 className="font-eerie text-[28px] leading-snug text-paper">{title}</h1>
      </header>
      <div className="flex flex-col gap-8 text-[14px] leading-[1.85] text-mist">{children}</div>
      <nav className="flex flex-wrap gap-x-3 gap-y-2 border-t border-line/60 pt-6 text-xs text-mist-dim">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="underline-offset-2 hover:text-mist hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </article>
  );

  if (brand === "newyear") {
    return (
      <NewYearShell theme={theme} tone={isPremium ? "ink" : "navy"} showFooter={false}>
        {article}
      </NewYearShell>
    );
  }

  return (
    <PageShell background="navy" brand={brand}>
      {article}
    </PageShell>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ny-legal-section flex flex-col gap-2.5">
      <h2 className="ny-legal-section-title font-serif text-[16px] text-gold-soft">{title}</h2>
      <div className="ny-legal-section-body flex flex-col gap-2">{children}</div>
    </section>
  );
}
