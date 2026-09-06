import type { Metadata } from "next";
import { ExternalLink, Pill } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = { title: "Проверить лекарство" };

export default function CheckMedicinePage() {
  return (
    <>
      <PageHero eyebrow="Антидопинг" title="Проверить лекарство" description="Используйте официальный сервис РУСАДА для проверки лекарственного средства по действующему Запрещённому списку." trail={[{ label: "Антидопинг", href: "/antidoping" }, { label: "Проверить лекарство" }]} />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container max-w-4xl">
          <div className="rounded-[30px] border border-[var(--border)] bg-white p-8 md:p-11">
            <Pill size={34} className="text-[var(--red-700)]" aria-hidden="true" />
            <h2 className="mt-7 text-3xl font-black tracking-[-0.04em] text-[var(--navy-950)]">Сервис РУСАДА</h2>
            <p className="mt-5 leading-8 text-[var(--text-muted)]">Перед применением лекарства проверьте его название и способ применения. Результат зависит от действующего вещества, вида спорта и соревновательного периода.</p>
            <a href="https://list.rusada.ru" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--blue-700)] px-6 text-sm font-extrabold text-white transition hover:bg-[var(--navy-950)]">Перейти к проверке <ExternalLink size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </>
  );
}
