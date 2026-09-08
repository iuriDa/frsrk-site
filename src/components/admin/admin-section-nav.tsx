import Link from "next/link";

const sections = [
  { id: "documents", label: "Документы", href: "/admin/documents" },
  { id: "municipalities", label: "Муниципалитеты и организации", href: "/municipalities/admin" },
  { id: "calendar", label: "Календарь", href: "/calendar/admin" },
] as const;

type AdminSection = (typeof sections)[number]["id"];

export function AdminSectionNav({ current }: { current: AdminSection }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2" aria-label="Разделы админ-панели">
      {sections.map((section) => (
        <Link
          key={section.id}
          href={section.href}
          aria-current={section.id === current ? "page" : undefined}
          className={section.id === current
            ? "inline-flex min-h-10 items-center rounded-full bg-[var(--navy-950)] px-4 text-sm font-bold text-white"
            : "inline-flex min-h-10 items-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--navy-950)] transition hover:border-[var(--blue-500)] hover:text-[var(--blue-700)]"}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
