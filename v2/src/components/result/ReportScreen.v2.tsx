"use client";

import { PageShell } from "@/components/layout/PageShell";
import { FiveElementsCard } from "@/components/result/FiveElementsCard";
import { ManseryeokTable } from "@/components/result/ManseryeokTable";
import { ReportPortrait } from "@/components/result/ResultParts";
import { Reveal } from "@/components/ui/Reveal";
import type { FullReportViewV2 } from "@/types/result";

/** 유료 리포트 v2 화면. PART 서사 중심, 장표지 스택 없음. */
export function ReportScreenV2({ report }: { report: FullReportViewV2 }) {
  return (
    <PageShell>
      <header className="relative -mx-5 overflow-hidden px-5 pb-14 pt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(156_63_98_/_0.35),transparent_55%),linear-gradient(180deg,rgb(13_11_25)_0%,rgb(7_6_14)_100%)]"
        />
        <div className="relative flex flex-col items-center gap-6 text-center">
          <p className="text-[11px] tracking-[0.28em] text-cinnabar/90">{report.analyzedAt}</p>
          <h1 className="font-eerie text-[clamp(1.9rem,8vw,2.6rem)] leading-tight text-paper">
            {report.name}
            <span className="mt-2 block font-serif text-[1.05rem] font-light tracking-normal text-blossom">의 매력 리포트</span>
          </h1>
          <Reveal duration={1.4}>
            <p className="max-w-md font-serif text-[17px] font-light leading-[1.9] text-paper/95">“{report.intro}”</p>
          </Reveal>
        </div>
      </header>

      <div className="mt-12 flex flex-col gap-20">
        <Reveal>
          <section id="saju-origin" className="scroll-mt-24 flex flex-col gap-8">
            <header className="flex flex-col gap-2">
              <p className="text-[11px] tracking-[0.22em] text-cinnabar">사주 원국</p>
              <h2 className="font-eerie text-[clamp(1.35rem,5vw,1.7rem)] leading-snug text-paper">네가 태어난 순간의 하늘</h2>
            </header>
            <ManseryeokTable
              name={report.name}
              dayPillarName={report.dayPillarName}
              birthLabel={report.birthLabel}
              pillars={report.pillars}
            />
            <FiveElementsCard fiveElements={report.fiveElements} currentLuck={null} />
          </section>
        </Reveal>

        <nav aria-label="목차" className="rounded-3xl border border-line bg-night/70 px-6 py-5">
          <p className="text-xs text-cinnabar">목차</p>
          <ol className="mt-3 flex flex-col">
            {report.parts.map((part) => (
              <li key={part.part} className="border-b border-line/50 py-3 last:border-0">
                <a href={`#part-${part.part}`} className="flex items-baseline gap-3 hover:text-blossom">
                  <span className="w-14 shrink-0 text-xs text-cinnabar/80">PART {part.part}</span>
                  <span className="font-serif text-[15px] break-keep">{part.title}</span>
                </a>
                {part.key === "vibe" && part.keywords ? (
                  <ol className="mt-1.5 flex flex-col gap-1 pl-[4.25rem]">
                    {part.keywords.map((keyword) => (
                      <li key={keyword.name}>
                        <a href={`#part-${part.part}`} className="text-[13px] text-mist hover:text-blossom">
                          {keyword.name}
                        </a>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className="mt-1.5 flex flex-col gap-1 pl-[4.25rem]">
                    {part.sections.map((section, index) => (
                      <li key={section.title}>
                        <a href={`#part-${part.part}-${index + 1}`} className="text-[13px] text-mist hover:text-blossom">
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
            <li className="border-b border-line/50 py-3 last:border-0">
              <a href="#conclusion" className="flex items-baseline gap-3 hover:text-blossom">
                <span className="w-14 shrink-0 text-xs text-cinnabar/80">결론</span>
                <span className="font-serif text-[15px]">당신의 매력은 이런 모습으로 기억됩니다</span>
              </a>
            </li>
          </ol>
        </nav>

        {report.parts.map((part) => (
          <Reveal key={part.part} duration={0.7}>
            <article id={`part-${part.part}`} className="scroll-mt-24 flex flex-col gap-8">
              <header className="flex flex-col gap-3 border-b border-line/70 pb-6">
                <p className="text-[11px] tracking-[0.22em] text-cinnabar">PART {part.part}</p>
                <h2 className="font-eerie text-[clamp(1.45rem,6vw,1.9rem)] leading-snug text-paper break-keep">{part.title}</h2>
                <p className="text-sm text-mist">{part.question}</p>
                <p className="mt-1 font-serif text-[16px] font-light leading-[1.85] text-blossom-glow">{part.headline}</p>
              </header>

              {part.key === "vibe" && part.keywords ? (
                <div className="flex flex-col gap-10">
                  <ReportPortrait portrait={report.portraits.self} />
                  {part.keywords.map((keyword, index) => (
                    <Reveal key={keyword.name} delay={0.08 * index}>
                      <section className="flex flex-col gap-4">
                        <h3 className="font-serif text-[clamp(1.5rem,6vw,1.85rem)] text-blossom">{keyword.name}</h3>
                        <div className="flex flex-col gap-4 font-serif text-[16px] font-light leading-[2] text-paper/90">
                          {keyword.paragraphs.map((paragraph, paragraphIndex) => (
                            <p key={paragraphIndex}>{paragraph}</p>
                          ))}
                        </div>
                      </section>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {part.sections.map((section, index) => (
                    <section key={section.title} id={`part-${part.part}-${index + 1}`} className="scroll-mt-24 flex flex-col gap-4">
                      {part.key === "fate" && index === 0 && (
                        <ReportPortrait portrait={report.portraits.partner} />
                      )}
                      <h3 className="flex items-baseline gap-2 font-serif text-[18px] text-paper break-keep">
                        <span className="shrink-0 text-sm text-cinnabar">
                          {part.part}-{index + 1}
                        </span>
                        {section.title}
                      </h3>
                      {part.key === "charm" && index === 1 && (
                        <p className="rounded-2xl border border-line/80 bg-night/50 px-4 py-3 text-[13px] leading-relaxed text-mist">
                          사화 = 사주의 불 기운. 있으면 존재감이 조금 더 또렷해질 수 있어.
                        </p>
                      )}
                      {part.key === "fate" && index === 1 && (
                        <div className="rounded-2xl border border-cinnabar/35 bg-crimson/10 px-5 py-4">
                          <p className="text-[11px] tracking-[0.18em] text-cinnabar">만남의 시기</p>
                          <div className="mt-3 flex flex-col gap-4 font-serif text-[16px] font-light leading-[2] text-paper/95">
                            {section.paragraphs.map((paragraph, paragraphIndex) => (
                              <p key={paragraphIndex}>{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {!(part.key === "fate" && index === 1) && (
                        <div className="flex flex-col gap-4 font-serif text-[16px] font-light leading-[2] text-paper/90">
                          {section.paragraphs.map((paragraph, paragraphIndex) => (
                            <p key={paragraphIndex}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              )}

              <p className="border-l-2 border-gold/50 pl-4 font-serif text-[16px] font-light leading-[1.85] text-gold-soft">
                {part.closingLine}
              </p>
            </article>
          </Reveal>
        ))}

        <Reveal>
          <section id="conclusion" className="scroll-mt-24 flex flex-col items-center gap-5 px-2 py-10 text-center">
            <p className="text-[11px] tracking-[0.22em] text-cinnabar">최종 결론</p>
            <p className="max-w-md font-serif text-[17px] font-light leading-[1.95] text-paper">{report.conclusion}</p>
          </section>
        </Reveal>

        <p className="pb-8 text-center text-[11px] leading-relaxed text-mist-dim">
          이 리포트는 사주 명리학의 전통적 해석 체계를 바탕으로 한 오락·참고용 콘텐츠이며, 의료·법률·투자 등 전문적인 판단을
          대신하지 않습니다.
        </p>
      </div>
    </PageShell>
  );
}
