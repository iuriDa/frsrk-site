import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = { title: "Руководство" };

const leaders = [
  {
    name: "Жмакина Виктория Николаевна",
    role: "Президент",
    details: [
      "Мастер спорта по велоспорту",
      "Педагог высшей категории, стаж 23 года",
      "Руководитель Академии роуп скиппинга JDL",
      "Вице-президент регионального отделения ОРТО в РК",
      "Глава судейского комитета Республики Крым",
      "Судья 2-й категории по роуп скиппингу",
      "Номинация «Прорыв года» (2024) от Всероссийской федерации и Минспорта РК",
    ],
  },
  {
    name: "Данильченко Юрий Леонидович",
    role: "Вице-президент, Главный тренер сборной",
    details: [
      "Глава комиссии дабл датч в методическом комитете Федерации",
      "Спортивный судья 2-й категории по роуп скиппингу",
      "Чемпион России по спортивной скакалке (2026)",
      "2-й спортивный разряд по роуп скиппингу",
      "Цирковой артист, выступления в 20+ странах",
      "Тренерский стаж — 9 лет",
    ],
  },
];

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="О федерации"
        title="Руководство"
        description="Состав руководящих органов Федерации роуп скиппинга (спортивной скакалки) Республики Крым."
        trail={[{ label: "О федерации", href: "/about" }, { label: "Руководство" }]}
      />
      <section className="section-space">
        <div className="site-container space-y-6">
          {leaders.map((person) => (
            <div key={person.name} className="rounded-[28px] border border-[var(--border)] bg-white p-7 md:p-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--blue-700)]">{person.role}</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-[var(--navy-950)]">{person.name}</h2>
              <ul className="mt-5 space-y-2">
                {person.details.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-sm leading-6 text-[var(--text)]">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 md:p-10">
            <h2 className="heading-section">Органы управления (по Уставу)</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--text)]">
              <li className="flex items-start gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--navy-900)]" /><span><strong>Общее собрание</strong> — высший руководящий орган (не реже 1 раза в год)</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--navy-900)]" /><span><strong>Президиум</strong> — постоянно действующий руководящий орган</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--navy-900)]" /><span><strong>Президент</strong> — избирается на 5 лет, общее руководство</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--navy-900)]" /><span><strong>Вице-президент</strong> — избирается на 3 года из членов Президиума</span></li>
              <li className="flex items-start gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--navy-900)]" /><span><strong>Ревизионная комиссия</strong> — контроль финансово-хозяйственной деятельности</span></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
