import type { Metadata } from "next";
import { AntiDopingDocumentList } from "@/components/antidoping/document-list";
import { PageHero } from "@/components/ui/page-hero";
import { antiDopingDocuments } from "@/content/antidoping";

export const metadata: Metadata = { title: "Запрещённый список и документы" };

const categories = [
  ["current", "Актуальные документы"],
  ["prohibited-lists", "Запрещённые списки прошлых лет"],
  ["international", "Международные стандарты"],
  ["russian-law", "Законодательство Российской Федерации"],
  ["methodical", "Методические материалы и памятки"],
  ["archive", "Архив и утратившие силу документы"],
] as const;

export default function AntiDopingDocumentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Антидопинг"
        title="Запрещённый список и документы"
        description="Актуальные правила размещены отдельно от архивных редакций и утративших силу документов."
        trail={[{ label: "Антидопинг", href: "/antidoping" }, { label: "Документы" }]}
      />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container space-y-12">
          {categories.map(([category, title]) => {
            const documents = antiDopingDocuments.filter((item) => item.category === category);
            if (!documents.length) return null;
            return (
              <section key={category} aria-labelledby={`category-${category}`}>
                <h2 id={`category-${category}`} className="text-3xl font-black tracking-[-0.04em] text-[var(--navy-950)]">{title}</h2>
                {category === "prohibited-lists" || category === "archive" ? (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">Архивные материалы нельзя использовать вместо действующих документов 2026 года.</p>
                ) : null}
                <div className="mt-6"><AntiDopingDocumentList documents={documents} /></div>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
