import { NEWYEAR_BRAND, NEWYEAR_RESULT_TITLE } from "@/lib/constants/newyear";
import type { NewYearReportView } from "@/lib/server/newyearView";

function Chapter({ title, headline, paragraphs }: { title: string; headline: string; paragraphs: string[] }) {
  return (
    <section className="ny-card flex flex-col gap-3">
      <h2 className="ny-sub">{title}</h2>
      <p className="text-[15px] font-medium" style={{ color: "var(--ny-seal)" }}>
        {headline}
      </p>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="ny-body">
          {paragraph}
        </p>
      ))}
    </section>
  );
}

function Fold({ title, headline, paragraphs }: { title: string; headline: string; paragraphs: string[] }) {
  return (
    <details className="ny-fold">
      <summary>{title}</summary>
      <div className="ny-fold-body">
        <p className="text-[15px] font-medium" style={{ color: "var(--ny-seal)" }}>
          {headline}
        </p>
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="ny-body mt-2">
            {paragraph}
          </p>
        ))}
      </div>
    </details>
  );
}

export function NewYearReportScreen({ report }: { report: NewYearReportView }) {
  const guide = report.chapters[report.chapters.length - 1];
  const main = report.chapters.slice(0, -1);
  return (
    <article className="ny-stack">
      <header className="flex flex-col gap-3">
        <p className="ny-en">{NEWYEAR_BRAND}</p>
        <h1 className="ny-title">{NEWYEAR_RESULT_TITLE(report.name)}</h1>
        <p className="ny-caption">
          {report.dayPillarName} · {report.birthLabel}
        </p>
        <p className="ny-body">{report.intro}</p>
      </header>

      {main.map((chapter) => (
        <Chapter key={chapter.title} title={chapter.title} headline={chapter.headline} paragraphs={chapter.paragraphs} />
      ))}

      <section>
        <h2 className="ny-sub mb-2">앞으로의 연도별 경로</h2>
        {report.years.map((year) => (
          <Fold key={year.label} title={year.label} headline={year.headline} paragraphs={year.paragraphs} />
        ))}
      </section>

      <section>
        <h2 className="ny-sub mb-2">올해 월별 우회로</h2>
        {report.months.map((month) => (
          <Fold key={month.label} title={month.label} headline={month.headline} paragraphs={month.paragraphs} />
        ))}
      </section>

      {guide && <Chapter title={guide.title} headline={guide.headline} paragraphs={guide.paragraphs} />}

      <p className="ny-body">{report.closing}</p>
    </article>
  );
}
