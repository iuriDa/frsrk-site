"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Send, ShieldAlert, User } from "lucide-react";
import { CrimeaMapOutline } from "@/components/municipalities/crimea-map-outline";
import { EmptyState } from "@/components/ui/empty-state";
import type { MunicipalityLocation, MunicipalityLocationStatus } from "@/content/municipality-locations";

const statusLabels: Record<MunicipalityLocationStatus, string> = {
  active: "Действующая площадка",
  planned: "Планируется",
  "requires-verification": "Требует проверки",
};

const statusClasses: Record<MunicipalityLocationStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  planned: "bg-blue-50 text-blue-700",
  "requires-verification": "bg-amber-50 text-amber-700",
};

const typeLabels: Record<MunicipalityLocation["type"], string> = {
  club: "Клуб",
  section: "Секция",
  school: "Школа",
  federation: "Представительство федерации",
  coach: "Тренер",
  other: "Территория",
};

interface LocationGroup {
  key: string;
  city?: string;
  municipality: string;
  x: number;
  y: number;
  locations: MunicipalityLocation[];
}

function buildGroups(locations: MunicipalityLocation[]): LocationGroup[] {
  const map = new Map<string, LocationGroup>();
  for (const location of locations) {
    const key = `${location.municipality}|${location.city ?? ""}`;
    const existing = map.get(key);
    if (existing) {
      existing.locations.push(location);
    } else {
      map.set(key, {
        key,
        city: location.city,
        municipality: location.municipality,
        x: location.mapPosition.x,
        y: location.mapPosition.y,
        locations: [location],
      });
    }
  }
  return Array.from(map.values());
}

export function InteractiveMap({ locations }: { locations: MunicipalityLocation[] }) {
  const groups = useMemo(() => buildGroups(locations), [locations]);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(groups[0]?.key ?? null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    groups[0]?.locations.length === 1 ? groups[0].locations[0].id : null,
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedGroup = groups.find((group) => group.key === selectedGroupKey) ?? null;
  const selectedLocation = selectedGroup?.locations.find((location) => location.id === selectedLocationId) ?? null;

  function selectGroup(group: LocationGroup) {
    setSelectedGroupKey(group.key);
    setSelectedLocationId(group.locations.length === 1 ? group.locations[0].id : null);
  }

  function focusOnMap(group: LocationGroup, location: MunicipalityLocation, options: { scroll?: boolean } = {}) {
    setSelectedGroupKey(group.key);
    setSelectedLocationId(location.id);
    if (options.scroll) {
      mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      panelRef.current?.focus();
    }
  }

  if (locations.length === 0) {
    return (
      <EmptyState
        title="Информация о клубах и местах занятий уточняется"
        description="Карта технически готова. Подтверждённые площадки появятся здесь после проверки данных муниципалитетов."
      />
    );
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div ref={mapRef} className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div className="relative mx-auto aspect-[5/3] w-full max-w-xl">
            <CrimeaMapOutline className="absolute inset-0 h-full w-full text-[#dbe6f2]" />
            {groups.map((group) => {
              const isSelected = group.key === selectedGroupKey;
              const label =
                group.locations.length > 1
                  ? `${group.municipality} — ${group.locations.length} площадки`
                  : group.municipality;
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => selectGroup(group)}
                  aria-pressed={isSelected}
                  aria-label={`Показать: ${label}`}
                  style={{ left: `${group.x}%`, top: `${group.y}%` }}
                  className={`absolute grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-500)] ${
                    isSelected
                      ? "border-[var(--red-700)] bg-[var(--red-700)] text-white shadow-lg"
                      : "border-[var(--blue-700)] bg-white text-[var(--blue-700)] hover:bg-[#eaf2fb]"
                  }`}
                >
                  <MapPin size={18} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs leading-5 text-[var(--text-muted)]">
            Схематичная карта: маркеры показывают приблизительное расположение муниципалитетов, а не точные границы или адреса.
          </p>
        </div>

        <div
          ref={panelRef}
          tabIndex={-1}
          aria-live="polite"
          className="ui-card h-fit p-5 focus:outline-none md:p-6"
        >
          {!selectedGroup ? (
            <p className="text-sm text-[var(--text-muted)]">Выберите точку на карте, чтобы увидеть информацию.</p>
          ) : selectedGroup.locations.length > 1 && !selectedLocation ? (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--red-700)]">{selectedGroup.municipality}</p>
              <h2 className="mt-2 text-lg font-extrabold text-[var(--navy-950)]">Несколько площадок</h2>
              <ul className="mt-5 space-y-2">
                {selectedGroup.locations.map((location) => (
                  <li key={location.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedLocationId(location.id)}
                      className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-left text-sm font-bold text-[var(--navy-950)] transition hover:border-[var(--blue-500)] hover:bg-[var(--surface-muted)]"
                    >
                      {location.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : selectedLocation ? (
            <LocationDetails location={selectedLocation} />
          ) : null}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[var(--navy-950)]">Список муниципалитетов</h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {locations.map((location) => {
            const group = groups.find((item) => item.locations.some((loc) => loc.id === location.id))!;
            return (
              <li key={location.id} className="ui-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.06em] ${statusClasses[location.status]}`}>
                    {statusLabels[location.status]}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-muted)]">{typeLabels[location.type]}</span>
                </div>
                <h3 className="mt-3 font-black text-[var(--navy-950)]">{location.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {[location.municipality, location.city].filter((value, index, all) => value && all.indexOf(value) === index).join(" · ")}
                </p>
                {location.description ? <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{location.description}</p> : null}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                  {location.phone ? <span className="inline-flex items-center gap-1"><Phone size={13} aria-hidden="true" />{location.phone}</span> : null}
                  {location.email ? <span className="inline-flex items-center gap-1"><Mail size={13} aria-hidden="true" />{location.email}</span> : null}
                </div>
                <button
                  type="button"
                  onClick={() => focusOnMap(group, location, { scroll: true })}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--blue-700)] transition hover:text-[var(--navy-950)]"
                >
                  <MapPin size={15} aria-hidden="true" />
                  Показать на карте
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function LocationDetails({ location }: { location: MunicipalityLocation }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--red-700)]">{location.municipality}</p>
      {location.city ? <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">{location.city}</p> : null}
      <h2 className="mt-3 text-lg font-extrabold text-[var(--navy-950)]">{location.name}</h2>
      <span className="mt-3 inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[var(--text-muted)]">
        {typeLabels[location.type]}
      </span>

      {location.description ? <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{location.description}</p> : null}

      <dl className="mt-5 space-y-3 text-sm">
        {location.address ? <DetailRow icon={MapPin} label="Адрес" value={location.address} /> : null}
        {location.contactPerson ? <DetailRow icon={User} label="Контактное лицо" value={location.contactPerson} /> : null}
        {location.phone ? <DetailRow icon={Phone} label="Телефон" value={location.phone} href={`tel:${location.phone.replace(/[\s()-]/g, "")}`} /> : null}
        {location.email ? <DetailRow icon={Mail} label="Email" value={location.email} href={`mailto:${location.email}`} /> : null}
        {location.telegram ? <DetailRow icon={Send} label="Telegram" value={location.telegram} href={location.telegram} external /> : null}
        {location.vk ? <DetailRow icon={Send} label="ВКонтакте" value={location.vk} href={location.vk} external /> : null}
      </dl>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--surface-muted)] px-3 py-2.5 text-xs font-bold text-[var(--text-muted)]">
        <ShieldAlert size={15} className="shrink-0 text-amber-600" aria-hidden="true" />
        {statusLabels[location.status]}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="mt-0.5 shrink-0 text-[var(--blue-700)]" aria-hidden="true" />
      <div>
        <dt className="sr-only">{label}</dt>
        <dd>
          {href ? (
            <Link href={href} className="font-bold text-[var(--navy-950)] hover:text-[var(--blue-700)]" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {value}
            </Link>
          ) : (
            <span className="font-bold text-[var(--navy-950)]">{value}</span>
          )}
        </dd>
      </div>
    </div>
  );
}
