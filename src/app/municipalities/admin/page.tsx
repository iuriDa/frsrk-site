import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSectionNav } from "@/components/admin/admin-section-nav";
import { WhereToTrainApp } from "@/components/where-to-train/where-to-train-app";

export const metadata: Metadata = {
  title: "Админ-панель: где заниматься",
  description: "Управление муниципалитетами, координатами маркеров и организациями раздела «Где заниматься».",
  robots: { index: false, follow: false },
};

export default function MunicipalitiesAdminPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-muted)] py-8 md:py-12">
      <div className="site-container">
        <div className="mb-8 rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-[0_1px_2px_rgba(7,20,38,.04),0_18px_50px_rgba(7,20,38,.07)] md:p-8">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase text-[var(--red-700)]">
            Админ-панель
          </p>
          <h1 className="text-[2rem] font-black leading-[1.08] text-[var(--navy-950)] md:text-[2.7rem]">
            Где заниматься
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-7 text-[var(--text-muted)]">
            Муниципалитеты, ответственные представители, координаты маркеров и организации раздела.
          </p>
        </div>
        <AdminSectionNav current="municipalities" />
        <Suspense fallback={<div className="min-h-[520px] rounded-[28px] bg-white" aria-label="Загрузка админ-панели" />}>
          <WhereToTrainApp adminMode />
        </Suspense>
      </div>
    </main>
  );
}
