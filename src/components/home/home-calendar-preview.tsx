"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSupabaseClient } from "@/lib/supabase";
import {
  TABLE, fetchCalendarEvents, formatEventDates, getUpcomingEvents,
  type CalendarEvent,
} from "@/lib/calendar";

/**
 * Блок «ближайшие события» на главной. Читает те же данные, что и /calendar
 * (таблица Supabase calendar_events через общий модуль). Встроенные/mock-события
 * не используются: показываются только записи, добавленные администратором.
 */
export function HomeCalendarPreview() {
  const sb = useMemo(() => getSupabaseClient(), []);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchCalendarEvents()
      .then((list) => { if (!cancelled) setEvents(list); })
      .catch(() => { if (!cancelled) setEvents([]); });
    if (!sb) return () => { cancelled = true; };
    const channel = sb
      .channel("frsrk-home-cal")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => {
        fetchCalendarEvents()
          .then((list) => { if (!cancelled) setEvents(list); })
          .catch(() => { if (!cancelled) setEvents([]); });
      })
      .subscribe();
    return () => { cancelled = true; sb.removeChannel(channel); };
  }, [sb]);

  const upcoming = useMemo(() => getUpcomingEvents(events, 4), [events]);

  return (
    <section className="section-space bg-white">
      <div className="site-container grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <SectionHeading eyebrow="Ближайшие события" title="Календарь Федерации" description="Мероприятия, в которых участвуют спортсмены Республики Крым." />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/calendar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--navy-950)] px-5 text-sm font-extrabold text-white transition hover:bg-[var(--blue-700)]">
              Открыть календарь
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {upcoming.length > 0 ? (
          <div className="grid gap-4">
            {upcoming.map((event) => (
              <div key={event.id} className="flex gap-5 rounded-[20px] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf2fb] text-[var(--blue-700)]">
                  <CalendarDays size={21} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--red-700)]">{formatEventDates(event, event.year !== new Date().getFullYear())}</p>
                    {event.tbd ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-amber-800">Дата уточняется</span>
                    ) : null}
                  </div>
                  <h3 className="mt-1.5 text-sm font-black leading-snug text-[var(--navy-950)]">{event.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">{event.place}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center">
            <CalendarDays size={26} className="mx-auto text-[var(--blue-700)]" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-[var(--navy-950)]">Ближайшие мероприятия пока не опубликованы</p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">Подтверждённые события появятся здесь после внесения официальных данных.</p>
          </div>
        )}
      </div>
    </section>
  );
}
