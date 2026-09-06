import { ExternalLink, FileText } from "lucide-react";
import type { AntiDopingDocument, AntiDopingDocumentStatus } from "@/content/antidoping";

const statusLabels: Record<AntiDopingDocumentStatus, string> = {
  current: "Актуальный",
  archived: "Архив",
  repealed: "Утратил силу",
  verification_required: "Требует проверки",
};

const statusClasses: Record<AntiDopingDocumentStatus, string> = {
  current: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
  repealed: "bg-rose-50 text-rose-700",
  verification_required: "bg-amber-50 text-amber-700",
};

export function AntiDopingDocumentList({ documents }: { documents: AntiDopingDocument[] }) {
  return (
    <div className="grid gap-4">
      {documents.map((document) => (
        <article key={document.id} className="rounded-[22px] border border-[var(--border)] bg-white p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf2fb] text-[var(--blue-700)]">
                <FileText size={21} aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.07em] ${statusClasses[document.status]}`}>
                    {statusLabels[document.status]}
                  </span>
                  {document.year ? <span className="text-xs font-bold text-[var(--text-muted)]">{document.year}</span> : null}
                </div>
                <h3 className="mt-3 text-lg font-black leading-snug text-[var(--navy-950)]">{document.title}</h3>
                {document.description ? <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{document.description}</p> : null}
                <p className="mt-2 text-xs font-bold text-[var(--text-muted)]">Источник: {document.sourceName}</p>
              </div>
            </div>
            <a
              href={document.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-extrabold text-[var(--blue-700)] transition hover:border-[var(--blue-500)] hover:bg-[#eaf2fb]"
            >
              Открыть источник
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
