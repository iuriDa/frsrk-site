import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CalendarDays, MapPin, Newspaper, Trophy, Users } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { municipalities } from "@/content/municipalities";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return municipalities.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const municipality = municipalities.find((item) => item.slug === slug);
  return municipality ? { title: municipality.name } : {};
}

export default async function MunicipalityPage({ params }: PageProps) {
  const { slug } = await params;
  const municipality = municipalities.find((item) => item.slug === slug);
  if (!municipality) notFound();

  const sections = [
    [Users, "Представитель Федерации", "Информация уточняется"],
    [Building2, "Клубы и организации", "Информация уточняется"],
    [Users, "Тренеры и спортсмены сборной", "Информация уточняется"],
    [CalendarDays, "Местные мероприятия", "Подтверждённые события появятся в календаре"],
    [Trophy, "Результаты", "Итоги будут опубликованы после проверки протоколов"],
    [Newspaper, "Новости муниципалитета", "Материалы готовятся к публикации"],
  ] as const;

  return (
    <>
      <PageHero
        eyebrow={municipality.kind}
        title={municipality.name}
        description="Информация о развитии роуп-скиппинга на территории муниципалитета."
        trail={[{ label: "Муниципалитеты", href: "/municipalities" }, { label: municipality.name }]}
      />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container">
          <Link
            href="/municipalities"
            className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--blue-700)] transition hover:text-[var(--navy-950)]"
          >
            <MapPin size={16} aria-hidden="true" />
            Вернуться к карте и списку муниципалитетов
          </Link>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sections.map(([Icon, title, text]) => (
              <article key={title} className="ui-card p-5">
                <Icon size={22} className="text-[var(--blue-700)]" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-extrabold text-[var(--navy-950)]">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
