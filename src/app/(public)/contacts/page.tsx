import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { verificationRequired } from "@/content/verification-required";
import { siteSettings } from "@/content/site-settings";

export const metadata: Metadata = { title: "Контакты" };

export default function ContactsPage() {
  return (
    <>
      <PageHero eyebrow="Связь с федерацией" title="Контакты" description="Официальные каналы связи Федерации роуп скиппинга (спортивной скакалки) Республики Крым." trail={[{label:"Контакты"}]} />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ContactCard icon={Phone} title="Телефон" value={siteSettings.contacts.phone} href={`tel:${siteSettings.contacts.phone.replace(/[\s()-]/g, "")}`} />
          <ContactCard icon={Mail} title="Электронная почта" value={siteSettings.contacts.email} href={`mailto:${siteSettings.contacts.email}`} />
          <ContactCard icon={MapPin} title="Адрес · открыть Яндекс Карты" value={verificationRequired.address} href={verificationRequired.addressMapUrl} />
          <ContactCard icon={MessageCircle} title="ВКонтакте" value="Официальное сообщество" href={siteSettings.social.vk} />
          <ContactCard icon={Send} title="Telegram" value="Официальный канал" href={siteSettings.social.telegram} />
        </div>
        <div className="site-container mt-8 rounded-[28px] border border-[var(--border)] bg-white p-7 md:p-10">
          <h2 className="text-2xl font-black tracking-[-0.035em] text-[var(--navy-950)]">Обращение в федерацию</h2>
          <p className="mt-4 max-w-3xl leading-8 text-[var(--text-muted)]">На этапе 2 здесь появится безопасная форма обращения с выбором темы, согласием на обработку данных и защитой от спама.</p>
          <Link href="/join" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-[var(--blue-700)] px-5 text-sm font-extrabold text-white">Выбрать форму участия</Link>
        </div>
      </section>
    </>
  );
}

function ContactCard({ icon: Icon, title, value, href }: { icon: typeof Phone; title: string; value: string; href?: string }) {
  const content = <><span className="grid size-12 place-items-center rounded-2xl bg-[#eaf2fb] text-[var(--blue-700)]"><Icon size={23} aria-hidden="true"/></span><p className="mt-7 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">{title}</p><p className="mt-2 font-extrabold text-[var(--navy-950)]">{value}</p></>;
  const cardClass = "rounded-[26px] border border-[var(--border)] bg-white p-7 transition hover:-translate-y-1 hover:border-[var(--blue-500)]";
  if (!href) {
    return <div className="rounded-[26px] border border-[var(--border)] bg-white p-7">{content}</div>;
  }
  // Внешние ссылки (VK, Telegram) открываем в новой вкладке; tel: и mailto: — нет.
  const isExternal = href.startsWith("http");
  return (
    <Link href={href} className={cardClass} {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {content}
    </Link>
  );
}
