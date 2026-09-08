import type { MetadataRoute } from "next";
import { primaryNavigation } from "@/content/navigation";
import { readableNews } from "@/content/news";
import { getSiteUrl } from "@/lib/site-url";

// Стабильная дата на сборку: не меняется на каждый запрос, чтобы страницы не
// выглядели «изменёнными» при каждом обращении к sitemap.
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const navigationPaths = primaryNavigation.flatMap((item) => [
    item.href,
    ...(item.children?.filter((child) => !child.external).map((child) => child.href) ?? []),
  ]);

  const paths = [
    "/",
    ...navigationPaths,
    // Внутренние страницы новостей добавляются, только когда у материала есть
    // полноценный текст (hasArticleText) — иначе внешние VK/Telegram-ссылки
    // считаются основным переходом и в sitemap не включаются.
    ...readableNews.map((article) => `/news/${article.slug}`),
    "/antidoping/check-medicine",
    "/antidoping/certificate",
    "/antidoping/report",
    "/about/requisites",
    "/legal/personal-data",
    "/legal/terms",
    "/legal/cookies",
  ];

  return Array.from(new Set(paths)).map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
