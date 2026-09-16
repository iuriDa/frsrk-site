import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, FileSpreadsheet, FileText, Music, Scale } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import {
  documentCategories,
  documentStatusClasses,
  documentStatusLabels,
  type DocumentCategory,
  type FederationDocument,
} from "@/content/documents";
import { disciplineAudio } from "@/content/discipline-audio";

import { documentDownloadUrl, readDocumentCatalog } from "@/lib/document-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Документы",
  description: "Официальные документы: правила вида спорта, стандарты спортивной подготовки, нормативы, судейские положения.",
};

const categoryOrder: DocumentCategory[] = ["prikazy-minsporta", "standarty", "sudejstvo"];

const categoryIcons: Record<DocumentCategory, typeof FileText> = {
  "prikazy-minsporta": FileText,
  "standarty": Scale,
  "sudejstvo": BookOpen,
};

const fileTypeLabels: Record<string, string> = { pdf: "PDF", docx: "DOCX", xls: "XLS", xlsx: "XLSX" };

export default async function DocumentsPage() {
  const { documents } = await readDocumentCatalog();
  return (
    <>
      <PageHero
        eyebrow="Официальная информация"
        title="Документы"
        description="Нормативные документы по виду спорта «роуп скиппинг (спортивная скакалка)»: приказы Минспорта, стандарты подготовки, судейские положения."
        trail={[{ label: "Документы" }]}
      />

      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container">
          {/* Верхний отдельный блок — Правила вида спорта */}
          <div className="rounded-[var(--radius-card)] bg-[var(--navy-900)] p-6 text-white md:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#f5cc73]">Главный документ</p>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] md:text-3xl">Правила вида спорта</h2>
            <p className="mt-3 max-w-3xl leading-7 text-white/75">
              Дисциплины, возрастные группы, критерии оценивания и штрафы — подробно на отдельной странице.
            </p>
            <Link
              href="/documents/rules"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[var(--navy-950)] transition hover:bg-[#f5cc73]"
            >
              Открыть правила
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          {/* Звуковые дорожки дисциплин */}
          <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7">
            <div className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--navy-900)] text-white">
                <Music size={20} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black leading-snug text-[var(--navy-950)] md:text-xl">
                  Звуковые дорожки дисциплин
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                  Официальные музыкальные файлы для проведения соревнований по дисциплинам роуп скиппинга. Скачайте нужную дорожку в формате MP3.
                </p>
              </div>
            </div>

            <ul className="mt-6 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {disciplineAudio.map((track) => (
                <li key={track.fileUrl}>
                  <a
                    href={track.fileUrl}
                    download
                    className="group flex h-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 transition hover:border-[var(--blue-500)]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[var(--blue-700)]">
                      <Download size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[var(--navy-950)] group-hover:text-[var(--blue-700)]">
                        {track.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                        MP3 · {track.fileSize}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Три категории документов */}
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categoryOrder.map((catKey) => {
              const cat = documentCategories[catKey];
              const docs = documents.filter((d) => d.category === catKey);
              const Icon = categoryIcons[catKey];

              return (
                <section key={catKey} className="ui-card flex flex-col p-6">
                  <div className="grid size-11 place-items-center rounded-2xl bg-[var(--navy-900)] text-white">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 text-lg font-black leading-snug text-[var(--navy-950)]">{cat.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{cat.description}</p>

                  {docs.length > 0 ? (
                    <ul className="mt-5 space-y-4 border-t border-[var(--border)] pt-5">
                      {docs.map((doc) => (
                        <li key={doc.id}>
                          <DocumentRow doc={doc} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-5 text-center text-sm text-[var(--text-muted)]">
                      Подтверждённые документы этой категории готовятся к публикации.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function DocumentRow({ doc }: { doc: FederationDocument }) {
  const FileIcon = (doc.fileType === "xls" || doc.fileType === "xlsx") ? FileSpreadsheet : FileText;
  const status = doc.status ?? "current";

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.06em] ${documentStatusClasses[status]}`}>
          {documentStatusLabels[status]}
        </span>
        {doc.edition ? <span className="text-[11px] font-bold text-[var(--text-muted)]">Ред. {doc.edition}</span> : null}
      </div>
      <div className="mt-2 flex gap-3">
        <FileIcon size={18} className="mt-0.5 shrink-0 text-[var(--blue-700)]" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-snug text-[var(--navy-950)]">{doc.title}</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{doc.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
            {doc.documentNumber ? <span>Приказ {doc.documentNumber}</span> : null}
            {doc.documentDate ? <span>от {doc.documentDate}</span> : null}
            <span>{doc.issuingAuthority ?? doc.source}</span>
          </div>
        </div>
      </div>
      <a
        href={documentDownloadUrl(doc.id)}
        download
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2 text-xs font-bold text-[var(--navy-950)] transition hover:border-[var(--blue-500)] hover:text-[var(--blue-700)]"
      >
        <Download size={15} aria-hidden="true" />
        {fileTypeLabels[doc.fileType]} · {doc.fileSize}
      </a>
    </div>
  );
}
