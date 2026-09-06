import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="hero-glow grid min-h-screen place-items-center px-4 text-white">
      <div className="max-w-xl text-center">
        <SearchX size={50} className="mx-auto text-[#f5cc73]" aria-hidden="true" />
        <p className="mt-7 text-sm font-extrabold uppercase tracking-[0.2em] text-white/55">Ошибка 404</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.05em]">Страница не найдена</h1>
        <p className="mt-5 leading-8 text-white/68">Возможно, материал ещё не опубликован или адрес был изменён.</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 font-extrabold text-[var(--navy-950)]"><ArrowLeft size={18} aria-hidden="true"/>Вернуться на главную</Link>
      </div>
    </main>
  );
}
