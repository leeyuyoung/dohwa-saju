import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LEGAL_LINKS } from "@/lib/constants/legal";

export function LegalDoc({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <PageShell background="navy">
      <article className="flex flex-col gap-8 py-10 pb-16">
        <header className="flex flex-col gap-3">
          <p className="text-xs tracking-[0.16em] text-cinnabar">LEGAL</p>
          <h1 className="font-eerie text-[28px] leading-snug text-paper">{title}</h1>
        </header>
        <div className="flex flex-col gap-8 text-[14px] leading-[1.85] text-mist">{children}</div>
        <nav className="flex flex-wrap gap-x-3 gap-y-2 border-t border-line/60 pt-6 text-xs text-mist-dim">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="underline-offset-2 hover:text-mist hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </article>
    </PageShell>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="font-serif text-[16px] text-gold-soft">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
