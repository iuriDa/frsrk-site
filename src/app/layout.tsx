import type { Metadata } from "next";
import "./globals.css";
import { siteSettings } from "@/content/site-settings";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteSettings.officialName,
    template: `%s — ${siteSettings.shortName}`,
  },
  description: siteSettings.description,
  openGraph: {
    title: siteSettings.officialName,
    description: siteSettings.description,
    locale: "ru_RU",
    type: "website",
    images: [{ url: "/brand/frsrk-logo.png", width: 577, height: 433 }],
  },
  icons: { icon: "/brand/frsrk-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
