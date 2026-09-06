import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
export const metadata: Metadata = { title: "Поиск" };
export default function Page() { return <><PageHero eyebrow="Поиск по сайту" title="Найти информацию" description="Поиск по новостям, мероприятиям, документам, клубам и представителям." trail={[{label:"Поиск"}]} /><section className="section-space bg-[var(--surface-muted)]"><div className="site-container"><label className="relative block"><span className="sr-only">Поисковый запрос</span><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true"/><input className="min-h-16 w-full rounded-2xl border border-[var(--border)] bg-white pl-14 pr-5 text-lg" placeholder="Введите название или ключевое слово" /></label><div className="mt-8"><EmptyState title="Введите поисковый запрос" description="Полнотекстовый поиск будет подключён вместе с базой данных на следующем этапе." /></div></div></section></>; }
