"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { primaryNavigation, type NavigationItem } from "@/content/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { SocialLinks } from "@/components/layout/social-links";

function BrandLogo() {
  return (
    <Link
      href="/"
      className="flag-header__logo"
      aria-label="Федерация Роуп Скиппинга Республики Крым — главная"
    >
      <Image
        src="/brand/frsrk-logo.png"
        alt="Логотип Федерации Роуп Скиппинга Республики Крым"
        width={577}
        height={433}
        priority
        className="flag-header__logo-image"
      />
    </Link>
  );
}

function BrandTitle() {
  return (
    <Link href="/" className="brand-title" aria-label="Перейти на главную страницу">
      <span>Федерация Роуп Скиппинга Республики Крым</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);

  // ── Desktop submenu: единый явный state (какой пункт раскрыт) ────────────────
  // Один источник истины вместо конфликтующих CSS hover + focus-within.
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const desktopCloseTimer = useRef<number | null>(null);
  const clearDesktopTimer = () => {
    if (desktopCloseTimer.current) { window.clearTimeout(desktopCloseTimer.current); desktopCloseTimer.current = null; }
  };
  const openDesktop = (href: string) => { clearDesktopTimer(); setDesktopOpen(href); };
  // Небольшая задержка против случайного закрытия при переходе курсора trigger↔submenu.
  const scheduleCloseDesktop = () => { clearDesktopTimer(); desktopCloseTimer.current = window.setTimeout(() => setDesktopOpen(null), 180); };
  const closeDesktop = () => { clearDesktopTimer(); setDesktopOpen(null); };
  const closeMobile = () => { setOpen(false); setMobileOpen(null); };

  // ── Smart Header: sticky + autohide ─────────────────────────────────────────
  const headerRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [spacer, setSpacer] = useState(0);
  const [reduce, setReduce] = useState(false);
  const openRef = useRef(open);
  const idleRef = useRef<number | null>(null);
  const pointerInsideRef = useRef(false);
  useEffect(() => { openRef.current = open; }, [open]);

  // Смена маршрута → закрыть все меню (desktop dropdown, мобильное меню и аккордеон).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (desktopCloseTimer.current) { window.clearTimeout(desktopCloseTimer.current); desktopCloseTimer.current = null; }
      setDesktopOpen(null);
      setOpen(false);
      setMobileOpen(null);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Высота шапки → высота распорки (чтобы контент не скакал). Мобильное меню —
  // абсолютный оверлей, поэтому в измеряемую высоту не входит.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setSpacer(el.offsetHeight);
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    const raf = requestAnimationFrame(on);
    mq.addEventListener?.("change", on);
    return () => { cancelAnimationFrame(raf); mq.removeEventListener?.("change", on); };
  }, []);

  // Автоскрытие: видно вверху и при прокрутке; прячется через 1.5 с покоя;
  // показывается при scroll вверх, движении курсора к верху и фокусе внутри шапки.
  // Пока курсор внутри всей области шапки (включая dropdown/submenu и мобильное
  // меню — они DOM-потомки header), таймер скрытия не запускается.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clearIdle = () => { if (idleRef.current) { window.clearTimeout(idleRef.current); idleRef.current = null; } };
    const focusWithin = () => el.contains(document.activeElement);
    const nearTop = () => window.scrollY <= (el.offsetHeight || 120);
    const holdOpen = () => openRef.current || pointerInsideRef.current || focusWithin();
    const schedule = () => {
      clearIdle();
      if (mq.matches || holdOpen() || nearTop()) return;
      idleRef.current = window.setTimeout(() => {
        if (!mq.matches && !holdOpen() && !nearTop()) setHidden(true);
      }, 1500);
    };
    const onScroll = () => { setHidden(false); schedule(); };
    const onMove = (e: MouseEvent) => { if (e.clientY <= 24) { setHidden(false); clearIdle(); } };
    const onFocusIn = () => { setHidden(false); clearIdle(); };
    // Курсор вошёл в шапку → показать и отменить отложенное скрытие.
    const onPointerEnter = () => { pointerInsideRef.current = true; setHidden(false); clearIdle(); };
    // Курсор покинул всю область шапки → снова разрешить обычный idle-hide.
    const onPointerLeave = () => { pointerInsideRef.current = false; schedule(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("pointerenter", onPointerEnter);
    el.addEventListener("pointerleave", onPointerLeave);
    const raf = requestAnimationFrame(schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("pointerenter", onPointerEnter);
      el.removeEventListener("pointerleave", onPointerLeave);
      clearIdle();
    };
  }, []);

  // Escape: закрыть мобильное меню и открытый desktop-dropdown (в т. ч. открытый
  // наведением, когда фокус вне группы). Клавиатурный кейс с возвратом фокуса на
  // trigger обрабатывается внутри DesktopNavigationItem.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openRef.current) setOpen(false);
      if (desktopCloseTimer.current) { window.clearTimeout(desktopCloseTimer.current); desktopCloseTimer.current = null; }
      setDesktopOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Мобильное меню открыто → шапку не прячем (эффективное состояние).
  const effectiveHidden = hidden && !open;

  return (
    <>
      <div aria-hidden="true" style={{ height: spacer }} />
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 bg-white"
        style={{
          transform: effectiveHidden ? "translateY(-100%)" : "translateY(0)",
          transition: reduce ? "none" : "transform 300ms ease",
          willChange: "transform",
        }}
      >
      <div className="flag-header">
        <TopBar />

        <div className="flag-header__white">
          <div className="site-container flag-header__content">
            <BrandTitle />
            <SocialLinks className="ml-auto hidden shrink-0 pl-4 md:flex" tone="light" />
          </div>
        </div>

        <div className="crimea-red h-5" aria-hidden="true" />
        <BrandLogo />
      </div>

      <div className="relative z-40 bg-[var(--navy-900)] shadow-[0_8px_24px_rgba(7,20,38,.18)]">
        <div className="site-container flex min-h-[56px] items-center justify-between xl:block">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.13em] text-white xl:hidden">
            ФРСРК
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg border border-white/18 text-white xl:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>

          <nav className="hidden xl:block" aria-label="Основная навигация">
            <div className="flex min-h-[56px] items-stretch justify-center gap-1">
              {primaryNavigation.map((item) => (
                <DesktopNavigationItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  open={desktopOpen === item.href}
                  onOpen={() => openDesktop(item.href)}
                  onScheduleClose={scheduleCloseDesktop}
                  onCloseNow={closeDesktop}
                />
              ))}
            </div>
          </nav>
        </div>

        {open ? (
          <nav
            id="mobile-navigation"
            aria-label="Мобильная навигация"
            className="absolute inset-x-0 top-full max-h-[calc(100vh-56px)] overflow-y-auto border-t border-white/12 bg-[var(--navy-900)] px-4 py-4 shadow-[0_8px_24px_rgba(7,20,38,.18)] xl:hidden"
          >
            <div className="site-container grid gap-1 px-0">
              {primaryNavigation.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const expanded = mobileOpen === item.href;

                if (item.children?.length) {
                  return (
                    <div key={item.href} className="rounded-xl border border-white/10">
                      <div className="flex items-stretch">
                        <Link
                          href={item.href}
                          onClick={closeMobile}
                          aria-current={active ? "page" : undefined}
                          className={`flex flex-1 items-center rounded-l-xl px-4 py-3 text-sm font-medium uppercase tracking-[0.04em] ${
                            active ? "bg-white/12 text-white" : "text-white/78 hover:bg-white/8 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileOpen(expanded ? null : item.href)}
                          aria-expanded={expanded}
                          aria-label={`Показать подразделы: ${item.label}`}
                          className="grid w-12 place-items-center rounded-r-xl border-l border-white/10 text-white/75 hover:bg-white/8"
                        >
                          <ChevronDown className={`transition ${expanded ? "rotate-180" : ""}`} size={18} aria-hidden="true" />
                        </button>
                      </div>
                      {expanded ? (
                        <div className="border-t border-white/10 bg-black/14 p-2">
                          {item.children.map((child) =>
                            child.external ? (
                              <a
                                key={child.href}
                                href={child.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={closeMobile}
                                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-white/72 hover:bg-white/8 hover:text-white"
                              >
                                {child.label}
                                <ExternalLink size={14} aria-hidden="true" />
                              </a>
                            ) : (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={closeMobile}
                                className="block rounded-lg px-3 py-2.5 text-sm text-white/72 hover:bg-white/8 hover:text-white"
                              >
                                {child.label}
                              </Link>
                            ),
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-[0.04em] transition ${
                      active ? "bg-white/12 text-white" : "text-white/78 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 border-t border-white/12 px-1 pt-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/55">Мы в социальных сетях</p>
              <SocialLinks className="mt-3" tone="dark" />
            </div>
          </nav>
        ) : null}
      </div>
      </header>
    </>
  );
}

function DesktopNavigationItem({
  item,
  pathname,
  open,
  onOpen,
  onScheduleClose,
  onCloseNow,
}: {
  item: NavigationItem;
  pathname: string;
  open: boolean;
  onOpen: () => void;
  onScheduleClose: () => void;
  onCloseNow: () => void;
}) {
  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const groupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const desktopLinkClass = `relative flex items-center justify-center whitespace-nowrap px-2.5 text-[9px] font-medium uppercase tracking-[0.055em] text-white transition hover:bg-white/8 ${
    active ? "bg-white/10" : ""
  }`;

  if (!item.children?.length) {
    return (
      <Link href={item.href} aria-current={active ? "page" : undefined} className={desktopLinkClass}>
        {item.label}
        {active ? <span className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--crimea-red)]" /> : null}
      </Link>
    );
  }

  const panelId = `submenu-${item.href.replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <div
      ref={groupRef}
      className="relative flex"
      // Курсор на пункте или в его submenu → открыто; уход из всей группы → закрыть с задержкой.
      onPointerEnter={onOpen}
      onPointerLeave={onScheduleClose}
      // Клавиатура: фокус в группе открывает; полный уход фокуса из группы закрывает.
      onFocus={onOpen}
      onBlur={(e) => { if (!groupRef.current?.contains(e.relatedTarget as Node | null)) onCloseNow(); }}
      onKeyDown={(e) => { if (e.key === "Escape" && open) { onCloseNow(); triggerRef.current?.focus(); } }}
    >
      <Link
        ref={triggerRef}
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        className={`${desktopLinkClass} gap-1`}
        // Клик по основному пункту: перейти на его страницу и сразу закрыть submenu.
        onClick={onCloseNow}
      >
        {item.label}
        <ChevronDown size={12} aria-hidden="true" />
        {active ? <span className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--crimea-red)]" /> : null}
      </Link>
      <div
        id={panelId}
        className={`absolute left-1/2 top-full w-80 -translate-x-1/2 border-t-4 border-[var(--crimea-red)] bg-white p-2 shadow-2xl shadow-black/25 transition duration-150 ${
          open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {item.children.map((child) =>
          child.external ? (
            <a
              key={child.href}
              href={child.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onCloseNow}
              className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-bold text-[var(--navy-950)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--blue-700)]"
            >
              {child.label}
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          ) : (
            <Link
              key={child.href}
              href={child.href}
              onClick={onCloseNow}
              className="block rounded-lg px-4 py-3 text-sm font-bold text-[var(--navy-950)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--blue-700)]"
            >
              {child.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
