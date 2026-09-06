/**
 * Локальный нейтральный силуэт полуострова для интерфейса карты. Это абстрактная
 * схематичная форма (эллипс с восточным «хвостом», намекающим на Керченский
 * полуостров), а не точная картография и не административные границы —
 * подключать внешние картографические сервисы для этой задачи не требуется.
 */
export function CrimeaMapOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="40" cy="32" rx="34" ry="21" fill="currentColor" />
      <path d="M70,25 L97,32 L70,41 Z" fill="currentColor" />
    </svg>
  );
}
