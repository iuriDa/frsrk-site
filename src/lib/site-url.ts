/**
 * Единый источник адреса сайта.
 *
 * Приоритет: переменная окружения NEXT_PUBLIC_SITE_URL. Для локальной разработки —
 * fallback на http://localhost:3002. В production переменная обязательна: если она
 * не задана, функция выбрасывает понятную ошибку вместо того, чтобы молча
 * опубликовать localhost в metadata, sitemap и robots.
 */
const DEV_FALLBACK = "http://localhost:3002";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    // Домен ещё не выбран (этап дорожной карты «Домен»). Перед production-сборкой
    // владелец сайта обязан указать реальный адрес в NEXT_PUBLIC_SITE_URL —
    // без него сборка не должна молча опубликовать localhost.
    throw new Error(
      "[site-url] NEXT_PUBLIC_SITE_URL не задан. Production-сборка с адресом http://localhost:3002 запрещена — " +
        "укажите реальный домен Федерации в переменной окружения NEXT_PUBLIC_SITE_URL перед сборкой.",
    );
  }

  return DEV_FALLBACK;
}
