import { HistoryParagraph } from "@/components/history/history-paragraph";
import { historyContent } from "@/content/history";
import { cn } from "@/lib/utils";

export function Timeline() {
  return (
    <aside aria-labelledby="history-timeline-title" className="min-w-0 border-t border-[var(--border)] pt-10 xl:border-0 xl:pt-0">
      <h2 id="history-timeline-title" className="heading-section text-balance mb-8 text-[var(--navy-950)]">
        {historyContent.timelineTitle}
      </h2>
      <ol className="ml-2 border-l border-[var(--border)]">
        {historyContent.timeline.map((entry) => (
          <li key={entry.year} className="relative pb-9 pl-7 last:pb-0">
            <span aria-hidden="true" className={cn(
              "absolute -left-[5px] top-3 size-[9px] rounded-full bg-[var(--blue-700)] ring-4 ring-white",
              entry.highlight && "-left-[7px] size-[13px] bg-[var(--red-700)]",
            )} />
            <h3 className={cn(
              "mb-3 text-2xl font-bold leading-tight tracking-tight text-[var(--navy-900)]",
              entry.highlight && "text-[var(--red-700)]",
            )}>
              {entry.year === "Сегодня" ? entry.year : <time dateTime={entry.year}>{entry.year}</time>}
            </h3>
            <div className="max-w-[65ch] space-y-3 text-base leading-7 text-[var(--text-muted)]">
              {entry.paragraphs.map((paragraph) => <HistoryParagraph key={paragraph} text={paragraph} />)}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
