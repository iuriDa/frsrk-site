import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  trail?: Array<{ label: string; href?: string }>;
}

export function PageHero({ eyebrow, title, description, trail = [] }: PageHeroProps) {
  return (
    <section className="hero-glow relative overflow-hidden py-8 text-white md:py-14">
      <div className="pointer-events-none absolute inset-0 surface-grid opacity-20" />
      <div className="site-container relative">
        <nav aria-label="Хлебные крошки" className="mb-6 flex flex-wrap items-center gap-2 text-[13px] text-white/65">
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
            <Home size={14} aria-hidden="true" />
            Главная
          </Link>
          {trail.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2">
              <ChevronRight size={13} aria-hidden="true" />
              {item.href ? (
                <Link href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-white/90">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
        {eyebrow ? (
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#f5cc73]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-balance text-[1.9rem] font-black leading-[1.1] tracking-[-0.02em] md:text-[2.6rem] md:leading-[1.08]">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-white/76 md:text-base">{description}</p>
      </div>
    </section>
  );
}
