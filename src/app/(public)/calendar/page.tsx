import type { Metadata } from "next";
import { CalendarApp } from "@/components/calendar/calendar-app";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Календарь мероприятий",
  description: "Календарный план Федерации роуп скиппинга (спортивной скакалки) Республики Крым: соревнования, фестивали, семинары и сборы по годам.",
};

export default function CalendarPage() {
  return (
    <>
      <PageHero
        eyebrow="События федерации"
        title="Календарь мероприятий"
        description="Соревнования, фестивали, семинары, сборы и учебно-методические мероприятия по годам. Годы, категории, хронология и печатная версия — в одном плане."
        trail={[{ label: "Календарь" }]}
      />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container">
          <CalendarApp />
        </div>
      </section>
    </>
  );
}
