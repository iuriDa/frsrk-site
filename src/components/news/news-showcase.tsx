import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { homepageNews } from "@/content/news";
import { NewsReadLink } from "@/components/news/news-read-link";

function NewsImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
      </div>
    );
  }
  return (
    <div className={`news-photo-placeholder ${className ?? ""}`}>
      <Newspaper size={28} aria-hidden="true" />
      <span>Фото готовится</span>
    </div>
  );
}

export function NewsShowcase() {
  const mainNews = homepageNews.find((article) => article.isMainNews) ?? homepageNews[0];
  const important = homepageNews.filter((article) => article.id !== mainNews?.id && article.isImportant).slice(0, 3);

  if (!mainNews) {
    return null;
  }

  return (
    <section className="section-space bg-[var(--surface-muted)]" id="federation-news">
      <div className="site-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--red-700)]">Официальная лента</p>
            <h2 className="mt-2 heading-section text-[var(--navy-950)]">Новости Федерации</h2>
          </div>
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-700)] transition hover:text-[var(--navy-950)]">
            Все новости
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <article className="ui-card mt-6 overflow-hidden">
          <NewsImage src={mainNews.coverImage} alt={mainNews.title} className="min-h-[220px] md:min-h-[300px]" />
          <div className="p-6 md:p-7">
            <p className="inline-flex rounded-full bg-[#eaf2fb] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--blue-700)]">{mainNews.category}</p>
            <h3 className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.02em] text-[var(--navy-950)] md:text-2xl">
              {mainNews.title}
            </h3>
            <p className="mt-3 max-w-3xl text-[0.95rem] leading-7 text-[var(--text-muted)]">{mainNews.summary}</p>
            <NewsReadLink
              article={mainNews}
              className="btn btn-primary mt-5"
              arrowSize={16}
              iconSize={16}
            />
          </div>
        </article>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {important.map((article) => (
            <article key={article.id} className="ui-card overflow-hidden">
              <NewsImage src={article.coverImage} alt={article.title} className="min-h-[160px]" />
              <div className="p-5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--red-700)]">{article.category}</p>
                <h3 className="mt-2 text-base font-extrabold leading-snug tracking-[-0.01em] text-[var(--navy-950)]">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)] line-clamp-3">{article.summary}</p>
                <NewsReadLink
                  article={article}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-700)]"
                  arrowSize={15}
                  iconSize={15}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
