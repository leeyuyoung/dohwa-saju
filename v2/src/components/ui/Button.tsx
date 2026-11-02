import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { OrnateCtaSurface } from "./OrnateCta";

type Variant = "primary" | "ghost" | "light";

const GHOST =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-line bg-ink/40 px-8 font-gothic text-[15px] tracking-[-0.01em] text-mist backdrop-blur-sm transition-all duration-500 hover:border-gold/40 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-40";

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

/** primary·light는 장식 프레임 CTA, ghost만 가벼운 보조 버튼이다다. */
export function Button({ variant = "primary", className, children, disabled, type = "button", ...props }: ButtonProps) {
  if (variant === "ghost") {
    return (
      <button type={type} disabled={disabled} className={`${GHOST} ${className ?? ""}`} {...props}>
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`block w-full cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:cursor-not-allowed disabled:opacity-40 ${className ?? ""}`}
      {...props}
    >
      <OrnateCtaSurface>{children}</OrnateCtaSurface>
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ href, variant = "primary", className, children }: ButtonLinkProps) {
  if (variant === "ghost") {
    return (
      <Link href={href} className={`${GHOST} ${className ?? ""}`}>
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${className ?? ""}`}
    >
      <OrnateCtaSurface>{children}</OrnateCtaSurface>
    </Link>
  );
}
