import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, Download, FileText, Scale, Shield, Timer, Trophy, Users } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Правила вида спорта",
  description: "Правила вида спорта «роуп скиппинг (спортивная скакалка)», утверждённые приказом Минспорта России №264 от 29.03.2022.",
};

const speedIndividual = [
  { name: "Прыжки за 30 с", time: "30 сек", desc: "Последовательные прыжки чередованием ног по принципу «бег» на максимальную скорость" },
  { name: "Прыжки за 180 с", time: "180 сек", desc: "Прыжки на выносливость чередованием ног по принципу «бег»" },
  { name: "Прыжки двойные", time: "Без ограничения", desc: "Последовательные прыжки на двух ногах, скакалка проходит 2 оборота за прыжок" },
  { name: "Прыжки тройные", time: "Без ограничения", desc: "Последовательные прыжки на двух ногах, скакалка проходит 3 оборота за прыжок" },
];

const speedGroup = [
  { name: "Прыжки 4 человека", time: "120 сек", desc: "Четыре спортсмена прыгают одновременно через одну скакалку на скорость" },
  { name: "Прыжки через две скакалки 4 человека", time: "180 сек", desc: "Четыре спортсмена, две скакалки вращаются одновременно с чередованием" },
];

const freestyleIndividual = [
  { name: "Вольные упражнения", time: "60–75 сек", desc: "Хореографическая программа с использованием акробатических и гимнастических элементов под музыку" },
];

const freestyleGroup = [
  { name: "Вольные упражнения — группа", time: "60–75 сек", desc: "Групповая хореографическая программа под музыку (4 спортсмена)" },
  { name: "Прыжки через две скакалки 1 человек", time: "60–75 сек", desc: "Один спортсмен прыгает через две длинные скакалки, вращаемые двумя партнёрами" },
  { name: "Прыжки через две скакалки 2 человека", time: "60–75 сек", desc: "Два спортсмена прыгают через две длинные скакалки" },
];

const teamDisciplines = [
  { name: "Командные соревнования", time: "2–4 мин", desc: "Зрелищная дисциплина: хореография, дабл датч, китайское колесо, «путешественник», длинная скакалка. Минимум 6 спортсменов" },
];

const ageGroups = [
  { category: "Мальчики, девочки", age: "10–11 лет" },
  { category: "Юноши, девушки", age: "12–14 лет" },
  { category: "Юниоры, юниорки", age: "15–17 лет" },
  { category: "Мужчины, женщины", age: "18+ лет" },
];

const ruleSections = [
  { icon: BookOpen, title: "Общие положения", anchor: "general", desc: "Термины, определения, правила IRSO" },
  { icon: Trophy, title: "Спортивные дисциплины", anchor: "disciplines", desc: "Личные и групповые дисциплины: ССД, вольные, командные" },
  { icon: Users, title: "Возрастные группы", anchor: "age-groups", desc: "Категории участников от 10 лет" },
  { icon: Scale, title: "Требования к организаторам", anchor: "organizers", desc: "Площадка, инвентарь, судейская коллегия" },
  { icon: Timer, title: "Правила проведения", anchor: "competition", desc: "Заявки, допуск, выполнение упражнений, критерии оценивания" },
  { icon: Shield, title: "Штрафы и дисквалификация", anchor: "penalties", desc: "Фальстарт, нарушение пространства, поведение участников" },
];

export default function RulesPage() {
  return (
    <>
      <PageHero
        eyebrow="Документы"
        title="Правила вида спорта"
        description="Правила вида спорта «роуп скиппинг (спортивная скакалка)», утверждённые приказом Министерства спорта Российской Федерации."
        trail={[{ label: "Документы", href: "/documents" }, { label: "Правила вида спорта" }]}
      />

      <section className="section-space">
        <div className="site-container">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)] p-6 md:p-8">
            <div className="flex flex-wrap items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--navy-900)] text-white">
                <FileText size={22} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Приказ Минспорта России</p>
                <h2 className="mt-1 text-lg font-black text-[var(--navy-950)]">№264 от 29 марта 2022 г.</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Правила разработаны в соответствии с правилами Международной федерации роуп скиппинга (IRSO) и распространяются на все официальные соревнования на территории Российской Федерации.
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Разделы правил">
            {ruleSections.map((s) => (
              <a key={s.anchor} href={`#${s.anchor}`} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--blue-500)] hover:shadow-lg">
                <s.icon size={20} className="mt-0.5 shrink-0 text-[var(--blue-700)]" aria-hidden="true" />
                <div>
                  <p className="font-bold text-[var(--navy-950)]">{s.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{s.desc}</p>
                </div>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section id="general" className="section-space bg-white">
        <div className="site-container max-w-4xl">
          <SectionTitle number="1" title="Общие положения" />
          <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--text)]">
            <p>Правила вида спорта «роуп скиппинг (спортивная скакалка)» разработаны в соответствии с правилами Международной федерации роуп скиппинга (IRSO — International rope skipping federation) и распространяются на все официальные спортивные соревнования, проводимые на территории Российской Федерации.</p>
            <p>Соревнования по характеру проведения могут быть <strong>личными</strong> и <strong>командными</strong>.</p>
            <ul className="space-y-2 pl-4">
              <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />В личных соревнованиях победители определяются в каждой дисциплине в каждой возрастной группе</li>
              <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />В командных соревнованиях определяется общий зачёт среди команд субъектов РФ, клубов и организаций</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="disciplines" className="section-space">
        <div className="site-container max-w-4xl">
          <SectionTitle number="2" title="Спортивные дисциплины" />
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">Дисциплины роуп скиппинга делятся на две группы: личного и командного выступления. По характеру — на скоростные (ССД), вольные (фристайл) и командные.</p>

          <div className="mt-8 space-y-6">
            <DisciplineCard
              title="Скоростные дисциплины (ССД)"
              color="var(--crimea-red)"
              groups={[
                { tag: "Личные", items: speedIndividual },
                { tag: "Групповые", items: speedGroup },
              ]}
            />
            <DisciplineCard
              title="Вольные дисциплины (фристайл)"
              color="var(--blue-700)"
              groups={[
                { tag: "Личные", items: freestyleIndividual },
                { tag: "Групповые", items: freestyleGroup },
              ]}
            />
            <DisciplineCard
              title="Командные дисциплины"
              color="var(--gold-500)"
              groups={[
                { tag: "Групповые", items: teamDisciplines },
              ]}
            />
          </div>
        </div>
      </section>

      <section id="age-groups" className="section-space bg-white">
        <div className="site-container max-w-4xl">
          <SectionTitle number="3" title="Возрастные группы" />
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">Спортсмен должен достичь установленного возраста в календарный год проведения соревнований. Результаты считаются отдельно среди мужского и женского пола.</p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--navy-900)] text-white">
                  <th className="px-5 py-3 text-left font-bold">Категория</th>
                  <th className="px-5 py-3 text-left font-bold">Возраст</th>
                </tr>
              </thead>
              <tbody>
                {ageGroups.map((g, i) => (
                  <tr key={g.category} className={i % 2 ? "bg-[var(--surface-muted)]" : "bg-white"}>
                    <td className="px-5 py-3 font-medium text-[var(--navy-950)]">{g.category}</td>
                    <td className="px-5 py-3 text-[var(--text)]">{g.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="organizers" className="section-space">
        <div className="site-container max-w-4xl">
          <SectionTitle number="4" title="Требования к организаторам" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoBlock title="Площадка" items={[
              "Скоростные дисциплины: 7×7 м",
              "Вольные упражнения (личные): 12×12 м",
              "Групповые и командные: 16×24 м (рекомендуемый минимум)",
              "Ровный пол: паркет, спортивное покрытие или линолеум",
            ]} />
            <InfoBlock title="Инвентарь" items={[
              "Спортсмены используют собственные скакалки",
              "Запрещены скакалки со встроенными счётчиками",
              "Скоростные: металлический трос в оплётке",
              "Фристайл: шнур ПВХ 4–5 мм или бисерная скакалка",
            ]} />
            <InfoBlock title="Музыкальное сопровождение" items={[
              "Обязательно для всех дисциплин",
              "Специализированный звуковой трек с командами",
              "Звукооператорская зона рядом с площадкой",
            ]} />
            <InfoBlock title="Судейская коллегия" items={[
              "Главный судья, заместитель, главный секретарь",
              "Технические судьи, линейные судьи, судьи презентации",
              "Судьи сложности (для фристайла и командных)",
            ]} />
          </div>
        </div>
      </section>

      <section id="competition" className="section-space bg-white">
        <div className="site-container max-w-4xl">
          <SectionTitle number="5" title="Правила проведения" />
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-[var(--border)] p-6">
              <h3 className="font-bold text-[var(--navy-950)]">Допуск участников</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text)]">
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />Заявка, подписанная врачом по спортивной медицине</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />Договор о страховании от несчастных случаев и полис ОМС</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />Документ, подтверждающий возраст и спортивную квалификацию</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />Спортсмен может выступать в одной или нескольких дисциплинах</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--border)] p-6">
              <h3 className="font-bold text-[var(--navy-950)]">Критерии оценивания</h3>
              <div className="mt-3 space-y-4 text-sm leading-6 text-[var(--text)]">
                <div>
                  <p className="font-medium text-[var(--navy-950)]">Скоростные дисциплины</p>
                  <p className="mt-1 text-[var(--text-muted)]">3 линейных судьи считают количество прыжков. Итог — среднее из трёх с вычетом штрафов технического судьи.</p>
                </div>
                <div>
                  <p className="font-medium text-[var(--navy-950)]">Фристайл и дабл датч</p>
                  <p className="mt-1 text-[var(--text-muted)]">Комплексная оценка: технический судья (макс. 1,0), судьи презентации (макс. 3,0), судьи сложности (макс. 6,0). Минус штрафы за нарушения.</p>
                </div>
                <div>
                  <p className="font-medium text-[var(--navy-950)]">Командные соревнования</p>
                  <p className="mt-1 text-[var(--text-muted)]">Сложность — 30%, презентация — 50%, обязательные элементы — 20%. Оцениваются: вариативность, синхронность, креативность, качество навыков.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] p-6">
              <h3 className="font-bold text-[var(--navy-950)]">Обязательные элементы фристайла</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text)]">
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" /><strong>Мультипрыжки</strong> — двойные, тройные и четвертные</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" /><strong>Силовые элементы</strong> — акробатика, гимнастика, пуш ап, фрог</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" /><strong>Смена направлений</strong> — вращение скакалки вперёд и назад</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" /><strong>Пространственная динамика</strong> — перемещение по квадратам площадки</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" /><strong>Манипуляции</strong> — броски, кресты, намотки скакалки</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="penalties" className="section-space">
        <div className="site-container max-w-4xl">
          <SectionTitle number="6" title="Штрафы и дисквалификация" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <h3 className="font-bold text-[var(--navy-950)]">Штрафы (ССД)</h3>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text)]">
                <li>Нарушение пространства — 5 баллов</li>
                <li>Значительный фальстарт — 20 баллов</li>
                <li>Незначительный фальстарт — 5 баллов</li>
                <li>Задержка соревнований — 10 баллов</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <h3 className="font-bold text-[var(--navy-950)]">Штрафы (фристайл)</h3>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text)]">
                <li>Превышение времени — 0,4 балла</li>
                <li>Недостаточное время — 0,4 балла</li>
                <li>Задержка соревнований — 0,6 балла</li>
                <li>Нарушение пространства — 0,2 балла</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 md:col-span-2">
              <h3 className="font-bold text-[var(--navy-950)]">Основания для дисквалификации</h3>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text)]">
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--red-500)]" />Отсутствие музыкального сопровождения в дисциплинах фристайла</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--red-500)]" />Несоблюдение техники безопасности</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--red-500)]" />Наличие счётчика, встроенного в скакалку</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--red-500)]" />Отсутствие спортивной обуви</li>
                <li className="flex items-start gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--red-500)]" />Нарушение требований к костюму, потеря аксессуаров — 3 балла</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">Полный текст правил утверждён приказом Минспорта России №264 от 29.03.2022</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
              <a href="/documents/pravila-vida-sporta-2024.pdf" download className="inline-flex items-center gap-2 rounded-xl bg-[var(--navy-900)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--navy-800)]"><Download size={16} aria-hidden="true" />Скачать PDF · 3 МБ</a>
              <Link href="/documents" className="inline-flex text-sm font-bold text-[var(--blue-700)] hover:underline">Все документы →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--navy-900)] text-sm font-black text-white">{number}</span>
      <h2 className="heading-section">{title}</h2>
    </div>
  );
}

function DisciplineCard({ title, color, groups }: {
  title: string;
  color: string;
  groups: { tag: string; items: { name: string; time: string; desc: string }[] }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-6 py-4">
        <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-base font-black text-[var(--navy-950)]">{title}</h3>
      </div>
      {groups.map((group) => (
        <div key={group.tag} className="border-b border-[var(--border)] last:border-b-0">
          <div className="bg-[var(--surface-muted)] px-6 py-2">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{group.tag}</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {group.items.map((item) => (
              <div key={item.name} className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-bold text-[var(--navy-950)]">{item.name}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                    <Clock size={11} aria-hidden="true" />
                    {item.time}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
      <h3 className="font-bold text-[var(--navy-950)]">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text)]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
