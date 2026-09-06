"use client";

import Link from "next/link";
import { Building2, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Municipality } from "@/content/municipalities";

export function MunicipalityExplorer({ items }: { items: Municipality[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ru-RU");
    if (!needle) return items;
    return items.filter((item) => `${item.name} ${item.kind} ${item.summary}`.toLocaleLowerCase("ru-RU").includes(needle));
  }, [items, query]);

  return (
    <div>
      <label className="relative block max-w-2xl">
        <span className="sr-only">Найти муниципалитет</span>
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Введите город или район"
          className="h-11 w-full rounded-[var(--radius-btn)] border border-[var(--border)] bg-white pl-12 pr-4 text-sm text-[var(--navy-950)] focus:border-[var(--blue-500)] focus:outline-none"
        />
      </label>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Link key={item.slug} href={`/municipalities/${item.slug}`} className="ui-card group p-5 transition hover:border-[var(--blue-500)] hover:shadow-[0_1px_2px_rgba(7,20,38,.04),0_8px_24px_rgba(7,20,38,.06)]">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-11 place-items-center rounded-[var(--radius-compact)] bg-[#eaf2fb] text-[var(--blue-700)]">
                <Building2 size={20} aria-hidden="true" />
              </span>
              <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--text-muted)]">{item.kind}</span>
            </div>
            <h2 className="mt-4 text-lg font-extrabold tracking-[-0.02em] text-[var(--navy-950)]">{item.name}</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{item.summary}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-700)]">
              <MapPin size={16} aria-hidden="true" />
              Открыть муниципалитет
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-white p-6 text-center">
          <p className="font-black text-[var(--navy-950)]">Муниципалитет не найден</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Измените запрос или очистите строку поиска.</p>
        </div>
      ) : null}
    </div>
  );
}
