import type { Metadata } from "next";
import { AdminSectionNav } from "@/components/admin/admin-section-nav";
import { CalendarApp } from "@/components/calendar/calendar-app";

export const metadata: Metadata = {
  title: "Админ-панель: календарь",
  description: "Управление календарным планом Федерации роуп-скиппинга Республики Крым.",
  robots: { index: false, follow: false },
};

export default function CalendarAdminPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-muted)] py-8 md:py-12">
      <div className="site-container">
        <div className="mb-8 rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[0_1px_2px_rgba(7,20,38,.04),0_18px_50px_rgba(7,20,38,.07)] md:p-8">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase text-[var(--red-700)]">
            Админ-панель
          </p>
          <h1 className="text-[2rem] font-black leading-[1.08] text-[var(--navy-950)] md:text-[2.7rem]">
            Календарь
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-[var(--text-muted)]">
            Управление мероприятиями общего календарного плана через существующие права редактора календаря.
          </p>
        </div>
        <AdminSectionNav current="calendar" />
        <CalendarApp adminMode />
      </div>
    </main>
  );
}
