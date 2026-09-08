import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { verificationRequired } from "@/content/verification-required";
import { siteSettings } from "@/content/site-settings";

export const metadata: Metadata = { title: "Реквизиты" };

export default function RequisitesPage() {
  return (
    <>
      <PageHero
        eyebrow="О федерации"
        title="Реквизиты"
        description="Официальное наименование, регистрационные данные и контакты организации."
        trail={[{ label: "О федерации", href: "/about" }, { label: "Реквизиты" }]}
      />
      <section className="section-space">
        <div className="site-container max-w-3xl">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 md:p-10">
            <h2 className="heading-section">Регистрационные данные</h2>
            <dl className="mt-6 space-y-4 text-sm leading-7">
              <Row label="Полное наименование" value={verificationRequired.officialName} />
              <Row label="Сокращённое наименование" value={verificationRequired.legalShortName ?? ""} />
              <Row label="ОГРН" value={verificationRequired.ogrn} />
              <Row label="Юридический адрес" value={verificationRequired.address} href={verificationRequired.addressMapUrl} />
            </dl>
          </div>

          <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-white p-7 md:p-10">
            <h2 className="heading-section">Аккредитация</h2>
            <dl className="mt-6 space-y-4 text-sm leading-7">
              <Row label="Статус" value={verificationRequired.accreditation.status} />
              <Row label="Приказ" value={`№${verificationRequired.accreditation.orderNumber} от ${verificationRequired.accreditation.orderDate}`} />
              <Row label="Срок действия" value={`${verificationRequired.accreditation.validFrom} — ${verificationRequired.accreditation.validUntil}`} />
              <Row label="Код ВРВС" value={verificationRequired.accreditation.vrvsCode} />
            </dl>
          </div>

          <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-white p-7 md:p-10">
            <h2 className="heading-section">Контактные данные</h2>
            <dl className="mt-6 space-y-4 text-sm leading-7">
              <Row label="Телефон" value={siteSettings.contacts.phone} />
              <Row label="Электронная почта" value={siteSettings.contacts.email} />
              <Row label="ВКонтакте" value={siteSettings.social.vk} />
              <Row label="Telegram" value={siteSettings.social.telegram} />
            </dl>
          </div>

          <p className="mt-6 text-xs leading-5 text-[var(--text-muted)]">
            Банковские реквизиты предоставляются по запросу на электронную почту федерации.
          </p>
        </div>
      </section>
    </>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="sm:flex sm:gap-4">
      <dt className="shrink-0 font-bold text-[var(--navy-950)] sm:w-52">{label}</dt>
      <dd className="text-[var(--text-muted)] break-all">{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--blue-700)]">{value}</a> : value}</dd>
    </div>
  );
}
