import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { getPublishedNewsBySlug, readableNews } from "@/content/news";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Маршрут сохранён для будущих полноценных материалов: генерируются только
// страницы новостей, у которых уже есть непустой внутренний текст.
export function generateStaticParams() {
  return readableNews.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getPublishedNewsBySlug(slug);
  return article ? { title: article.title, description: article.summary } : { title: "Новость не найдена" };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getPublishedNewsBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <PageHero
        eyebrow={article.category}
        title={article.title}
        description={article.summary}
        trail={[{ label: "Новости", href: "/news" }, { label: article.title }]}
      />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container max-w-3xl">
          {article.coverImage ? (
            <div className="relative mb-8 min-h-[240px] overflow-hidden rounded-[24px] md:min-h-[380px]">
              <Image src={article.coverImage} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>
          ) : null}
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 md:p-10">
            <div className="space-y-5 leading-8 text-[var(--text)]">
              {article.content
                .split("\n")
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          </div>
          <Link
            href="/news"
            className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--blue-700)] transition hover:text-[var(--navy-950)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Ко всем новостям
          </Link>
        </div>
      </section>
    </>
  );
}
