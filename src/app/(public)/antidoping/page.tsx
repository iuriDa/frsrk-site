import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ExternalLink, FileCheck2, Pill, ShieldAlert, UserRoundCheck } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { antiDopingDocuments, antiDopingOfficer, antiDopingServices } from "@/content/antidoping";

export const metadata: Metadata = {
  title: "Антидопинг",
  description: "Антидопинговое обеспечение, документы, проверка лекарств, обучение и официальный канал РУСАДА.",
};

export default function AntiDopingPage() {
  const featured = antiDopingDocuments.filter((item) => item.isFeatured);
  return (
    <>
      <PageHero
        eyebrow="Честный спорт"
        title="Антидопинг"
        description="Актуальные правила, проверка лекарств, образовательные курсы и официальные инструменты РУСАДА."
        trail={[{ label: "Антидопинг" }]}
      />

      <section className="section-space bg-white">
        <div className="site-container">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {antiDopingServices.map((service, index) => {
              const icons = [Pill, BookOpenCheck, ShieldAlert, FileCheck2] as const;
              const Icon = icons[index] ?? FileCheck2;
              return (
                <a key={service.href} href={service.href} target="_blank" rel="noopener noreferrer" className="ui-card bg-[var(--surface-muted)] p-6 transition hover:border-[var(--blue-500)] hover:shadow-[0_1px_2px_rgba(7,20,38,.04),0_8px_24px_rgba(7,20,38,.06)]">
                  <Icon size={22} className="text-[var(--red-700)]" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-extrabold text-[var(--navy-950)]">{service.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{service.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-700)]">Открыть <ExternalLink size={15} aria-hidden="true" /></span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-space border-y border-[var(--border)] bg-[var(--surface-muted)]">
        <div className="site-container grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="ui-card p-6 md:p-7">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--red-700)]">Актуальные материалы</p>
            <h2 className="mt-3 text-xl font-extrabold tracking-[-0.02em] text-[var(--navy-950)]">Главные документы</h2>
            <div className="mt-5 grid gap-2.5">
              {featured.map((document) => (
                <a key={document.id} href={document.externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 rounded-[var(--radius-compact)] bg-[var(--surface-muted)] p-3.5 text-sm font-semibold text-[var(--navy-950)] transition hover:bg-[#eaf2fb] hover:text-[var(--blue-700)]">
                  <span>{document.title}</span>
                  <ExternalLink size={16} className="shrink-0" aria-hidden="true" />
                </a>
              ))}
            </div>
            <Link href="/antidoping/documents" className="btn btn-primary mt-5">
              Все документы
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <aside className="ui-card border-transparent bg-[var(--navy-950)] p-6 text-white md:p-7">
            <UserRoundCheck size={24} className="text-[#f5cc73]" aria-hidden="true" />
            <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f5cc73]">Ответственное лицо</p>
            <h2 className="mt-3 text-xl font-extrabold tracking-[-0.02em]">Антидопинговое обеспечение</h2>
            {antiDopingOfficer.name ? (
              <div className="mt-6 text-white/75">
                <p className="font-extrabold text-white">{antiDopingOfficer.name}</p>
                <p className="mt-2">{antiDopingOfficer.role}</p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/14 bg-white/7 p-5">
                <p className="font-extrabold">Информация уточняется</p>
                <p className="mt-2 text-sm leading-6 text-white/65">Контакт будет опубликован после подтверждения назначения и согласования публикации персональных данных.</p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="site-container rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-extrabold text-amber-950">Важно</h2>
          <p className="mt-2 max-w-4xl text-[0.95rem] leading-7 text-amber-900/80">
            Проверяйте лекарства перед применением и используйте только актуальные документы. Старые запрещённые списки и утратившие силу нормативные акты размещаются в архиве с отдельной отметкой.
          </p>
        </div>
      </section>
    </>
  );
}
