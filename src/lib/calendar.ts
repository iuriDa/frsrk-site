import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Единый источник событий сайта.
 *
 * Таблица Supabase `calendar_events` — основной источник и для страницы /calendar,
 * и для блока «ближайшие события» на главной. Модель и маппинг строк повторяют
 * автономный календарь ФРСРК (index.html), чтобы данные были совместимы.
 */

export type CalendarCategory = "vs" | "mr" | "reg" | "fest" | "edu";

export interface CalendarCategoryMeta {
  name: string;
  color: string;
}

export const CATEGORIES: Record<CalendarCategory, CalendarCategoryMeta> = {
  vs: { name: "Всероссийские", color: "#0a6cff" },
  mr: { name: "Межрегиональные (ЮФО)", color: "#8e44d0" },
  reg: { name: "Региональные", color: "#1a9c4c" },
  fest: { name: "Фестивали и массовые", color: "#0f9aa8" },
  edu: { name: "Учебно-методические", color: "#e08400" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CalendarCategory[];

export interface CalendarEvent {
  id: string;
  cat: CalendarCategory;
  title: string;
  tbd: boolean;
  /** ISO YYYY-MM-DD при точных датах */
  start?: string;
  end?: string;
  year: number;
  month: number;
  place: string;
  rank: string;
  org: string;
  ekp: boolean;
}

/** Строка таблицы calendar_events в Supabase. */
export interface CalendarEventRow {
  id: string;
  title: string;
  cat: string;
  tbd: boolean;
  starts_on: string | null;
  ends_on: string | null;
  yr: number;
  mo: number;
  place: string | null;
  rank: string | null;
  org: string | null;
  ekp: boolean;
  updated_at?: string;
}

export const TABLE = "calendar_events";
export const MIN_YEAR = 2015;
export const MAX_YEAR = 2045;

export const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
export const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function normalizeEvent(raw: Partial<CalendarEvent> & { id?: string }): CalendarEvent {
  const cat = (CATEGORY_KEYS.includes(raw.cat as CalendarCategory) ? raw.cat : "reg") as CalendarCategory;
  const tbd = Boolean(raw.tbd);
  if (tbd) {
    const year = Number(raw.year) || new Date().getFullYear();
    const month = Number(raw.month) || 1;
    return {
      id: String(raw.id ?? ""),
      cat, tbd: true, year, month,
      title: raw.title ?? "",
      place: raw.place ?? "", rank: raw.rank ?? "", org: raw.org ?? "",
      ekp: Boolean(raw.ekp),
    };
  }
  const start = raw.start || `${new Date().getFullYear()}-01-01`;
  const end = !raw.end || raw.end < start ? start : raw.end;
  return {
    id: String(raw.id ?? ""),
    cat, tbd: false, start, end,
    year: Number(start.slice(0, 4)),
    month: Number(start.slice(5, 7)),
    title: raw.title ?? "",
    place: raw.place ?? "", rank: raw.rank ?? "", org: raw.org ?? "",
    ekp: Boolean(raw.ekp),
  };
}

export function fromRow(r: CalendarEventRow): CalendarEvent {
  return normalizeEvent({
    id: String(r.id),
    title: r.title,
    cat: r.cat as CalendarCategory,
    tbd: Boolean(r.tbd),
    start: r.starts_on ?? undefined,
    end: r.ends_on ?? undefined,
    year: r.yr,
    month: r.mo,
    place: r.place ?? "",
    rank: r.rank ?? "",
    org: r.org ?? "",
    ekp: Boolean(r.ekp),
  });
}

export function toRow(e: CalendarEvent): CalendarEventRow {
  return {
    id: String(e.id),
    title: e.title,
    cat: e.cat,
    tbd: e.tbd,
    starts_on: e.tbd ? null : e.start ?? null,
    ends_on: e.tbd ? null : e.end ?? null,
    yr: e.year,
    mo: e.month,
    place: e.place,
    rank: e.rank,
    org: e.org,
    ekp: e.ekp,
    updated_at: new Date().toISOString(),
  };
}

/** Ключ сортировки: события без точной даты (tbd) идут после точных дат того же месяца (день «99»). */
export function sortKey(e: CalendarEvent): string {
  return e.tbd ? `${e.year}-${pad(e.month)}-99` : e.start ?? `${e.year}-${pad(e.month)}-01`;
}

export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => sortKey(a).localeCompare(sortKey(b)) || a.title.localeCompare(b.title, "ru"));
}

/**
 * Ближайшие непрошедшие события для главной.
 * - точные даты сортируются по starts_on, текущее (идущее сейчас) событие учитывается;
 * - tbd учитывается по году/месяцу и располагается после точных дат того же месяца.
 */
export function getUpcomingEvents(events: CalendarEvent[], limit = 4, now: Date = new Date()): CalendarEvent[] {
  const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  const notPast = events.filter((e) => {
    if (e.tbd) {
      return e.year > curYear || (e.year === curYear && e.month >= curMonth);
    }
    // Непрошедшее = ещё не завершилось (end >= сегодня). Идущее сейчас учитывается.
    return (e.end ?? e.start ?? "") >= todayIso;
  });

  return sortEvents(notPast).slice(0, limit);
}

/** Читает события только из Supabase. Встроенные/mock-события не используются. */
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  const { data, error } = await sb.from(TABLE).select("*");
  if (error) throw error;
  return sortEvents(((data ?? []) as CalendarEventRow[]).map(fromRow));
}

export { isSupabaseConfigured };

/** Форматирование дат события (для карточек и списка). */
export function formatEventDates(e: CalendarEvent, withYear = false): string {
  const y = withYear ? " " + e.year : "";
  if (e.tbd) return "В течение месяца · " + MONTHS[e.month - 1].toLowerCase() + y;
  const [y1, m1, d1] = (e.start as string).split("-").map(Number);
  const [y2, m2, d2] = (e.end as string).split("-").map(Number);
  if (e.start === e.end) return `${d1} ${MONTHS_GEN[m1 - 1]}${y}`;
  if (y1 !== y2) return `${d1} ${MONTHS_GEN[m1 - 1]} ${y1} – ${d2} ${MONTHS_GEN[m2 - 1]} ${y2}`;
  if (m1 === m2) return `${d1}–${d2} ${MONTHS_GEN[m1 - 1]}${y}`;
  return `${d1} ${MONTHS_GEN[m1 - 1]} – ${d2} ${MONTHS_GEN[m2 - 1]}${y}`;
}
