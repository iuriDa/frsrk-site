import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/ui/page-hero";
import { WhereToTrainApp } from "@/components/where-to-train/where-to-train-app";

export const metadata: Metadata = { title: "Муниципалитеты" };

export default function MunicipalitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Города и районы"
        title="Муниципалитеты Республики Крым"
        description="Сборная, клубы, тренеры, представители, мероприятия, новости и результаты объединены по территориям."
        trail={[{ label: "Муниципалитеты" }]}
      />
      <section className="section-space bg-[var(--surface-muted)]">
        <div className="site-container">
          <section className="mb-12" aria-labelledby="where-to-train-title">
            <div className="mb-6 max-w-3xl">
              <p className="mb-3 text-[0.78rem] font-extrabold uppercase text-[var(--red-700)]">
                Спортивная скакалка в Крыму
              </p>
              <h2 id="where-to-train-title" className="text-[2rem] font-black leading-[1.08] tracking-normal text-[var(--navy-950)] md:text-[2.7rem]">
                Где заниматься
              </h2>
              <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-[var(--text-muted)]">
                Выберите муниципалитет на карте, чтобы посмотреть действующие клубы, школы и организации.
              </p>
            </div>
            <Suspense fallback={<div className="min-h-[420px] rounded-[28px] bg-white" aria-label="Загрузка карты организаций" />}>
              <WhereToTrainApp />
            </Suspense>
          </section>
        </div>
      </section>
    </>
  );
}
