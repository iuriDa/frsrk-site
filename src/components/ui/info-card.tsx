import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  label?: string;
}

export function InfoCard({ icon: Icon, title, description, href, label = "Подробнее" }: InfoCardProps) {
  return (
    <Link
      href={href}
      className="ui-card group flex flex-col p-6 transition hover:border-[var(--blue-500)] hover:shadow-[0_1px_2px_rgba(7,20,38,.04),0_8px_24px_rgba(7,20,38,.06)]"
    >
      <span className="grid size-11 place-items-center rounded-[var(--radius-compact)] bg-[#eaf2fb] text-[var(--blue-700)] transition group-hover:bg-[var(--blue-700)] group-hover:text-white">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-extrabold tracking-[-0.02em] text-[var(--navy-950)]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-7 text-[var(--text-muted)]">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-700)]">
        {label}
        <ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
