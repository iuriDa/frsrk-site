import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, FileText, GraduationCap } from "lucide-react";
import { MunicipalitiesDataStory } from "@/components/home/municipalities-data-story";
import { HomeCalendarPreview } from "@/components/home/home-calendar-preview";
import { NewsShowcase } from "@/components/news/news-showcase";
import { HalideTopoHero } from "@/components/ui/halide-topo-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { antiDopingServices } from "@/content/antidoping";

export function HomePage() {
  return (
    <>
      <HalideTopoHero />
      <NewsShowcase />
      <HomeCalendarPreview />
      <LeadershipPreview />
      <MunicipalitiesDataStory />
      <AntiDopingPreview />
      <EducationAndDocuments />
    </>
  );
}

function LeadershipPreview() {
  return (
    <section className="section-space border-y border-[var(--border)] bg-[var(--surface-muted)]">
      <div className="site-container">
        <div className="rounded-[var(--radius-card)] bg-[var(--navy-950)] p-6 text-white md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-white/20 bg-white/10 md:size-36">
              <Image src="/images/president.avif" alt="Жмакина Виктория Николаевна — Президент ФРСРК" fill className="object-cover" sizes="144px" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f5cc73]">Руководство</p>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.02em] md:text-[1.75rem]">Жмакина Виктория Николаевна</h2>
              <p className="mt-1.5 text-base font-semibold text-white/80">Президент Федерации роуп скиппинга Республики Крым</p>
              <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-white/68">Человек, который вкладывает всю душу и всё своё время в развитие роуп скиппинга в Крыму. Благодаря её энергии и преданности спорту Федерация за несколько лет прошла путь от создания до пятёрки лидеров страны — а десятки детей и спортсменов обрели возможность расти, побеждать и представлять Республику на Всероссийском уровне.</p>
              <Link href="/about" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#f5cc73]">
                О Федерации
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AntiDopingPreview() {
  return (
    <section className="section-space hero-glow relative overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 surface-grid opacity-20" />
      <div className="site-container relative">
        <SectionHeading eyebrow="Честный спорт" title="Антидопинговое обеспечение" description="Проверка лекарств, обучение, актуальные документы и официальный канал для сообщения о возможном нарушении." inverse />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {antiDopingServices.map((service) => (
            <a key={service.href} href={service.href} target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-card)] border border-white/14 bg-white/8 p-5 transition hover:bg-white/13">
              <BookOpenCheck size={22} className="text-[#f5cc73]" aria-hidden="true" />
              <h3 className="mt-4 text-base font-bold">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{service.description}</p>
            </a>
          ))}
        </div>
        <Link href="/antidoping" className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-white px-5 text-sm font-semibold text-[var(--navy-950)] transition hover:bg-[#f5cc73]">
          Перейти в раздел
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function EducationAndDocuments() {
  return (
    <section className="section-space bg-[var(--surface-muted)]">
      <div className="site-container grid gap-5 lg:grid-cols-2">
        <Link href="/education" className="ui-card group p-6 transition hover:border-[var(--blue-500)] hover:shadow-[0_1px_2px_rgba(7,20,38,.04),0_8px_24px_rgba(7,20,38,.06)]">
          <GraduationCap size={24} className="text-[var(--blue-700)]" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-[var(--navy-950)]">Обучение</h2>
          <p className="mt-2 text-[0.95rem] leading-7 text-[var(--text-muted)]">Семинары, курсы, аттестации и методические материалы для тренеров и судей.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-700)]">Открыть раздел <ArrowRight size={16} aria-hidden="true" /></span>
        </Link>
        <Link href="/documents" className="ui-card group p-6 transition hover:border-[var(--blue-500)] hover:shadow-[0_1px_2px_rgba(7,20,38,.04),0_8px_24px_rgba(7,20,38,.06)]">
          <FileText size={24} className="text-[var(--red-700)]" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-[var(--navy-950)]">Документы</h2>
          <p className="mt-2 text-[0.95rem] leading-7 text-[var(--text-muted)]">Уставные материалы, правила, календарные планы, положения, приказы, протоколы и формы.</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-700)]">Открыть архив <ArrowRight size={16} aria-hidden="true" /></span>
        </Link>
      </div>
    </section>
  );
}
