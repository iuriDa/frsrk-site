import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { footerNavigation } from "@/content/navigation";
import { siteSettings } from "@/content/site-settings";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--navy-950)] text-white">
      <div className="h-1.5 bg-[var(--crimea-red)]" aria-hidden="true" />
      <div className="site-container py-10 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-10">
          <div>
            <p className="max-w-md text-lg font-extrabold leading-tight tracking-[-0.02em]">
              {siteSettings.officialName}
            </p>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/62">
              Официальный информационный портал. Неподтверждённые сведения публикуются только после проверки документов и согласования.
            </p>
            <div className="mt-4 space-y-2 text-sm text-white/72">
              <p className="flex items-center gap-2">
                <Phone size={14} aria-hidden="true" />
                <Link href={`tel:${siteSettings.contacts.phone.replace(/[\s()-]/g, "")}`} className="hover:text-white">{siteSettings.contacts.phone}</Link>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} aria-hidden="true" />
                <Link href={`mailto:${siteSettings.contacts.email}`} className="hover:text-white">{siteSettings.contacts.email}</Link>
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={siteSettings.social.vk}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#f5cc73]"
              >
                <MessageCircle size={16} aria-hidden="true" />
                VK
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <Link
                href={siteSettings.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#f5cc73]"
              >
                <Send size={16} aria-hidden="true" />
                Telegram
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <FooterColumn title="Федерация" links={footerNavigation.federation} />
          <FooterColumn title="Деятельность" links={footerNavigation.activity} />
          <FooterColumn title="Информация" links={footerNavigation.information} />
        </div>

        <div className="mt-8 border-t border-white/12 pt-6">
          <div className="flex flex-col gap-4 text-xs text-white/65 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} {siteSettings.officialName}. Все права защищены.</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/legal/personal-data" className="hover:text-white">Персональные данные</Link>
              <Link href="/legal/terms" className="hover:text-white">Пользовательское соглашение</Link>
            </div>
          </div>
          <p className="mt-5 text-[10px] leading-4 tracking-[0.04em] text-white/55">
            Разработан и создан Данильченко Ю. Л.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <div>
      <h2 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/60">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm text-white/72">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition hover:text-white">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
