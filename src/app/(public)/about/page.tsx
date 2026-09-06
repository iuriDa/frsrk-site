import type { Metadata } from "next";
import Link from "next/link";
import { Award, Calendar, MapPin, Shield, Trophy, Users } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { verificationRequired } from "@/content/verification-required";

export const metadata: Metadata = {
  title: "О федерации",
  description: "Общественная организация «Федерация роуп скиппинга (спортивной скакалки) Республики Крым» — официальные сведения, руководство и достижения.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="О федерации"
        title="Федерация роуп скиппинга (спортивной скакалки) Республики Крым"
        description="Аккредитованная региональная спортивная федерация, развивающая роуп скиппинг на территории Республики Крым."
        trail={[{ label: "О федерации" }]}
      />

      <section className="section-space">
        <div className="site-container">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="ui-card p-6 md:p-7">
                <h2 className="heading-section">Общие сведения</h2>
                <dl className="mt-6 space-y-4 text-sm leading-7">
                  <InfoRow label="Полное наименование" value={verificationRequired.officialName} />
                  <InfoRow label="Сокращённое наименование" value={verificationRequired.legalShortName ?? ""} />
                  <InfoRow label="ОГРН" value={verificationRequired.ogrn} />
                  <InfoRow label="Вид спорта" value="Роуп скиппинг (спортивная скакалка)" />
                  <InfoRow label="Территория деятельности" value="Республика Крым" />
                  <InfoRow label="Юридический адрес" value={verificationRequired.address ?? ""} />
                  <InfoRow label="Email" value={verificationRequired.email ?? ""} />
                  <InfoRow label="Телефон" value={verificationRequired.phone ?? ""} />
                </dl>
              </div>

              <div className="ui-card p-6 md:p-7">
                <h2 className="heading-section">Аккредитация</h2>
                <dl className="mt-6 space-y-4 text-sm leading-7">
                  <InfoRow label="Статус" value={verificationRequired.accreditation.status} />
                  <InfoRow label="Приказ" value={`№${verificationRequired.accreditation.orderNumber} от ${verificationRequired.accreditation.orderDate}`} />
                  <InfoRow label="Срок действия" value={`${verificationRequired.accreditation.validFrom} — ${verificationRequired.accreditation.validUntil}`} />
                  <InfoRow label="Код ВРВС" value={verificationRequired.accreditation.vrvsCode} />
                </dl>
              </div>

              <div className="ui-card p-6 md:p-7">
                <h2 className="heading-section">Достижения</h2>
                <ul className="mt-6 space-y-4">
                  <AchievementItem icon={Trophy} year="2024" text="Рекорд России и мира — 155 семей (450 человек) одновременно выполняющих прыжки на скакалке (26 октября, Симферополь)" />
                  <AchievementItem icon={Award} year="2024" text="Номинация «Прорыв года» от Всероссийской федерации роуп скиппинга и Минспорта РК" />
                  <AchievementItem icon={Trophy} year="2024–2025" text="Победители Всероссийских соревнований и призёры Первенства России" />
                  <AchievementItem icon={Trophy} year="2025" text="Победители и призёры Чемпионата России" />
                  <AchievementItem icon={Award} year="2025" text="3 место общекомандное на «Гимназиаде» (г. Орёл)" />
                  <AchievementItem icon={Trophy} year="2025" text="Победители международного фестиваля «Займись спортом — Стань первым»" />
                </ul>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="ui-card p-6">
                <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">Руководство</h3>
                <ul className="mt-5 space-y-4">
                  {verificationRequired.leadership.map((person) => (
                    <li key={person.name}>
                      <p className="font-bold text-[var(--navy-950)]">{person.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{person.role}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/about/leadership" className="mt-6 inline-flex text-sm font-bold text-[var(--blue-700)] hover:underline">Подробнее →</Link>
              </div>

              <div className="ui-card p-6">
                <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">Дисциплины</h3>
                <div className="mt-5 space-y-5">
                  <DisciplineGroup title="Скоростные (ССД)" items={["Прыжки за 30 с", "Прыжки за 180 с", "Прыжки двойные", "Прыжки тройные"]} tag="Личные" />
                  <DisciplineGroup title="Скоростные (ССД)" items={["Прыжки 4 человека", "Прыжки через две скакалки 4 человека"]} tag="Групповые" />
                  <DisciplineGroup title="Вольные (фристайл)" items={["Вольные упражнения"]} tag="Личные" />
                  <DisciplineGroup title="Вольные (фристайл)" items={["Вольные упражнения — группа", "Прыжки через две скакалки 1 человек", "Прыжки через две скакалки 2 человека"]} tag="Групповые" />
                  <DisciplineGroup title="Командные" items={["Командные соревнования"]} tag="Групповые" />
                </div>
                <Link href="/documents/rules" className="mt-5 inline-flex text-sm font-bold text-[var(--blue-700)] hover:underline">Правила вида спорта →</Link>
              </div>

              <NavCard icon={Users} label="Руководство" href="/about/leadership" />
              <NavCard icon={Shield} label="Структура" href="/about/structure" />
              <NavCard icon={Calendar} label="Стратегия" href="/about/strategy" />
              <NavCard icon={MapPin} label="Реквизиты" href="/about/requisites" />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sm:flex sm:gap-4">
      <dt className="shrink-0 font-bold text-[var(--navy-950)] sm:w-56">{label}</dt>
      <dd className="text-[var(--text-muted)]">{value}</dd>
    </div>
  );
}

function AchievementItem({ icon: Icon, year, text }: { icon: typeof Trophy; year: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[#fef3cd] text-[var(--gold-500)]"><Icon size={18} aria-hidden="true" /></span>
      <div>
        <span className="text-xs font-bold text-[var(--text-muted)]">{year}</span>
        <p className="text-sm leading-6 text-[var(--text)]">{text}</p>
      </div>
    </li>
  );
}

function DisciplineGroup({ title, items, tag }: { title: string; items: string[]; tag: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[var(--navy-950)]">{title}</span>
        <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">{tag}</span>
      </div>
      <ul className="mt-1.5 space-y-1 text-sm text-[var(--text)]">
        {items.map((d) => (
          <li key={d} className="flex items-start gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--blue-700)]" />{d}</li>
        ))}
      </ul>
    </div>
  );
}

function NavCard({ icon: Icon, label, href }: { icon: typeof Users; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--blue-500)]">
      <Icon size={20} className="text-[var(--blue-700)]" aria-hidden="true" />
      <span className="font-bold text-[var(--navy-950)]">{label}</span>
    </Link>
  );
}
