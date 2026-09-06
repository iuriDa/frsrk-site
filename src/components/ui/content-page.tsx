import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

interface ContentPageProps {
  eyebrow: string;
  title: string;
  description: string;
  trail: Array<{ label: string; href?: string }>;
  icon: LucideIcon;
  items: string[];
  note?: string;
  links?: Array<{ label: string; href: string }>;
}

export function ContentPage({ eyebrow, title, description, trail, icon: Icon, items, note, links }: ContentPageProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} trail={trail} />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="ui-card p-6">
            <span className="grid size-11 place-items-center rounded-[var(--radius-compact)] bg-[#eaf2fb] text-[var(--blue-700)]">
              <Icon size={20} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold tracking-[-0.02em] text-[var(--navy-950)]">Структура раздела</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item} className="flex gap-2.5 rounded-[var(--radius-compact)] bg-[var(--surface-muted)] p-3 text-sm font-semibold text-[var(--navy-950)]">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[var(--blue-700)]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            {links?.length ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="btn btn-primary">
                    {link.label}<ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <aside className="ui-card h-fit border-transparent bg-[var(--navy-900)] p-6 text-white">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f5cc73]">Статус наполнения</p>
            <h2 className="mt-3 text-lg font-extrabold tracking-[-0.02em]">Материал готовится к публикации</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {note ?? "Раздел технически готов. Фактические сведения будут добавлены после проверки официальных документов и согласования публикации."}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
