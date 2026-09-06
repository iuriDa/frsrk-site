"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarPlus, ChevronLeft, ChevronRight, Download, LogIn, LogOut, Pencil, Printer, Trash2,
} from "lucide-react";
import styles from "./calendar-app.module.css";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  CATEGORIES, CATEGORY_KEYS, MAX_YEAR, MIN_YEAR, MONTHS, MONTHS_GEN, TABLE,
  fetchCalendarEvents, formatEventDates, sortEvents, sortKey, toRow,
  type CalendarCategory, type CalendarEvent, type CalendarEventRow,
} from "@/lib/calendar";

const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const LBL: Record<string, string> = { title: "Название", dates: "Даты", cat: "Категория", place: "Место", rank: "Ранг / уровень", org: "Организаторы", ekp: "ЕКП" };
const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const localIsoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const uid = () => (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : "e" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
const plural = (n: number, a: string, b: string, c: string) => { const m = n % 100, k = n % 10; return m >= 11 && m <= 14 ? c : k === 1 ? a : k >= 2 && k <= 4 ? b : c; };

type Change = { k: string; a: string; b: string };
type ModalState =
  | { kind: "form"; editingId: string | null }
  | { kind: "diff"; editingId: string; changes: Change[] }
  | { kind: "delete"; id: string }
  | null;
type ViewYear = number | "all";

function blankDraft(year: number, day?: string): CalendarEvent {
  const d = day || (year === new Date().getFullYear() ? localIsoOf(new Date()) : `${year}-01-01`);
  return { id: "", cat: "reg", title: "", tbd: false, start: d, end: d, year: +d.slice(0, 4), month: +d.slice(5, 7), place: "Симферополь", rank: "Региональный", org: "ОО ФРСРК", ekp: false };
}
function valOf(e: CalendarEvent, k: string): string {
  if (k === "dates") return formatEventDates(e, true);
  if (k === "cat") return CATEGORIES[e.cat].name;
  if (k === "ekp") return e.ekp ? "Да" : "Нет";
  return String((e as unknown as Record<string, unknown>)[k] ?? "");
}
function diffEvents(a: CalendarEvent, b: CalendarEvent): Change[] {
  return ["title", "dates", "cat", "place", "rank", "org", "ekp"].map((k) => ({ k, a: valOf(a, k), b: valOf(b, k) })).filter((c) => c.a !== c.b);
}
function isUpcomingOrCurrent(e: CalendarEvent, now = new Date()): boolean {
  const todayIso = localIsoOf(now);
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  if (e.tbd) return e.year > curYear || (e.year === curYear && e.month >= curMonth);
  return (e.end ?? e.start ?? "") >= todayIso;
}

function firstUpcomingEvent(list: CalendarEvent[], now = new Date()): CalendarEvent | undefined {
  return sortEvents(list).find((e) => isUpcomingOrCurrent(e, now));
}

/** Год для показа при загрузке: текущий или год ближайшего будущего события. */
function pickYear(list: CalendarEvent[], now = new Date()): number {
  return firstUpcomingEvent(list, now)?.year ?? now.getFullYear();
}

function monthFocus(list: CalendarEvent[], now = new Date()): { year: number; month: number } {
  const current = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const upcoming = firstUpcomingEvent(list, now);
  if (!upcoming || upcoming.year === current.year) return current;
  return { year: upcoming.year, month: upcoming.month };
}

function monthOrder(year: number, focus: { year: number; month: number }): number[] {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  if (year !== focus.year) return months;
  return [...months.slice(focus.month - 1), ...months.slice(0, focus.month - 1)];
}

function sortEventsFromMonth(events: CalendarEvent[], focus: { year: number; month: number }): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const monthA = (a.month - focus.month + 12) % 12;
    const monthB = (b.month - focus.month + 12) % 12;
    return monthA - monthB || sortKey(a).localeCompare(sortKey(b)) || a.title.localeCompare(b.title, "ru");
  });
}

const ctrl = "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--navy-950)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-500)]";
const ctrlPrimary = "inline-flex items-center gap-1.5 rounded-full border border-[var(--navy-950)] bg-[var(--navy-950)] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-500)] disabled:opacity-60";
const ctrlDanger = "inline-flex items-center gap-1.5 rounded-full border border-[var(--red-700)] bg-[var(--red-700)] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[var(--red-500)]";
const ctrlGhost = "inline-flex items-center gap-1.5 rounded-full border border-transparent bg-transparent px-3.5 py-2 text-[13px] font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--navy-950)]";

export function CalendarApp({ adminMode = false }: { adminMode?: boolean }) {
  const sb = useMemo(() => getSupabaseClient(), []);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [active, setActive] = useState<Set<CalendarCategory>>(() => new Set(CATEGORY_KEYS));
  const [view, setView] = useState<ViewYear>(() => pickYear([]));
  const [sel, setSel] = useState<string | null>(null);
  const [hov, setHov] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [authed, setAuthed] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [userLabel, setUserLabel] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [draft, setDraft] = useState<CalendarEvent | null>(null);
  const [formErr, setFormErr] = useState<{ title: boolean; dates: boolean }>({ title: false, dates: false });
  const [login, setLogin] = useState({ email: "", password: "", err: "", busy: false });
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);

  const undoRef = useRef<CalendarEvent[] | null>(null);
  const listRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const toastTimer = useRef<number | null>(null);
  const saveTimer = useRef<number | null>(null);

  const mayEdit = adminMode && isSupabaseConfigured && canEdit;

  const yearsWithEvents = useMemo(() => [...new Set(events.map((e) => e.year))].sort((a, b) => a - b), [events]);
  const sorted = useMemo(() => sortEvents(events), [events]);
  const shown = useCallback((e: CalendarEvent) => active.has(e.cat), [active]);
  const inView = useCallback((e: CalendarEvent) => view === "all" || e.year === view, [view]);

  const showToast = useCallback((msg: string, undo?: () => void) => {
    setToast({ msg, undo });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 8000);
  }, []);
  const flashSave = useCallback((msg: string) => {
    setSaveMsg(msg);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaveMsg(""), 4000);
  }, []);

  const refreshEditor = useCallback(async () => {
    if (!sb) { setAuthed(false); setCanEdit(false); return; }
    const { data } = await sb.auth.getSession();
    const session = data.session;
    setAuthed(!!session);
    setUserLabel(session?.user?.email ?? "");
    if (session) {
      try { const { data: ok, error } = await sb.rpc("is_calendar_editor"); setCanEdit(!error && ok === true); }
      catch { setCanEdit(false); }
    } else setCanEdit(false);
  }, [sb]);

  const reload = useCallback(async () => {
    if (!sb) {
      setEvents([]);
      setLoading(false);
      setOnline(false);
      setLoadError("");
      return;
    }
    try {
      setLoading(true);
      setLoadError("");
      setEvents(await fetchCalendarEvents());
      setOnline(true);
    } catch (error) {
      setEvents([]);
      setOnline(false);
      setLoadError(error instanceof Error ? error.message : "Не удалось загрузить календарь из Supabase");
    } finally {
      setLoading(false);
    }
  }, [sb]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sb) {
        setEvents([]);
        setView(pickYear([]));
        setLoading(false);
        setOnline(false);
        setLoadError("");
        return;
      }
      await refreshEditor();
      try {
        setLoading(true);
        setLoadError("");
        const list = await fetchCalendarEvents();
        if (!cancelled) { setEvents(list); setView(pickYear(list)); setOnline(true); setLoading(false); }
      } catch (error) {
        if (!cancelled) {
          setEvents([]);
          setView(pickYear([]));
          setOnline(false);
          setLoading(false);
          setLoadError(error instanceof Error ? error.message : "Не удалось загрузить календарь из Supabase");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [sb, refreshEditor]);

  useEffect(() => {
    if (!sb) return;
    const { data: authSub } = sb.auth.onAuthStateChange(() => { refreshEditor(); });
    const channel = sb.channel("frsrk-cal")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => { reload(); flashSave("Обновлено"); })
      .subscribe();
    return () => { authSub.subscription.unsubscribe(); sb.removeChannel(channel); };
  }, [sb, refreshEditor, reload, flashSave]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (modal) setModal(null); else setSel(null); return; }
      if (e.target === document.body && typeof view === "number") {
        if (e.key === "ArrowLeft") setView(Math.max(MIN_YEAR, view - 1));
        if (e.key === "ArrowRight") setView(Math.min(MAX_YEAR, view + 1));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal, view]);

  const applyLocal = (next: CalendarEvent[]) => setEvents(sortEvents(next));

  async function persistInsert(e: CalendarEvent) {
    if (!sb || !canEdit) return;
    const { error } = await sb.from(TABLE).insert(toRow(e) as unknown as CalendarEventRow);
    flashSave(error ? "Не сохранилось: " + (error.message || "ошибка") : "Сохранено — видно всем");
  }
  async function persistUpdate(e: CalendarEvent) {
    if (!sb || !canEdit) return;
    const { error } = await sb.from(TABLE).update(toRow(e) as unknown as CalendarEventRow).eq("id", e.id);
    flashSave(error ? "Не сохранилось: " + (error.message || "ошибка") : "Сохранено — видно всем");
  }
  async function persistDelete(id: string) {
    if (!sb || !canEdit) return;
    const { error } = await sb.from(TABLE).delete().eq("id", id);
    if (error) flashSave("Не удалилось: " + (error.message || "ошибка"));
  }

  function focusOn(e: CalendarEvent) {
    if (!inView(e)) setView(e.year);
    setActive((prev) => new Set(prev).add(e.cat));
    setSel(e.id);
  }
  function undoAction() {
    if (!undoRef.current) return;
    const snap = undoRef.current; undoRef.current = null;
    applyLocal(snap); setSel(null); setToast(null);
    if (sb && canEdit) {
      (async () => {
        await sb.from(TABLE).upsert(snap.map((e) => toRow(e) as unknown as CalendarEventRow));
        const { data } = await sb.from(TABLE).select("id");
        const keep = new Set(snap.map((e) => e.id));
        const extra = (data ?? []).map((r) => String((r as { id: string }).id)).filter((id) => !keep.has(id));
        if (extra.length) await sb.from(TABLE).delete().in("id", extra);
      })();
    }
    showToast("Действие отменено");
  }
  function commitAdd(d: CalendarEvent) {
    undoRef.current = events.map((e) => ({ ...e }));
    const withId = { ...d, id: uid() };
    applyLocal([...events, withId]); focusOn(withId); setModal(null);
    persistInsert(withId); showToast("Мероприятие добавлено", undoAction);
  }
  function commitEdit(d: CalendarEvent) {
    undoRef.current = events.map((e) => ({ ...e }));
    applyLocal(events.map((e) => (e.id === d.id ? d : e))); focusOn(d); setModal(null);
    persistUpdate(d); showToast("Изменения сохранены", undoAction);
  }
  function commitDelete(id: string) {
    undoRef.current = events.map((e) => ({ ...e }));
    applyLocal(events.filter((e) => e.id !== id));
    if (sel === id) setSel(null);
    setModal(null); persistDelete(id); showToast("Мероприятие удалено", undoAction);
  }

  async function submitLogin() {
    if (!sb) { setLogin((s) => ({ ...s, err: "Общая база не подключена" })); return; }
    setLogin((s) => ({ ...s, busy: true, err: "" }));
    const { data, error } = await sb.auth.signInWithPassword({ email: login.email.trim(), password: login.password });
    if (error) { setLogin((s) => ({ ...s, busy: false, err: error.message || "Неверная почта или пароль" })); return; }
    setAuthed(!!data.session); setUserLabel(data.session?.user?.email ?? "");
    await refreshEditor();
    setLogin({ email: "", password: "", err: "", busy: false });
    setModal(null); showToast("Вы вошли");
  }
  async function doLogout() {
    if (!sb) return;
    await sb.auth.signOut(); setCanEdit(false); setAuthed(false);
    showToast("Вы вышли — календарь в режиме просмотра");
  }

  function exportIcs() {
    const ie = (s: string) => String(s).replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
    const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FRSRK//Calendar//RU", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Календарный план ФРСРК"];
    events.filter(shown).forEach((e) => {
      const s = e.tbd ? `${e.year}-${pad(e.month)}-01` : (e.start as string);
      const last = e.tbd ? new Date(Date.UTC(e.year, e.month, 0)) : new Date((e.end as string) + "T00:00:00Z");
      last.setUTCDate(last.getUTCDate() + 1);
      L.push("BEGIN:VEVENT", `UID:frsrk-${e.id}@frsrk`, "DTSTAMP:20270101T000000Z",
        `DTSTART;VALUE=DATE:${s.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${isoOf(last).replace(/-/g, "")}`,
        `SUMMARY:${ie(e.title + (e.tbd ? " (дата уточняется)" : ""))}`, `LOCATION:${ie(e.place)}`,
        `DESCRIPTION:${ie(e.rank + ". " + e.org + (e.ekp ? ". Входит в ЕКП" : ""))}`, "END:VEVENT");
    });
    L.push("END:VCALENDAR");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([L.join("\r\n")], { type: "text/calendar;charset=utf-8" }));
    a.download = "kalendar-frsrk.ics"; a.click(); URL.revokeObjectURL(a.href);
  }

  function openForm(editingId: string | null, day?: string) {
    const src = editingId != null ? events.find((e) => e.id === editingId) : null;
    setDraft(src ? { ...src } : blankDraft(view === "all" ? (yearsWithEvents[0] ?? new Date().getFullYear()) : view, day));
    setFormErr({ title: false, dates: false });
    setModal({ kind: "form", editingId });
  }
  function setDraftPatch(patch: Partial<CalendarEvent>) { setDraft((cur) => (cur ? { ...cur, ...patch } : cur)); }

  function submitForm(editingId: string | null) {
    if (!draft) return;
    const title = draft.title.trim();
    const clean: CalendarEvent = { ...draft, title, place: (draft.place || "").trim() || "—", rank: (draft.rank || "").trim() || "—", org: (draft.org || "").trim() || "—" };
    let badTitle = false, badDates = false;
    if (!title) badTitle = true;
    if (draft.tbd) {
      clean.start = undefined; clean.end = undefined;
      if (!(draft.year >= MIN_YEAR && draft.year <= MAX_YEAR)) badDates = true;
    } else {
      const start = draft.start as string, end = (draft.end as string) < start ? start : (draft.end as string);
      clean.start = start; clean.end = end; clean.year = +start.slice(0, 4); clean.month = +start.slice(5, 7);
      if (!(start && end && end >= start && clean.year >= MIN_YEAR && +end.slice(0, 4) <= MAX_YEAR)) badDates = true;
    }
    setFormErr({ title: badTitle, dates: badDates });
    if (badTitle || badDates) return;
    if (editingId == null) { commitAdd(clean); return; }
    const old = events.find((e) => e.id === editingId)!;
    clean.id = editingId;
    const changes = diffEvents(old, clean);
    if (!changes.length) { setModal(null); showToast("Изменений нет"); return; }
    setDraft(clean);
    setModal({ kind: "diff", editingId, changes });
  }

  function selectDay(ids: string[]) {
    const id = ids[0];
    setSel((cur) => (cur === id ? null : id));
    const node = listRefs.current[id];
    if (node) node.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function stepYear(dir: -1 | 1) {
    if (view === "all") { setView(dir < 0 ? (yearsWithEvents[0] ?? new Date().getFullYear()) : (yearsWithEvents[yearsWithEvents.length - 1] ?? new Date().getFullYear())); return; }
    setView(dir < 0 ? Math.max(MIN_YEAR, view - 1) : Math.min(MAX_YEAR, view + 1));
  }
  function toggleCat(k: CalendarCategory) {
    setActive((prev) => { const next = new Set(prev); if (next.has(k)) next.delete(k); else next.add(k); return next; });
  }

  // derived
  const visible = sorted.filter((e) => shown(e) && inView(e));
  const focus = monthFocus(events);
  const todayIso = localIsoOf(new Date());
  const displayedYears = view === "all" ? (yearsWithEvents.length ? yearsWithEvents : [new Date().getFullYear()]) : [view];
  const multiYear = displayedYears.length > 1;
  const activeId = sel ?? hov;
  const stat = (() => {
    const total = visible.length, ekp = visible.filter((e) => e.ekp).length, tbd = visible.filter((e) => e.tbd).length;
    const scope = view === "all" ? (yearsWithEvents.length > 1 ? `, ${yearsWithEvents[0]}–${yearsWithEvents[yearsWithEvents.length - 1]}` : "") : ` в ${view}`;
    return `${total} ${plural(total, "мероприятие", "мероприятия", "мероприятий")}${scope} · ${ekp} в ЕКП · ${tbd} без точных дат`;
  })();
  const yearLabel = view === "all"
    ? (yearsWithEvents.length > 1 ? `${yearsWithEvents[0]}–${yearsWithEvents[yearsWithEvents.length - 1]}` : String(yearsWithEvents[0] ?? new Date().getFullYear()))
    : String(view);
  const hint = loading ? "Загрузка из Supabase…"
    : loadError ? "Ошибка загрузки Supabase"
    : !online ? (isSupabaseConfigured ? "Загрузка…" : "Supabase не подключён · мероприятий нет")
    : mayEdit ? "Общий календарь · вы можете редактировать"
    : adminMode && authed ? "Вход выполнен, прав на правку нет · только просмотр"
    : "Общий календарь · только просмотр";

  if (adminMode && !isSupabaseConfigured) {
    return (
      <div className={styles.app}>
        <section className={styles.adminGate}>
          <h2>Общая база не подключена</h2>
          <p>Календарный admin использует существующий Supabase Auth и RPC is_calendar_editor().</p>
        </section>
      </div>
    );
  }

  if (adminMode && !authed) {
    return (
      <div className={styles.app}>
        <form className={styles.adminGate} onSubmit={(event) => { event.preventDefault(); void submitLogin(); }}>
          <h2>Вход администратора</h2>
          <p>Используйте существующий аккаунт редактора календаря.</p>
          <div className={styles.f}>
            <label htmlFor="calendar-admin-email">Почта</label>
            <input
              type="email"
              id="calendar-admin-email"
              autoComplete="username"
              value={login.email}
              onChange={(event) => setLogin((state) => ({ ...state, email: event.target.value }))}
            />
          </div>
          <div className={`${styles.f} ${login.err ? styles.err : ""}`}>
            <label htmlFor="calendar-admin-password">Пароль</label>
            <input
              type="password"
              id="calendar-admin-password"
              autoComplete="current-password"
              value={login.password}
              onChange={(event) => setLogin((state) => ({ ...state, password: event.target.value }))}
            />
            <span className={styles.msg}>{login.err || "Неверная почта или пароль"}</span>
          </div>
          <button className={ctrlPrimary} type="submit" disabled={login.busy}>
            <LogIn size={15} aria-hidden="true" />
            {login.busy ? "Проверяю…" : "Войти"}
          </button>
        </form>
      </div>
    );
  }

  if (adminMode && authed && !canEdit) {
    return (
      <div className={styles.app}>
        <section className={styles.adminGate}>
          <h2>Нет прав на редактирование</h2>
          <p>Сессия найдена, но RPC is_calendar_editor() не подтвердила доступ.</p>
          <button className={ctrlGhost} type="button" onClick={doLogout} title={userLabel}>
            <LogOut size={15} aria-hidden="true" />
            Выйти
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.top}>
        <div className={styles.ynav} role="group" aria-label="Выбор года">
          <button className={styles.arw} onClick={() => stepYear(-1)} aria-label="Предыдущий год"><ChevronLeft aria-hidden="true" /></button>
          <div className={`${styles.year} ${view === "all" ? styles.yearSpan : ""}`} aria-live="polite">{yearLabel}</div>
          <button className={styles.arw} onClick={() => stepYear(1)} aria-label="Следующий год"><ChevronRight aria-hidden="true" /></button>
        </div>
        <div className={styles.head}>
          <h2>Календарный план Федерации роуп скиппинга (спортивной скакалки) Республики&nbsp;Крым</h2>
          <p>{stat}</p>
        </div>
        <div className={styles.toolbar}>
          {mayEdit ? <button className={ctrlPrimary} onClick={() => openForm(null)}><CalendarPlus size={15} aria-hidden="true" />Мероприятие</button> : null}
          <button className={ctrl} onClick={exportIcs}><Download size={15} aria-hidden="true" />Скачать .ics</button>
          <button className={ctrl} onClick={() => window.print()}><Printer size={15} aria-hidden="true" />Печать</button>
          {adminMode && isSupabaseConfigured && authed ? <button className={ctrlGhost} onClick={doLogout} title={userLabel}><LogOut size={15} aria-hidden="true" />Выйти</button> : null}
        </div>
      </header>

      <div className={styles.years}>
        {[...new Set([...yearsWithEvents, ...(typeof view === "number" ? [view] : [])])].sort((a, b) => a - b).map((y) => {
          const n = events.filter((e) => e.year === y).length;
          return <button key={y} className={styles.yr} aria-pressed={view === y} onClick={() => { setSel(null); setView(y); }}>{y}{n ? <span className={styles.n}>{n}</span> : null}</button>;
        })}
        {yearsWithEvents.length > 1 ? <button className={styles.yr} aria-pressed={view === "all"} onClick={() => { setSel(null); setView("all"); }}>Все годы</button> : null}
      </div>

      <div className={styles.chips}>
        {CATEGORY_KEYS.map((k) => {
          const pool = events.filter(inView);
          return (
            <button key={k} className={styles.chip} style={{ ["--c" as string]: CATEGORIES[k].color }} aria-pressed={active.has(k)} onClick={() => toggleCat(k)}>
              <i className={styles.sw} />{CATEGORIES[k].name}<span className={styles.n}>{pool.filter((e) => e.cat === k).length}</span>
            </button>
          );
        })}
      </div>

      {loadError ? <div className={styles.loadError} role="alert">Не удалось загрузить календарь из Supabase: {loadError}</div> : null}

      <div className={styles.grid}>
        <aside className={styles.side} aria-label="Хронология мероприятий">
          <div className={styles.sideH}>
            <div>
              <b>Хронология</b>
              <span className={styles.live} aria-live="polite">{saveMsg || hint}</span>
            </div>
          </div>
          <div>{renderTimeline()}</div>
        </aside>
        <main className={styles.cal + (activeId ? " " + styles.dim : "")} aria-label="Календарь по месяцам">{renderCalendar()}</main>
      </div>

      {modal ? (
        <div className={styles.sheetBg} onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="cal-sheet-title">
            {modal.kind === "form" ? renderForm(modal.editingId) : null}
            {modal.kind === "diff" ? renderDiff(modal) : null}
            {modal.kind === "delete" ? renderDelete(modal.id) : null}
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={styles.toast} role="status">
          <span>{toast.msg}</span>
          {toast.undo ? <button onClick={toast.undo}>Отменить</button> : null}
        </div>
      ) : null}
    </div>
  );

  function renderTimeline() {
    if (loading) return <div className={styles.empty}>Загружаем мероприятия из Supabase…</div>;
    if (!events.length) return <div className={styles.empty}>Мероприятия пока не опубликованы.<br />Календарь показывает только данные, добавленные администратором в Supabase.</div>;
    if (!visible.length) return <div className={styles.empty}>{view === "all" ? "Мероприятий нет." : `В ${view} году мероприятий нет.`}<br />Проверьте фильтры категорий.</div>;
    const out: React.ReactNode[] = [];
    let cur = "";
    const timeline = view === focus.year ? sortEventsFromMonth(visible, focus) : visible;
    timeline.forEach((e) => {
      const key = e.year + "-" + e.month;
      if (key !== cur) { cur = key; out.push(<div key={"h" + key} className={styles.mgroupH}>{MONTHS[e.month - 1]}{multiYear ? <em> {e.year}</em> : null}</div>); }
      out.push(
        <div key={e.id} className={styles.ev + (sel === e.id ? " " + styles.on : "")} style={{ ["--c" as string]: CATEGORIES[e.cat].color }}>
          <button
            ref={(n) => { listRefs.current[e.id] = n; }}
            className={styles.evMain}
            onMouseEnter={() => setHov(e.id)} onMouseLeave={() => setHov(null)}
            onFocus={() => setHov(e.id)} onBlur={() => setHov(null)}
            onClick={() => setSel((c) => (c === e.id ? null : e.id))}
          >
            <span className={styles.dt}>{e.tbd ? <>В течение месяца <i>· дата уточняется</i></> : formatEventDates(e)}{e.ekp ? <span className={styles.ekp}>ЕКП</span> : null}</span>
            <span className={styles.ttl}>{e.title}</span>
            <span className={styles.meta}>{e.place} · {e.rank}<br />{e.org}</span>
          </button>
          {mayEdit ? (
            <div className={styles.evTools}>
              <button className={styles.ic} title="Изменить" aria-label={`Изменить: ${e.title}`} onClick={() => openForm(e.id)}><Pencil size={15} aria-hidden="true" /></button>
              <button className={`${styles.ic} ${styles.del}`} title="Удалить" aria-label={`Удалить: ${e.title}`} onClick={() => setModal({ kind: "delete", id: e.id })}><Trash2 size={15} aria-hidden="true" /></button>
            </div>
          ) : null}
        </div>,
      );
    });
    if (view !== "all") {
      const other = events.filter((e) => shown(e) && e.year !== view).length;
      if (other) out.push(<button key="more" className={styles.moreYrs} onClick={() => setView("all")}>Ещё {other} {plural(other, "мероприятие", "мероприятия", "мероприятий")} в других годах — показать все</button>);
    }
    return out;
  }

  function renderCalendar() {
    const vis = sorted.filter(shown);
    return displayedYears.map((y) => (
      <div key={y}>
        {multiYear ? <div className={styles.yrH}><b>{y}</b><span>{vis.filter((e) => e.year === y).length} {plural(vis.filter((e) => e.year === y).length, "мероприятие", "мероприятия", "мероприятий")}</span></div> : null}
        <div className={styles.months}>{monthOrder(y, focus).map((m) => renderMonth(y, m, vis))}</div>
      </div>
    ));
  }

  function renderMonth(y: number, m: number, vis: CalendarEvent[]) {
    const tbd = vis.filter((e) => e.tbd && e.month === m && e.year === y);
    const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
    const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < lead; i++) cells.push(<div key={"e" + i} />);
    for (let d = 1; d <= total; d++) {
      const day = `${y}-${pad(m)}-${pad(d)}`;
      const col = (lead + d - 1) % 7;
      const on = vis.filter((e) => !e.tbd && day >= (e.start as string) && day <= (e.end as string));
      const has = on.length > 0;
      const ids = on.map((e) => e.id);
      const hl = has && activeId != null && ids.includes(String(activeId));
      let bg: string | undefined, jl = false, jr = false;
      if (has) {
        const cols = [...new Set(on.map((e) => CATEGORIES[e.cat].color))];
        bg = cols.length === 1 ? cols[0] : `linear-gradient(90deg,${cols.map((c, i) => `${c} ${(i / cols.length) * 100}% ${((i + 1) / cols.length) * 100}%`).join(",")})`;
        const prev = isoOf(new Date(Date.UTC(y, m - 1, d - 1))), nxt = isoOf(new Date(Date.UTC(y, m - 1, d + 1)));
        if (col > 0 && d > 1 && on.some((e) => prev >= (e.start as string) && prev <= (e.end as string))) jl = true;
        if (col < 6 && d < total && on.some((e) => nxt >= (e.start as string) && nxt <= (e.end as string))) jr = true;
      }
      const cls = [styles.cell, col > 4 ? styles.we : "", day === todayIso ? styles.today : "", has ? styles.has : "", hl ? styles.hl : "", jl ? styles.jl : "", jr ? styles.jr : "", !has && !mayEdit ? styles.plain : ""].filter(Boolean).join(" ");
      cells.push(
        <div
          key={d}
          className={cls}
          title={has ? on.map((e) => `${formatEventDates(e, true)} — ${e.title}`).join("\n") : (mayEdit ? `Добавить мероприятие на ${d} ${MONTHS_GEN[m - 1]} ${y}` : undefined)}
          onMouseEnter={has ? () => setHov(on[0].id) : undefined}
          onMouseLeave={has ? () => setHov(null) : undefined}
          onClick={has ? () => selectDay(ids) : (mayEdit ? () => openForm(null, day) : undefined)}
        >
          <span className={styles.d} style={bg ? { background: bg } : undefined}>{d}</span>
        </div>,
      );
    }
    return (
      <section className={styles.mo} key={m}>
        <div className={styles.moH}>
          <b>{MONTHS[m - 1]}</b>
          <span className={styles.dots}>{tbd.map((e) => <i key={e.id} style={{ ["--c" as string]: CATEGORIES[e.cat].color }} title={e.title} />)}</span>
        </div>
        <div className={styles.dow}>{DOW.map((d, i) => <span key={d} className={i > 4 ? styles.we : ""}>{d}</span>)}</div>
        <div className={styles.days}>{cells}</div>
      </section>
    );
  }

  function renderForm(editingId: string | null) {
    if (!draft) return null;
    const d = draft;
    return (
      <>
        <header><h3 id="cal-sheet-title">{editingId != null ? "Изменить мероприятие" : "Новое мероприятие"}</h3>
          <p>{editingId != null ? "Правки вступят в силу после подтверждения" : "Заполните карточку — календарь обновится сразу"}</p></header>
        <div className={styles.sheetBody}>
          <div className={`${styles.f} ${formErr.title ? styles.err : ""}`}>
            <label htmlFor="i-t">Название мероприятия</label>
            <textarea id="i-t" value={d.title} onChange={(e) => setDraftPatch({ title: e.target.value })} />
            <span className={styles.msg}>Укажите название</span>
          </div>
          <div className={styles.f}>
            <label>Категория</label>
            <div className={styles.seg}>
              {CATEGORY_KEYS.map((k) => <button type="button" key={k} style={{ ["--c" as string]: CATEGORIES[k].color }} aria-pressed={d.cat === k} onClick={() => setDraftPatch({ cat: k })}><i />{CATEGORIES[k].name}</button>)}
            </div>
          </div>
          <div className={styles.f}>
            <label>Даты</label>
            <div className={styles.seg}>
              <button type="button" style={{ ["--c" as string]: "var(--navy-950)" }} aria-pressed={!d.tbd} onClick={() => setDraftPatch({ tbd: false, start: d.start || `${d.year}-${pad(d.month)}-01`, end: d.end || d.start || `${d.year}-${pad(d.month)}-01` })}>Точные даты</button>
              <button type="button" style={{ ["--c" as string]: "var(--navy-950)" }} aria-pressed={d.tbd} onClick={() => setDraftPatch({ tbd: true })}>Дата уточняется</button>
            </div>
          </div>
          {!d.tbd ? (
            <div className={`${styles.f} ${formErr.dates ? styles.err : ""}`}>
              <div className={styles.row}>
                <div><label htmlFor="i-s">Начало</label><input type="date" id="i-s" value={d.start ?? ""} min={`${MIN_YEAR}-01-01`} max={`${MAX_YEAR}-12-31`} onChange={(e) => { const v = e.target.value; setDraftPatch({ start: v, end: d.end && d.end >= v ? d.end : v }); }} /></div>
                <div><label htmlFor="i-e">Окончание</label><input type="date" id="i-e" value={d.end ?? ""} min={`${MIN_YEAR}-01-01`} max={`${MAX_YEAR}-12-31`} onChange={(e) => setDraftPatch({ end: e.target.value })} /></div>
              </div>
              <span className={styles.msg}>Окончание не раньше начала, годы — от {MIN_YEAR} до {MAX_YEAR}</span>
            </div>
          ) : (
            <div className={`${styles.f} ${formErr.dates ? styles.err : ""}`}>
              <div className={styles.row}>
                <div><label htmlFor="i-m">Месяц</label><select id="i-m" value={d.month} onChange={(e) => setDraftPatch({ month: +e.target.value })}>{MONTHS.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}</select></div>
                <div className="narrow"><label htmlFor="i-y">Год</label><input type="number" id="i-y" value={d.year} min={MIN_YEAR} max={MAX_YEAR} step={1} onChange={(e) => setDraftPatch({ year: +e.target.value })} /></div>
              </div>
              <span className={styles.msg}>Укажите год от {MIN_YEAR} до {MAX_YEAR}</span>
            </div>
          )}
          <div className={styles.row}>
            <div className={styles.f}><label htmlFor="i-place">Место проведения</label><input type="text" id="i-place" value={d.place} onChange={(e) => setDraftPatch({ place: e.target.value })} /></div>
            <div className={styles.f}><label htmlFor="i-rank">Ранг / уровень</label><input type="text" id="i-rank" value={d.rank} onChange={(e) => setDraftPatch({ rank: e.target.value })} /></div>
          </div>
          <div className={styles.f}><label htmlFor="i-org">Организаторы</label><input type="text" id="i-org" value={d.org} onChange={(e) => setDraftPatch({ org: e.target.value })} /></div>
          <label className={styles.chk}><input type="checkbox" checked={d.ekp} onChange={(e) => setDraftPatch({ ekp: e.target.checked })} /> Входит в единый календарный план (ЕКП)</label>
        </div>
        <div className={styles.sheetFoot}>
          <button className={ctrl} onClick={() => setModal(null)}>Отмена</button>
          <button className={ctrlPrimary} onClick={() => submitForm(editingId)}>{editingId != null ? "Проверить изменения" : "Добавить"}</button>
        </div>
      </>
    );
  }

  function renderDiff(state: { editingId: string; changes: Change[] }) {
    const old = events.find((e) => e.id === state.editingId);
    return (
      <>
        <header><h3 id="cal-sheet-title">Подтвердите изменения</h3>
          <p>{state.changes.length} {plural(state.changes.length, "правка", "правки", "правок")} в карточке «{(old?.title ?? "").slice(0, 42)}»</p></header>
        <div className={styles.sheetBody}>
          <ul className={styles.diff}>{state.changes.map((c) => <li key={c.k}><div className="k">{LBL[c.k]}</div><span className={styles.was}>{c.a}</span><span className={styles.now}>{c.b}</span></li>)}</ul>
        </div>
        <div className={styles.sheetFoot}>
          <button className={`${ctrl} left`} onClick={() => setModal({ kind: "form", editingId: state.editingId })}>Вернуться к правке</button>
          <button className={ctrlPrimary} onClick={() => draft && commitEdit(draft)}>Подтвердить</button>
        </div>
      </>
    );
  }

  function renderDelete(id: string) {
    const e = events.find((x) => x.id === id);
    if (!e) return null;
    return (
      <>
        <header><h3 id="cal-sheet-title">Удалить мероприятие?</h3></header>
        <div className={styles.sheetBody}><p className={styles.note}><b>{e.title}</b><br />{formatEventDates(e, true)} · {e.place}<br /><br />Мероприятие исчезнет из хронологии и календаря. Отменить можно сразу после удаления.</p></div>
        <div className={styles.sheetFoot}>
          <button className={ctrl} onClick={() => setModal(null)}>Отмена</button>
          <button className={ctrlDanger} onClick={() => commitDelete(id)}>Удалить</button>
        </div>
      </>
    );
  }
}
