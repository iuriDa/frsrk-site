import type { Metadata } from "next";
import { Cookie } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Файлы cookie",
  description: "Временная информация об использовании файлов cookie на сайте Федерации.",
};

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Правовая информация"
        title="Файлы cookie"
        description="Как сайт Федерации использует файлы cookie на текущем этапе."
        trail={[{ label: "Cookie" }]}
      />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container max-w-3xl">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 md:p-10">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#eaf2fb] text-[var(--blue-700)]">
              <Cookie size={27} aria-hidden="true" />
            </span>
            <div className="mt-8 space-y-5 leading-8 text-[var(--text-muted)]">
              <p>
                Сайт может использовать только технически необходимые файлы cookie, которые
                обеспечивают базовую работу страниц. Такие файлы не применяются для отслеживания
                пользователей и не передаются третьим лицам.
              </p>
              <p>
                Аналитические, статистические и рекламные системы (например, счётчики посещаемости
                или рекламные пиксели) в настоящее время на сайте не подключены. Поэтому
                необязательные cookie не устанавливаются, а баннер согласия не отображается.
              </p>
              <p>
                Эта информация будет обновлена и дополнена, если в дальнейшем к сайту будут
                подключены дополнительные сервисы, использующие cookie.
              </p>
            </div>
          </div>
          <p className="mt-5 text-xs leading-5 text-[var(--text-muted)]">
            Это временная информационная справка, а не итоговый юридический документ. Окончательная
            политика использования файлов cookie будет подготовлена и согласована отдельно.
          </p>
        </div>
      </section>
    </>
  );
}
