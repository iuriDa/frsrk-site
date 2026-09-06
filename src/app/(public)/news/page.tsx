import type { Metadata } from "next";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { publishedNews } from "@/content/news";
import type { FederationNewsArticle } from "@/content/news";
import { NewsReadLink } from "@/components/news/news-read-link";

export const metadata: Metadata = {
  title: "Новости",
  description: "Официальная лента новостей Федерации роуп скиппинга (спортивной скакалки) Республики Крым.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Официальная лента"
        title="Новости Федерации"
        description="Официальные сообщения, анонсы и материалы Федерации роуп скиппинга (спортивной скакалки) Республики Крым."
        trail={[{ label: "Новости" }]}
      />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container">
          {publishedNews.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {publishedNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Новости пока не опубликованы"
              description="Раздел технически готов. Официальные материалы появятся здесь после проверки и согласования публикации."
              actionLabel="Вернуться на главную"
              actionHref="/"
            />
          )}
        </div>
      </section>
    </>
  );
}

function NewsCard({ article }: { article: FederationNewsArticle }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-white">
      {article.coverImage ? (
        <div className="relative min-h-[180px] overflow-hidden">
          <Image src={article.coverImage} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      ) : (
        <div className="news-photo-placeholder min-h-[180px]">
          <Newspaper size={28} aria-hidden="true" />
          <span>Фото готовится</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--red-700)]">{article.category}</p>
        <h2 className="mt-2 text-lg font-black leading-snug tracking-[-0.02em] text-[var(--navy-950)]">{article.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)] line-clamp-3">{article.summary}</p>
        <NewsReadLink
          article={article}
          className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--blue-700)] transition hover:text-[var(--navy-950)]"
          arrowSize={15}
          iconSize={15}
        />
      </div>
    </article>
  );
}
