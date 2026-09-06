import Link from "next/link";
import { FileClock } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-white px-6 py-10 text-center md:px-10">
      <span className="mx-auto grid size-11 place-items-center rounded-[var(--radius-compact)] bg-[var(--surface-muted)] text-[var(--blue-700)]">
        <FileClock size={20} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-extrabold tracking-[-0.02em] text-[var(--navy-950)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[var(--text-muted)]">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="btn btn-primary mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
