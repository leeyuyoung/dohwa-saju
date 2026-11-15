import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/constants/legal";
import { SERVICE } from "@/lib/constants/service";

type SiteFooterProps = {
  compact?: boolean;
  /** false면 태그라인(숨겨진 색기력… | 도화신당)을 숨긴다. 인트로용. */
  showBrandLine?: boolean;
};

/** 사업자·약관·개인정보·환불 링크. 인트로 하단과 공통 페이지 푸터에서 쓴다. */
export function SiteFooter({ compact = false, showBrandLine = true }: SiteFooterProps) {
  return (
    <footer className={`border-t border-line/50 ${compact ? "mt-3" : "mt-12"}`}>
      <div
        className={`mx-auto flex max-w-xl flex-col gap-3 px-5 pb-6 text-xs leading-relaxed text-mist-dim ${
          compact ? "pt-4" : "pt-8"
        }`}
      >
        {showBrandLine && (
          <p className="font-serif tracking-[0.2em] text-mist">
            {SERVICE.tagline} | {SERVICE.name}
          </p>
        )}
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
