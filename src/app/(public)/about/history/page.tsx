import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { HistoryParagraph } from "@/components/history/history-paragraph";
import { Timeline } from "@/components/history/timeline";
import { historyContent } from "@/content/history";

export const metadata: Metadata = {
  title: historyContent.title,
  description: historyContent.description,
};

export default function HistoryPage() {
  return (
    <>
      <PageHero
        eyebrow="О федерации"
        title={historyContent.title}
        description={historyContent.description}
        trail={[{ label: "О федерации", href: "/about" }, { label: "История" }]}
      />
      <div className="site-container section-space grid items-start gap-12 xl:grid-cols-[minmax(0,4fr)_minmax(0,1fr)] xl:gap-16">
        <article aria-label={historyContent.title} className="min-w-0 max-w-[75ch] space-y-10 text-base leading-8 [overflow-wrap:anywhere] md:space-y-12">
          {historyContent.sections.map((section, index) => (
            <section key={section.title ?? "intro"} aria-labelledby={section.title ? `history-section-${index}` : undefined}>
              {section.title ? (
                <h2 id={`history-section-${index}`} className="heading-section text-balance mb-5 text-[var(--navy-950)]">
                  {section.title}
                </h2>
              ) : null}
              <div className="space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <HistoryParagraph key={paragraph} text={paragraph} />
                ))}
              </div>
            </section>
          ))}
        </article>
        <Timeline />
      </div>
    </>
  );
}
