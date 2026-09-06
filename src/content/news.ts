import type { PublishStatus } from "@/types/content";
import { siteSettings } from "@/content/site-settings";

export type NewsPlatform = "vk" | "telegram";

export interface FederationNewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt?: string;
  coverImage?: string;
  showOnHomepage: boolean;
  isMainNews: boolean;
  isImportant: boolean;
  isPinned: boolean;
  homepageOrder: number;
  status: PublishStatus;
  /** Внутренний редакционный флаг: факты требуют сверки с официальным источником. Карточку не скрывает. */
  requiresVerification: boolean;
  /**
   * Внешняя публикация (пост во ВКонтакте или Telegram), на которую ведёт кнопка
   * «Читать», пока на сайте нет полноценного внутреннего текста материала.
   */
  externalPlatform?: NewsPlatform;
  externalUrl?: string;
  /**
   * true, если конкретный пост/канал для этой новости не подтверждён и используется
   * временная ссылка на официальное сообщество/канал федерации (см. отчёт по этапу 1.7).
   */
  linkRequiresVerification?: boolean;
}

/**
 * Аудит проекта (файлы, git history) не нашёл точных ссылок на конкретные посты
 * VK/Telegram ни для одной из четырёх новостей. Поэтому для всех четырёх временно
 * используется официальный Telegram-канал федерации (siteSettings.social.telegram)
 * с пометкой linkRequiresVerification: true — см. итоговый отчёт этапа 1.7.
 */
const TEMPORARY_TELEGRAM_LINK = siteSettings.social.telegram;

export const federationNews: FederationNewsArticle[] = [
  {
    // Публикуется на сайте. requiresVerification — внутренний редакционный флаг:
    // утверждения о рекордах Мира/России и топ-5 регионов ещё нужно сверить с
    // официальным источником, но это не скрывает карточку с публичного сайта.
    id: "news-proryv-goda",
    slug: "proryv-goda-krym-v-pyaterke-liderov",
    title: "«Прорыв года»: Республика Крым — в пятёрке лидеров роуп скиппинга России",
    summary:
      "Федерация роуп скиппинга Республики Крым основана в 2022 году. За это время — рекорд Мира и России по прыжкам семьями, звание «Прорыв года» на всероссийском и региональном уровне, топ-5 регионов по комплексным показателям развития и одни из первых в стране отделений спортивной скакалки в спортивных школах.",
    content: "",
    category: "Достижения",
    coverImage: "/images/news-1.avif",
    showOnHomepage: true,
    isMainNews: true,
    isImportant: true,
    isPinned: true,
    homepageOrder: 1,
    status: "published",
    requiresVerification: true,
    externalPlatform: "telegram",
    externalUrl: TEMPORARY_TELEGRAM_LINK,
    linkRequiresVerification: true,
  },
  {
    // Публикуется на сайте. requiresVerification — внутренний редакционный флаг:
    // утверждение «первым в России» ещё нужно сверить с официальным источником.
    id: "news-online-podschet",
    slug: "krym-pervym-zapustil-online-podschet",
    title: "Крым первым в России запустил онлайн-подсчёт на соревнованиях по спортивной скакалке",
    summary:
      "Каждый прыжок — в реальном времени на экране. Зрители видят результат прямо во время выступления. Новый стандарт соревнований.",
    content: "",
    category: "Инновации",
    coverImage: "/images/news-2.avif",
    showOnHomepage: true,
    isMainNews: false,
    isImportant: true,
    isPinned: false,
    homepageOrder: 2,
    status: "published",
    requiresVerification: true,
    externalPlatform: "telegram",
    externalUrl: TEMPORARY_TELEGRAM_LINK,
    linkRequiresVerification: true,
  },
  {
    id: "news-medalnaya-istoriya",
    slug: "medalnaya-istoriya-kryma",
    title: "Медальная история Крыма",
    summary:
      "Победы, призовые места и новые имена — вся медальная история сборной Республики Крым собрана в одном разделе.",
    content: "",
    category: "Сборная",
    // Изображение news-3.avif отсутствует в проекте — используется нейтральный
    // placeholder «Фото готовится» (coverImage не задан).
    showOnHomepage: true,
    isMainNews: false,
    isImportant: true,
    isPinned: false,
    homepageOrder: 3,
    status: "published",
    requiresVerification: false,
    externalPlatform: "telegram",
    externalUrl: TEMPORARY_TELEGRAM_LINK,
    linkRequiresVerification: true,
  },
  {
    id: "news-mezhdunarodnye-svyazi",
    slug: "krym-rasshiryaet-mezhdunarodnye-svyazi",
    title: "Крым расширяет международные связи в роуп-скиппинге",
    summary:
      "Совместно с Всероссийской Федерацией Спортивной Скакалки — международные мастер-классы, образовательные интенсивы и обмен опытом.",
    content: "",
    category: "Сотрудничество",
    coverImage: "/images/news-4.avif",
    showOnHomepage: true,
    isMainNews: false,
    isImportant: true,
    isPinned: false,
    homepageOrder: 4,
    status: "published",
    requiresVerification: false,
    externalPlatform: "telegram",
    externalUrl: TEMPORARY_TELEGRAM_LINK,
    linkRequiresVerification: true,
  },
];

const MIN_ARTICLE_LENGTH = 40;

/**
 * Материал считается готовым к внутреннему чтению только при наличии полноценного
 * текста: пробелы, пустая HTML-разметка, короткая заглушка и текст, совпадающий с
 * summary, полноценным текстом не считаются.
 */
export function hasArticleText(article: FederationNewsArticle): boolean {
  const text = article.content.replace(/<[^>]*>/g, "").trim();
  if (text.length < MIN_ARTICLE_LENGTH) return false;
  if (text === article.summary.trim()) return false;
  return true;
}

/**
 * Только опубликованные новости — единственный источник для публичных страниц.
 * Видимость зависит исключительно от status; флаг requiresVerification карточку
 * не скрывает. Порядок сохраняется по homepageOrder.
 */
export const publishedNews = federationNews
  .filter((article) => article.status === "published")
  .sort((a, b) => a.homepageOrder - b.homepageOrder);

export const homepageNews = publishedNews.filter((article) => article.showOnHomepage);

/** Только новости, у которых есть полноценный внутренний текст (для /news/[slug]). */
export const readableNews = publishedNews.filter(hasArticleText);

export function getPublishedNewsBySlug(slug: string): FederationNewsArticle | undefined {
  return readableNews.find((article) => article.slug === slug);
}
