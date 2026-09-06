import { siteSettings } from "@/content/site-settings";
import { cn } from "@/lib/utils";

function VkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M12.785 16.241s.288-.032.435-.193c.135-.148.131-.426.131-.426s-.019-1.298.583-1.491c.594-.19 1.357 1.265 2.165 1.825.611.422 1.075.331 1.075.331l2.17-.03s1.135-.07.597-.967c-.044-.073-.313-.66-1.612-1.864-1.36-1.262-1.18-1.057.46-3.252.998-1.337 1.398-2.146 1.273-2.494-.118-.33-.85-.243-.85-.243l-2.434.015s-.181-.025-.314.054c-.131.078-.215.26-.215.26s-.388 1.034-.906 1.913c-1.092 1.853-1.529 1.951-1.708 1.835-.413-.267-.31-1.071-.31-1.642 0-1.789.272-2.535-.529-2.728-.265-.064-.46-.107-1.139-.114-.871-.009-1.609.003-2.027.208-.278.136-.493.439-.362.456.162.022.529.099.724.365.252.342.243 1.111.243 1.111s.144 2.114-.339 2.378c-.331.18-.785-.187-1.759-1.871-.499-.86-.876-1.812-.876-1.812s-.073-.179-.202-.275c-.156-.116-.374-.153-.374-.153l-2.314.015s-.347.01-.475.161c-.114.135-.009.413-.009.413s1.812 4.243 3.864 6.38c1.881 1.96 4.018 1.832 4.018 1.832z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

/**
 * Ссылки на соцсети Федерации. Используются в белой полосе шапки (tone="light")
 * и в мобильном меню на тёмном фоне (tone="dark").
 */
export function SocialLinks({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const buttonClass =
    tone === "dark"
      ? "text-white/85 hover:bg-white/10 hover:text-white"
      : "text-[var(--navy-800)] hover:bg-[var(--surface-muted)] hover:text-[var(--crimea-blue)]";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <a
        href={siteSettings.social.vk}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Федерация во ВКонтакте"
        title="ВКонтакте"
        className={cn("grid size-7 place-items-center rounded-md transition", buttonClass)}
      >
        <VkIcon />
      </a>
      <a
        href={siteSettings.social.telegram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Федерация в Telegram"
        title="Telegram"
        className={cn("grid size-7 place-items-center rounded-md transition", buttonClass)}
      >
        <TelegramIcon />
      </a>
    </div>
  );
}
