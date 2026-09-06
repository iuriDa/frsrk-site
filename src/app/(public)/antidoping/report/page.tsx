import type { Metadata } from "next";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = { title: "Сообщить о допинге" };

export default function ReportDopingPage() {
  return (
    <>
      <PageHero eyebrow="Антидопинг" title="Сообщить о допинге" description="Используйте официальный конфиденциальный канал РУСАДА для сообщения о предполагаемом нарушении антидопинговых правил." trail={[{ label: "Антидопинг", href: "/antidoping" }, { label: "Сообщить о допинге" }]} />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container max-w-4xl">
          <div className="rounded-[30px] border border-[var(--border)] bg-white p-8 md:p-11">
            <ShieldAlert size={36} className="text-[var(--red-700)]" aria-hidden="true" />
            <h2 className="mt-7 text-3xl font-black tracking-[-0.04em] text-[var(--navy-950)]">Официальная форма РУСАДА</h2>
            <p className="mt-5 leading-8 text-[var(--text-muted)]">Федерация не собирает такие сообщения через собственную форму. Переход ведёт непосредственно на официальный сайт РУСАДА.</p>
            <a href="https://rusada.ru/doping-control/investigations/report-about-doping/" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--red-700)] px-6 text-sm font-extrabold text-white transition hover:bg-[var(--navy-950)]">Открыть официальный канал <ExternalLink size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </>
  );
}
