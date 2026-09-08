import type { Metadata } from "next";
import Link from "next/link";
import { AdminSectionNav } from "@/components/admin/admin-section-nav";
import { DocumentAdmin } from "@/components/documents/document-admin";

export const metadata: Metadata = { title: "Управление документами", robots: { index: false, follow: false } };

export default function DocumentAdminPage() {
  return <main className="min-h-screen bg-[var(--surface-muted)] py-8 md:py-12">
    <div className="site-container">
      <Link href="/documents" className="text-sm font-semibold text-[var(--blue-700)] hover:underline">← К документам на сайте</Link>
      <h1 className="mt-6 text-3xl font-bold text-[var(--navy-950)]">Управление документами</h1>
      <p className="mt-3 mb-8 max-w-2xl text-[var(--text-muted)]">Добавляйте файлы, обновляйте сведения и удаляйте документы из каталога. Сохранённые изменения сразу видны на сайте.</p>
      <AdminSectionNav current="documents" />
      <DocumentAdmin />
    </div>
  </main>;
}
