import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Базовые заголовки безопасности для всех маршрутов.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Защита от встраивания сайта в чужой iframe.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Минимальная безопасная CSP: запрещает фрейминг сторонними сайтами и не ломает
  // работу приложения. TODO (этап безопасности): подключить полноценную CSP
  // (script-src / style-src и т. д.) только после тестирования — иначе inline-скрипты
  // и стили Next.js / Tailwind перестанут работать.
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

// HSTS включаем только в production (заголовок действует лишь поверх HTTPS).
if (isProduction) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      // Единая страница персональных данных.
      { source: "/legal/privacy", destination: "/legal/personal-data", permanent: true },
      // Единая страница реквизитов.
      { source: "/legal/requisites", destination: "/about/requisites", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
