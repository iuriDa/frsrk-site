import type { Metadata } from "next";
import { ExternalLink, GraduationCap } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = { title: "Получить сертификат РУСАДА" };

export default function CertificatePage() {
  const steps = ["Перейдите на портал РУСАДА", "Зарегистрируйтесь или войдите", "Выберите курс для своей роли", "Пройдите модули и итоговый тест", "Скачайте именной сертификат"];
  return (
    <>
      <PageHero eyebrow="Антидопинг" title="Получить сертификат" description="Онлайн-обучение РУСАДА для спортсменов, тренеров, родителей, медицинского персонала и официальных лиц." trail={[{ label: "Антидопинг", href: "/antidoping" }, { label: "Получить сертификат" }]} />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container max-w-4xl">
          <div className="rounded-[30px] border border-[var(--border)] bg-white p-8 md:p-11">
            <GraduationCap size={36} className="text-[var(--blue-700)]" aria-hidden="true" />
            <ol className="mt-8 grid gap-4">
              {steps.map((step, index) => <li key={step} className="flex items-center gap-4 rounded-2xl bg-[var(--surface-muted)] p-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--navy-950)] text-sm font-black text-white">{index + 1}</span><span className="font-bold text-[var(--navy-950)]">{step}</span></li>)}
            </ol>
            <a href="https://course.rusada.ru" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--red-700)] px-6 text-sm font-extrabold text-white transition hover:bg-[var(--navy-950)]">Открыть образовательный портал <ExternalLink size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </>
  );
}
