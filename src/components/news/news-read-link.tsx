import Link from "next/link";
import { ArrowRight, MessageCircle, Send } from "lucide-react";
import { hasArticleText, type FederationNewsArticle, type NewsPlatform } from "@/content/news";

const platformIcon: Record<NewsPlatform, typeof Send> = { telegram: Send, vk: MessageCircle };
const platformName: Record<NewsPlatform, string> = { telegram: "Telegram", vk: "ВКонтакте" };

// externalUrl ведёт на конкретный подтверждённый пост — можно предложить «читать» именно эту новость.
const platformReadLabel: Record<NewsPlatform, string> = { telegram: "Читать в Telegram", vk: "Читать во ВКонтакте" };

// linkRequiresVerification: true — точный пост не подтверждён, ссылка временно ведёт на
// общий канал/сообщество федерации. Формулировка не должна обещать чтение именно этой новости.
const platformChannelLabel: Record<NewsPlatform, string> = {
  telegram: "Перейти в Telegram-канал",
  vk: "Перейти в сообщество ВКонтакте",
};
const platformChannelAriaLabel: Record<NewsPlatform, string> = {
  telegram: "Перейти в официальный Telegram-канал Федерации",
  vk: "Перейти в официальное сообщество ВКонтакте Федерации",
};

/**
 * Кнопка «Читать» новости: ведёт на внутреннюю страницу, если есть полноценный
 * текст, иначе — на внешнюю публикацию (VK/Telegram). Если нет ни текста, ни
 * externalUrl, кнопка не отображается (в development выводится предупреждение
 * в консоль сервера, публичному пользователю ничего не показывается).
 */
export function NewsReadLink({
  article,
  className,
  arrowSize = 16,
  iconSize = 16,
}: {
  article: FederationNewsArticle;
  className?: string;
  arrowSize?: number;
  iconSize?: number;
}) {
  if (hasArticleText(article)) {
    return (
      <Link href={`/news/${article.slug}`} className={className}>
        Читать
        <ArrowRight size={arrowSize} aria-hidden="true" />
      </Link>
    );
  }

  if (article.externalUrl && article.externalPlatform) {
    const Icon = platformIcon[article.externalPlatform];
    const isTemporaryChannelLink = article.linkRequiresVerification === true;
    const label = isTemporaryChannelLink
      ? platformChannelLabel[article.externalPlatform]
      : platformReadLabel[article.externalPlatform];
    const ariaLabel = isTemporaryChannelLink
      ? platformChannelAriaLabel[article.externalPlatform]
      : `${article.title} — читать в ${platformName[article.externalPlatform]}`;

    return (
      <a href={article.externalUrl} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={className}>
        <Icon size={iconSize} aria-hidden="true" />
        {label}
        <ArrowRight size={arrowSize} aria-hidden="true" />
      </a>
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[news] У материала «${article.title}» (${article.slug}) нет ни внутреннего текста, ни externalUrl — кнопка "Читать" не отображается.`,
    );
  }
  return null;
}
