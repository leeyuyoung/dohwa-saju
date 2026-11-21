import Link from "next/link";
import type { ReactNode } from "react";

export function SampleCard({
  children,
  href,
  cta,
}: {
  children: ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <div className="ny-sample">
      <div className="ny-sample-inner">{children}</div>
      <div className="ny-sample-fade" aria-hidden />
      <Link href={href} className="ny-btn ny-sample-cta">
        {cta}
      </Link>
    </div>
  );
}
