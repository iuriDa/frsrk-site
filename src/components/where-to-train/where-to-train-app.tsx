"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  Building2,
  Check,
  CircleOff,
  ExternalLink,
  Globe2,
  GripHorizontal,
  Info,
  ListPlus,
  LocateFixed,
  LogIn,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Route,
  Search,
  Send,
  Trash2,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import styles from "./where-to-train-app.module.css";
import { getSupabaseClient } from "@/lib/supabase";
import {
  ORGANIZATION_TYPE_LABELS,
  ORGANIZATION_TYPES,
  TRAINING_CITY_SELECT,
  TRAINING_CITY_TABLE,
  TRAINING_ORGANIZATION_SELECT,
  TRAINING_ORGANIZATION_TABLE,
  TERRITORY_TYPE_LABELS,
  TERRITORY_TYPES,
  fetchTrainingData,
  fromTrainingCityRow,
  fromTrainingOrganizationRow,
  getActiveOrganizationsForCity,
  getVisibleTrainingCities,
  isSupabaseConfigured,
  makeTrainingSlug,
  normalizeForSearch,
  sortTrainingCities,
  sortTrainingOrganizations,
  toTrainingCityRow,
  toTrainingOrganizationRow,
  type TrainingCity,
  type TrainingCityRow,
  type TrainingData,
  type TrainingOrganization,
  type TrainingOrganizationRow,
  type TrainingOrganizationType,
  type TerritoryType,
} from "@/lib/where-to-train";

const MAP_SRC = "/images/crimea-map.png";
const MAP_WIDTH = 1672;
const MAP_HEIGHT = 941;
const uid = (prefix: string) =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type ModalState =
  | { kind: "city"; cityId: string | null }
  | { kind: "organization"; cityId: string; organizationId: string | null }
  | { kind: "delete-city"; cityId: string }
  | { kind: "delete-organization"; organizationId: string }
  | null;

type SearchResult =
  | { kind: "city"; city: TrainingCity }
  | { kind: "organization"; city: TrainingCity; organization: TrainingOrganization };

const publicButton = `${styles.button} ${styles.buttonSoft}`;
const primaryButton = `${styles.button} ${styles.buttonPrimary}`;
const dangerButton = `${styles.button} ${styles.buttonDanger}`;
const ghostButton = `${styles.button} ${styles.buttonGhost}`;

function cleanText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function saveErrorMessage(error: { code?: string; message?: string } | null): string | null {
  if (!error) return null;
  const message = error.message || "Ошибка Supabase";
  if (error.code === "PGRST204" || error.code === "42703" || message.toLowerCase().includes("schema cache")) {
    return "Структура Supabase не обновлена. Выполните миграцию docs/where-to-train-form-fields-migration.sql и повторите сохранение.";
  }
  return message;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return fallback;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function roundPercent(value: number): number {
  return Math.round(clampPercent(value) * 1000) / 1000;
}

function phoneHref(value: string): string {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

function externalHref(value: string, base?: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!base) return `https://${trimmed.replace(/^\/+/, "")}`;
  return `${base}${trimmed.replace(/^@/, "").replace(/^\/+/, "")}`;
}

function optionalUrlHref(value: string): string | undefined {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return undefined;
}

function yandexRouteHref(address: string): string {
  return `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;
}

function organizationTypeLabel(organization: TrainingOrganization): string {
  if (organization.organizationType === "other") return cleanText(organization.organizationTypeOther) || ORGANIZATION_TYPE_LABELS.other;
  return ORGANIZATION_TYPE_LABELS[organization.organizationType];
}

function blankCity(): TrainingCity {
  return {
    id: "",
    slug: "",
    name: "",
    territoryType: "city",
    mapX: 50,
    mapY: 50,
    responsibleName: "",
    responsibleRole: "",
    active: true,
    sortOrder: 0,
  };
}

function blankOrganization(cityId: string): TrainingOrganization {
  return {
    id: "",
    cityId,
    name: "",
    organizationType: "sports_section",
    organizationTypeOther: "",
    address: "",
    phone: "",
    phoneSecondary: "",
    maxUrl: "",
    website: "",
    vk: "",
    telegram: "",
    coachName: "",
    description: "",
    active: true,
    sortOrder: 0,
  };
}

export function WhereToTrainApp({ adminMode = false }: { adminMode?: boolean }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<TrainingData>({ cities: [], organizations: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightOrganizationId, setHighlightOrganizationId] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [authed, setAuthed] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [userLabel, setUserLabel] = useState("");
  const [login, setLogin] = useState({ email: "", password: "", err: "", busy: false });
  const [modal, setModal] = useState<ModalState>(null);
  const [cityDraft, setCityDraft] = useState<TrainingCity | null>(null);
  const [organizationDraft, setOrganizationDraft] = useState<TrainingOrganization | null>(null);
  const [formError, setFormError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const organizationRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const saveTimer = useRef<number | null>(null);
  const highlightTimer = useRef<number | null>(null);
  const reloadTimer = useRef<number | null>(null);

  const visibleCities = useMemo(() => getVisibleTrainingCities(data), [data]);
  const selectedCity = useMemo(
    () => visibleCities.find((city) => city.id === selectedCityId) ?? null,
    [selectedCityId, visibleCities],
  );
  const selectedCityOrganizations = useMemo(
    () => (selectedCity ? getActiveOrganizationsForCity(selectedCity.id, data.organizations) : []),
    [data.organizations, selectedCity],
  );

  const mayEdit = adminMode && isSupabaseConfigured && canEdit;

  const flashSave = useCallback((message: string) => {
    setSaveMessage(message);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaveMessage(""), 4200);
  }, []);

  const loadData = useCallback(async () => {
    setLoadError("");
    try {
      const next = await fetchTrainingData();
      setData(next);
    } catch (error) {
      setLoadError(errorMessage(error, "Не удалось загрузить организации"));
      setData({ cities: [], organizations: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) window.clearTimeout(reloadTimer.current);
    reloadTimer.current = window.setTimeout(() => {
      reloadTimer.current = null;
      void loadData();
    }, 120);
  }, [loadData]);

  const refreshEditor = useCallback(async () => {
    if (!supabase) {
      setAuthed(false);
      setCanEdit(false);
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    setAuthed(Boolean(session));
    setUserLabel(session?.user?.email ?? "");
    if (!session) {
      setCanEdit(false);
      return;
    }
    try {
      const { data: ok, error } = await supabase.rpc("is_content_editor");
      setCanEdit(!error && ok === true);
    } catch {
      setCanEdit(false);
    }
  }, [supabase]);

  const updateCityParam = useCallback((city: TrainingCity | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (city) params.set("city", city.slug || city.id);
    else params.delete("city");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const closeCity = useCallback(() => {
    setSelectedCityId(null);
    setHighlightOrganizationId(null);
    setSheetExpanded(false);
    updateCityParam(null);
  }, [updateCityParam]);

  const openCity = useCallback((city: TrainingCity, organizationId?: string) => {
    setSelectedCityId(city.id);
    setSheetExpanded(false);
    updateCityParam(city);
    if (organizationId) setHighlightOrganizationId(organizationId);
  }, [updateCityParam]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
      void refreshEditor();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData, refreshEditor]);

  useEffect(() => {
    if (!supabase) return;
    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      void refreshEditor();
    });
    const channel = supabase
      .channel("frsrk-training-locations")
      .on("postgres_changes", { event: "*", schema: "public", table: TRAINING_CITY_TABLE }, () => {
        scheduleReload();
        flashSave("Данные обновлены");
      })
      .on("postgres_changes", { event: "*", schema: "public", table: TRAINING_ORGANIZATION_TABLE }, () => {
        scheduleReload();
        flashSave("Данные обновлены");
      })
      .subscribe();

    return () => {
      authSub.subscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [flashSave, refreshEditor, scheduleReload, supabase]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        if (modal) {
          setModal(null);
          return;
        }
        closeCity();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCity, modal]);

  useEffect(() => {
    const cityParam = searchParams.get("city");
    if (!cityParam || loading) return;
    const match = visibleCities.find((city) => city.slug === cityParam || city.id === cityParam);
    if (!match || selectedCityId === match.id) return;
    const timer = window.setTimeout(() => setSelectedCityId(match.id), 0);
    return () => window.clearTimeout(timer);
  }, [loading, searchParams, selectedCityId, visibleCities]);

  useEffect(() => {
    if (!loading && selectedCityId && !visibleCities.some((city) => city.id === selectedCityId)) {
      const timer = window.setTimeout(closeCity, 0);
      return () => window.clearTimeout(timer);
    }
  }, [closeCity, loading, selectedCityId, visibleCities]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
      if (reloadTimer.current) window.clearTimeout(reloadTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!highlightOrganizationId) return;
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightOrganizationId(null), 1800);
    return () => {
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    };
  }, [highlightOrganizationId]);

  useEffect(() => {
    if (!highlightOrganizationId) return;
    const node = organizationRefs.current[highlightOrganizationId];
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightOrganizationId, selectedCityId, sheetExpanded]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const needle = normalizeForSearch(query);
    if (!needle) return [];

    const results: SearchResult[] = [];
    for (const city of visibleCities) {
      const cityOrganizations = getActiveOrganizationsForCity(city.id, data.organizations);
      const cityHaystack = normalizeForSearch([city.name, city.responsibleName, city.responsibleRole].join(" "));
      if (cityHaystack.includes(needle)) results.push({ kind: "city", city });

      for (const organization of cityOrganizations) {
        const organizationHaystack = normalizeForSearch(
          [
            city.name,
            city.responsibleName,
            organization.name,
            organizationTypeLabel(organization),
            organization.address,
            organization.phone,
            organization.vk,
            organization.telegram,
            organization.maxUrl,
            organization.website,
            organization.coachName,
            organization.description,
          ].join(" "),
        );
        if (organizationHaystack.includes(needle)) results.push({ kind: "organization", city, organization });
      }
    }

    return results.slice(0, 10);
  }, [data.organizations, query, visibleCities]);

  async function submitLogin() {
    if (!supabase) {
      setLogin((current) => ({ ...current, err: "Общая база не подключена" }));
      return;
    }
    setLogin((current) => ({ ...current, busy: true, err: "" }));
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: login.email.trim(),
      password: login.password,
    });
    if (error) {
      setLogin((current) => ({ ...current, busy: false, err: error.message || "Неверная почта или пароль" }));
      return;
    }
    setAuthed(Boolean(loginData.session));
    setUserLabel(loginData.session?.user?.email ?? "");
    await refreshEditor();
    await loadData();
    setLogin({ email: "", password: "", err: "", busy: false });
    setModal(null);
    flashSave("Вход выполнен");
  }

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthed(false);
    setCanEdit(false);
    await loadData();
    flashSave("Вы вышли");
  }

  async function persistCity(city: TrainingCity): Promise<{ city: TrainingCity | null; error: string | null }> {
    if (!supabase || !canEdit) return { city: null, error: "Нет прав на сохранение." };
    const { data: row, error } = await supabase
      .from(TRAINING_CITY_TABLE)
      .upsert(toTrainingCityRow(city) as unknown as TrainingCityRow)
      .select(TRAINING_CITY_SELECT)
      .single();
    return { city: row ? fromTrainingCityRow(row as TrainingCityRow) : null, error: saveErrorMessage(error) };
  }

  async function persistOrganization(organization: TrainingOrganization): Promise<{ organization: TrainingOrganization | null; error: string | null }> {
    if (!supabase || !canEdit) return { organization: null, error: "Нет прав на сохранение." };
    const { data: row, error } = await supabase
      .from(TRAINING_ORGANIZATION_TABLE)
      .upsert(toTrainingOrganizationRow(organization) as unknown as TrainingOrganizationRow)
      .select(TRAINING_ORGANIZATION_SELECT)
      .single();
    return { organization: row ? fromTrainingOrganizationRow(row as TrainingOrganizationRow) : null, error: saveErrorMessage(error) };
  }

  async function persistCityDelete(cityId: string): Promise<string | null> {
    if (!supabase || !canEdit) return "Нет прав на удаление.";
    const { error } = await supabase.from(TRAINING_CITY_TABLE).delete().eq("id", cityId);
    return saveErrorMessage(error);
  }

  async function persistOrganizationDelete(organizationId: string): Promise<string | null> {
    if (!supabase || !canEdit) return "Нет прав на удаление.";
    const { error } = await supabase.from(TRAINING_ORGANIZATION_TABLE).delete().eq("id", organizationId);
    return saveErrorMessage(error);
  }

  function ensureUniqueSlug(name: string, currentId: string, existingSlug: string) {
    const base = makeTrainingSlug(existingSlug || name, currentId.slice(0, 8) || "city");
    let slug = base;
    let index = 2;
    while (data.cities.some((city) => city.id !== currentId && city.slug === slug)) {
      slug = `${base}-${index}`;
      index += 1;
    }
    return slug;
  }

  function openCityForm(cityId: string | null) {
    setCityDraft(cityId ? { ...data.cities.find((city) => city.id === cityId)! } : blankCity());
    setFormError("");
    setModal({ kind: "city", cityId });
  }

  function openOrganizationForm(cityId: string, organizationId: string | null) {
    const organization = organizationId
      ? data.organizations.find((item) => item.id === organizationId)
      : blankOrganization(cityId);
    if (!organization) return;
    setOrganizationDraft({ ...organization, cityId });
    setFormError("");
    setModal({ kind: "organization", cityId, organizationId });
  }

  async function saveCityDraft() {
    if (!cityDraft || saving) return;
    const name = cleanText(cityDraft.name);
    if (!name) {
      setFormError("Укажите название муниципалитета.");
      return;
    }
    const id = cityDraft.id || uid("city");
    const next: TrainingCity = {
      ...cityDraft,
      id,
      name,
      slug: ensureUniqueSlug(name, id, cityDraft.slug),
      territoryType: cityDraft.territoryType,
      responsibleName: cleanText(cityDraft.responsibleName),
      responsibleRole: cleanText(cityDraft.responsibleRole),
      mapX: roundPercent(cityDraft.mapX),
      mapY: roundPercent(cityDraft.mapY),
    };

    setSaving(true);
    setFormError("");
    try {
      const result = await persistCity(next);
      if (result.error) {
        setFormError(`Не сохранилось: ${result.error}`);
        return;
      }
      if (!result.city) {
        setFormError("Не сохранилось: Supabase не вернул сохранённую запись.");
        return;
      }
      const savedCity = result.city;
      setData((current) => ({
        ...current,
        cities: sortTrainingCities(current.cities.some((city) => city.id === savedCity.id) ? current.cities.map((city) => (city.id === savedCity.id ? savedCity : city)) : [...current.cities, savedCity]),
      }));
      setModal(null);
      flashSave("Муниципалитет сохранён");
    } catch (error) {
      setFormError(`Не сохранилось: ${errorMessage(error, "ошибка соединения")}`);
    } finally {
      setSaving(false);
    }
  }

  async function saveOrganizationDraft() {
    if (!organizationDraft || saving) return;
    const name = cleanText(organizationDraft.name);
    if (!name) {
      setFormError("Укажите название организации.");
      return;
    }
    const address = cleanText(organizationDraft.address);
    if (!address) {
      setFormError("Укажите адрес организации.");
      return;
    }
    if (organizationDraft.organizationType === "other" && !cleanText(organizationDraft.organizationTypeOther)) {
      setFormError("Укажите тип организации.");
      return;
    }
    const id = organizationDraft.id || uid("organization");
    const next: TrainingOrganization = {
      ...organizationDraft,
      id,
      name,
      organizationType: organizationDraft.organizationType,
      organizationTypeOther: cleanText(organizationDraft.organizationTypeOther),
      address,
      phone: cleanText(organizationDraft.phone),
      phoneSecondary: "",
      website: cleanText(organizationDraft.website),
      vk: cleanText(organizationDraft.vk),
      telegram: cleanText(organizationDraft.telegram),
      maxUrl: cleanText(organizationDraft.maxUrl),
      coachName: cleanText(organizationDraft.coachName),
      description: cleanText(organizationDraft.description),
    };

    setSaving(true);
    setFormError("");
    try {
      const result = await persistOrganization(next);
      if (result.error) {
        setFormError(`Не сохранилось: ${result.error}`);
        return;
      }
      if (!result.organization) {
        setFormError("Не сохранилось: Supabase не вернул сохранённую запись.");
        return;
      }
      const savedOrganization = result.organization;
      setData((current) => ({
        ...current,
        organizations: sortTrainingOrganizations(
          current.organizations.some((organization) => organization.id === savedOrganization.id)
            ? current.organizations.map((organization) => (organization.id === savedOrganization.id ? savedOrganization : organization))
            : [...current.organizations, savedOrganization],
        ),
      }));
      setModal(null);
      flashSave("Организация сохранена");
    } catch (error) {
      setFormError(`Не сохранилось: ${errorMessage(error, "ошибка соединения")}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCity(cityId: string) {
    if (saving) return;
    setSaving(true);
    setFormError("");
    try {
      const error = await persistCityDelete(cityId);
      if (error) {
        setFormError(`Не удалилось: ${error}`);
        return;
      }
      setData((current) => ({
        cities: current.cities.filter((city) => city.id !== cityId),
        organizations: current.organizations.filter((organization) => organization.cityId !== cityId),
      }));
      if (selectedCityId === cityId) closeCity();
      setModal(null);
      flashSave("Муниципалитет удалён");
    } catch (error) {
      setFormError(`Не удалилось: ${errorMessage(error, "ошибка соединения")}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrganization(organizationId: string) {
    if (saving) return;
    setSaving(true);
    setFormError("");
    try {
      const error = await persistOrganizationDelete(organizationId);
      if (error) {
        setFormError(`Не удалилось: ${error}`);
        return;
      }
      setData((current) => ({
        ...current,
        organizations: current.organizations.filter((organization) => organization.id !== organizationId),
      }));
      setModal(null);
      flashSave("Организация удалена");
    } catch (error) {
      setFormError(`Не удалилось: ${errorMessage(error, "ошибка соединения")}`);
    } finally {
      setSaving(false);
    }
  }

  function chooseResult(result: SearchResult) {
    setSearchOpen(false);
    if (result.kind === "city") {
      setQuery(result.city.name);
      openCity(result.city);
      return;
    }
    setQuery(result.organization.name);
    openCity(result.city, result.organization.id);
  }

  function handleSheetPointerDown(event: PointerEvent<HTMLButtonElement>) {
    setDragStart(event.clientY);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSheetPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (dragStart == null) return;
    const delta = event.clientY - dragStart;
    if (delta > 64) closeCity();
    else if (delta < -42) setSheetExpanded(true);
    else setSheetExpanded((current) => !current);
    setDragStart(null);
  }

  if (loading && adminMode) return <TrainingSkeleton />;

  if (adminMode) {
    return (
      <div className={styles.app}>
        {renderAdminPanel()}
        {modal ? (
          <div className={styles.modalBackdrop} onClick={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="training-modal-title">
              {modal.kind === "city" ? renderCityModal() : null}
              {modal.kind === "organization" ? renderOrganizationModal() : null}
              {modal.kind === "delete-city" ? renderDeleteCityModal(modal.cityId) : null}
              {modal.kind === "delete-organization" ? renderDeleteOrganizationModal(modal.organizationId) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <Search size={21} aria-hidden="true" />
          <label className={styles.searchLabel}>
            <span className="sr-only">Поиск организации</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Муниципалитет, организация или адрес"
              type="search"
              autoComplete="off"
            />
          </label>
          {query ? (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
              aria-label="Очистить поиск"
            >
              <X size={17} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {searchOpen && query.trim() ? (
          <div className={styles.searchDropdown} onMouseDown={(event) => event.preventDefault()}>
            {searchResults.length ? (
              searchResults.map((result) => (
                <button
                  key={result.kind === "city" ? `city-${result.city.id}` : `organization-${result.organization.id}`}
                  type="button"
                  onClick={() => chooseResult(result)}
                >
                  <span className={styles.resultIcon}>{result.kind === "city" ? <MapPin size={17} /> : <Building2 size={17} />}</span>
                  <span>
                    <b>{result.kind === "city" ? result.city.name : result.organization.name}</b>
                    <small>{result.kind === "city" ? TERRITORY_TYPE_LABELS[result.city.territoryType] : result.city.name}</small>
                  </span>
                </button>
              ))
            ) : (
              <div className={styles.searchEmpty}>Ничего не найдено</div>
            )}
          </div>
        ) : null}
      </div>

      {loadError ? (
        <div className={styles.errorState} role="alert">
          <CircleOff size={18} aria-hidden="true" />
          <span>Не удалось загрузить раздел: {loadError}</span>
        </div>
      ) : null}

      <div className={`${styles.workspace} ${selectedCity ? styles.workspaceOpen : ""}`}>
        <section className={styles.mapSurface} aria-label="Карта организаций спортивной скакалки в Крыму">
          <MapCanvas
            cities={visibleCities}
            selectedCityId={selectedCityId}
            onSelect={openCity}
            loading={loading}
          />
          {!loading && !loadError && !visibleCities.length ? (
            <div className={styles.noMarkers}>
              <b>Муниципалитеты пока не опубликованы</b>
              <span>Активные города и районы появятся здесь после сохранения в Supabase.</span>
            </div>
          ) : null}
        </section>

        {selectedCity ? (
          <aside className={styles.desktopPanel} aria-live="polite">
            <CityPanel
              city={selectedCity}
              organizations={selectedCityOrganizations}
              highlightOrganizationId={highlightOrganizationId}
              setOrganizationRef={(id, node) => {
                organizationRefs.current[id] = node;
              }}
              onClose={closeCity}
            />
          </aside>
        ) : null}
      </div>

      <TerritoryList
        cities={visibleCities}
        organizations={data.organizations}
        loading={loading}
        loadError={loadError}
        onSelect={openCity}
      />

      {selectedCity ? (
        <div className={`${styles.mobileSheet} ${sheetExpanded ? styles.mobileSheetExpanded : ""}`}>
          <div className={styles.mobileSheetInner}>
            <div className={styles.sheetHandleRow}>
              <button
                type="button"
                className={styles.sheetHandle}
                onPointerDown={handleSheetPointerDown}
                onPointerUp={handleSheetPointerUp}
                aria-label={sheetExpanded ? "Свернуть карточку города" : "Развернуть карточку города"}
              >
                <GripHorizontal size={34} aria-hidden="true" />
              </button>
              <button type="button" className={styles.mobileClose} onClick={closeCity} aria-label="Закрыть карточку города">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <CityPanel
              city={selectedCity}
              organizations={selectedCityOrganizations}
              highlightOrganizationId={highlightOrganizationId}
              setOrganizationRef={(id, node) => {
                organizationRefs.current[id] = node;
              }}
              onClose={closeCity}
              compact
            />
          </div>
        </div>
      ) : null}

    </div>
  );

  function renderAdminPanel() {
    return (
      <section className={styles.adminPanel} aria-labelledby="training-admin-title">
        <header className={styles.adminHeader}>
          <div>
            <p>Админ-панель</p>
            <h2 id="training-admin-title">Где заниматься</h2>
            <span aria-live="polite">{saveMessage || "Муниципалитеты, представители и организации"}</span>
          </div>
          <div className={styles.adminActions}>
            {isSupabaseConfigured && authed ? (
              <button type="button" className={ghostButton} onClick={logout} title={userLabel}>
                <LogOut size={16} aria-hidden="true" />
                Выйти
              </button>
            ) : null}
            {mayEdit ? (
              <button type="button" className={primaryButton} onClick={() => openCityForm(null)}>
                <Plus size={16} aria-hidden="true" />
                Добавить муниципалитет
              </button>
            ) : null}
          </div>
        </header>

        {!isSupabaseConfigured ? (
          <AdminNotice
            icon={Info}
            title="Общая база не подключена"
            text="Раздел готов к работе с Supabase. После подключения переменных окружения и таблиц управление станет доступно редакторам."
          />
        ) : !authed ? (
          <form className={styles.adminLogin} onSubmit={(event) => { event.preventDefault(); void submitLogin(); }}>
            <div>
              <p>Supabase Auth</p>
              <h3>Вход администратора</h3>
              <span>Используйте тот же аккаунт, что и в админке календаря.</span>
            </div>
            <label className={styles.field}>
              <span>Почта</span>
              <input
                type="email"
                autoComplete="username"
                value={login.email}
                onChange={(event) => setLogin((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <span>Пароль</span>
              <input
                type="password"
                autoComplete="current-password"
                value={login.password}
                onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
            {login.err ? <p className={styles.formError}>{login.err}</p> : null}
            <button type="submit" className={primaryButton} disabled={login.busy}>
              <LogIn size={16} aria-hidden="true" />
              {login.busy ? "Проверяю..." : "Войти"}
            </button>
          </form>
        ) : authed && !canEdit ? (
          <AdminNotice
            icon={CircleOff}
            title="Нет прав на редактирование"
            text="Вход выполнен, но этот аккаунт не проходит проверку редактора контента."
          />
        ) : mayEdit ? (
          <div className={styles.adminCities}>
            {sortTrainingCities(data.cities).length ? (
              sortTrainingCities(data.cities).map((city) => {
                const cityOrganizations = sortTrainingOrganizations(data.organizations.filter((organization) => organization.cityId === city.id));
                const activeOrganizations = cityOrganizations.filter((organization) => organization.active).length;
                return (
                  <article key={city.id} className={styles.adminCity}>
                    <div className={styles.adminCityHead}>
                      <div>
                        <div className={styles.adminBadges}>
                          <span className={city.active ? styles.badgeActive : styles.badgeMuted}>
                            {city.active ? "Показывается" : "Скрыт"}
                          </span>
                          <span>{TERRITORY_TYPE_LABELS[city.territoryType]}</span>
                          <span>{activeOrganizations} активн.</span>
                        </div>
                        <h3>{city.name}</h3>
                        {[city.responsibleRole, city.responsibleName].filter(Boolean).length ? (
                          <p>{[city.responsibleRole, city.responsibleName].filter(Boolean).join(" · ")}</p>
                        ) : null}
                      </div>
                      <div className={styles.rowActions}>
                        <button type="button" className={styles.iconButton} onClick={() => openCityForm(city.id)} aria-label={`Изменить муниципалитет: ${city.name}`}>
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button type="button" className={styles.iconButton} onClick={() => openOrganizationForm(city.id, null)} aria-label={`Добавить организацию: ${city.name}`}>
                          <ListPlus size={17} aria-hidden="true" />
                        </button>
                        <button type="button" className={`${styles.iconButton} ${styles.iconDanger}`} onClick={() => { setFormError(""); setModal({ kind: "delete-city", cityId: city.id }); }} aria-label={`Удалить муниципалитет: ${city.name}`}>
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {cityOrganizations.length ? (
                      <div className={styles.adminOrganizations}>
                        {cityOrganizations.map((organization) => (
                          <div key={organization.id} className={styles.adminOrganization}>
                            <div>
                              <span className={organization.active ? styles.orgActive : styles.orgMuted}>
                                {organization.active ? "Показывается" : "Скрыта"}
                              </span>
                              <b>{organization.name}</b>
                              <small>{organizationTypeLabel(organization)}</small>
                              {organization.address ? <small>{organization.address}</small> : null}
                            </div>
                            <div className={styles.rowActions}>
                              <button type="button" className={styles.iconButton} onClick={() => openOrganizationForm(city.id, organization.id)} aria-label={`Редактировать организацию: ${organization.name}`}>
                                <Pencil size={16} aria-hidden="true" />
                              </button>
                              <button type="button" className={`${styles.iconButton} ${styles.iconDanger}`} onClick={() => { setFormError(""); setModal({ kind: "delete-organization", organizationId: organization.id }); }} aria-label={`Удалить организацию: ${organization.name}`}>
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.adminEmpty}>Организации ещё не добавлены. Маркер муниципалитета не будет показан на публичной карте.</p>
                    )}
                  </article>
                );
              })
            ) : (
              <AdminNotice icon={MapPin} title="Муниципалитетов пока нет" text="Добавьте первый муниципалитет, поставьте маркер на карте и создайте активную организацию." />
            )}
          </div>
        ) : null}
      </section>
    );
  }

  function renderCityModal() {
    if (!cityDraft) return null;
    return (
      <>
        <header className={styles.modalHeader}>
          <h3 id="training-modal-title">{cityDraft.id ? "Редактировать муниципалитет" : "Добавить муниципалитет"}</h3>
          <button type="button" className={styles.iconButton} onClick={() => setModal(null)} aria-label="Закрыть">
            <X size={17} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.modalBody}>
          {formError ? <p className={styles.formError}>{formError}</p> : null}
          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Основная информация</h4>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Название *</span>
                <input value={cityDraft.name} onChange={(event) => setCityDraftPatch({ name: event.target.value })} />
              </label>
              <label className={styles.field}>
                <span>Тип территории *</span>
                <select
                  value={cityDraft.territoryType}
                  onChange={(event) => setCityDraftPatch({ territoryType: event.target.value as TerritoryType })}
                >
                  {TERRITORY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TERRITORY_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Ответственный представитель</h4>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>ФИО</span>
                <input value={cityDraft.responsibleName} onChange={(event) => setCityDraftPatch({ responsibleName: event.target.value })} />
              </label>
              <label className={styles.field}>
                <span>Должность</span>
                <input value={cityDraft.responsibleRole} onChange={(event) => setCityDraftPatch({ responsibleRole: event.target.value })} />
              </label>
            </div>
          </div>

          <div className={styles.coordinateBlock}>
            <div className={styles.coordinateHead}>
              <div>
                <b>Положение на карте</b>
                <span>Нажмите на нужный населённый пункт на карте.</span>
              </div>
              <LocateFixed size={19} aria-hidden="true" />
            </div>
            <CoordinateEditor city={cityDraft} onChange={(patch) => setCityDraftPatch(patch)} />
            <span className={styles.coordinateStatus}>Точка выбрана</span>
          </div>

          <label className={styles.checkField}>
            <input type="checkbox" checked={cityDraft.active} onChange={(event) => setCityDraftPatch({ active: event.target.checked })} />
            <span>Показывать на сайте</span>
          </label>
        </div>
        <footer className={styles.modalFooter}>
          <button type="button" className={publicButton} onClick={() => setModal(null)} disabled={saving}>Отмена</button>
          <button type="button" className={primaryButton} onClick={() => void saveCityDraft()} disabled={saving}>
            <Check size={16} aria-hidden="true" />
            {saving ? "Сохраняю..." : "Сохранить"}
          </button>
        </footer>
      </>
    );
  }

  function renderOrganizationModal() {
    if (!organizationDraft) return null;
    const isOtherType = organizationDraft.organizationType === "other";
    return (
      <>
        <header className={styles.modalHeader}>
          <h3 id="training-modal-title">{organizationDraft.id ? "Редактировать организацию" : "Добавить организацию"}</h3>
          <button type="button" className={styles.iconButton} onClick={() => setModal(null)} aria-label="Закрыть">
            <X size={17} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.modalBody}>
          {formError ? <p className={styles.formError}>{formError}</p> : null}
          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Основная информация</h4>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Название организации *</span>
                <input value={organizationDraft.name} onChange={(event) => setOrganizationDraftPatch({ name: event.target.value })} />
              </label>
              <label className={styles.field}>
                <span>Тип *</span>
                <select
                  value={organizationDraft.organizationType}
                  onChange={(event) => setOrganizationDraftPatch({ organizationType: event.target.value as TrainingOrganizationType })}
                >
                  {ORGANIZATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {ORGANIZATION_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
              {isOtherType ? (
                <label className={`${styles.field} ${styles.fieldWide}`}>
                  <span>Укажите тип *</span>
                  <input
                    value={organizationDraft.organizationTypeOther}
                    onChange={(event) => setOrganizationDraftPatch({ organizationTypeOther: event.target.value })}
                  />
                </label>
              ) : null}
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>Адрес *</span>
                <input value={organizationDraft.address} onChange={(event) => setOrganizationDraftPatch({ address: event.target.value })} />
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Контакты и ссылки</h4>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Телефон</span>
                <input value={organizationDraft.phone} onChange={(event) => setOrganizationDraftPatch({ phone: event.target.value })} />
              </label>
              <label className={styles.field}>
                <span>Сайт</span>
                <input value={organizationDraft.website} onChange={(event) => setOrganizationDraftPatch({ website: event.target.value })} />
              </label>
              <label className={styles.field}>
                <span>VK</span>
                <input value={organizationDraft.vk} onChange={(event) => setOrganizationDraftPatch({ vk: event.target.value })} />
              </label>
              <label className={styles.field}>
                <span>Telegram</span>
                <input value={organizationDraft.telegram} onChange={(event) => setOrganizationDraftPatch({ telegram: event.target.value })} />
              </label>
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>MAX</span>
                <input value={organizationDraft.maxUrl} onChange={(event) => setOrganizationDraftPatch({ maxUrl: event.target.value })} />
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Тренер и описание</h4>
            <div className={styles.formGrid}>
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>Тренер / руководитель</span>
                <input value={organizationDraft.coachName} onChange={(event) => setOrganizationDraftPatch({ coachName: event.target.value })} />
              </label>
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>Дополнительная информация</span>
                <textarea value={organizationDraft.description} onChange={(event) => setOrganizationDraftPatch({ description: event.target.value })} />
              </label>
              <label className={`${styles.checkField} ${styles.fieldWide}`}>
                <input type="checkbox" checked={organizationDraft.active} onChange={(event) => setOrganizationDraftPatch({ active: event.target.checked })} />
                <span>Показывать на сайте</span>
              </label>
            </div>
          </div>
        </div>
        <footer className={styles.modalFooter}>
          <button type="button" className={publicButton} onClick={() => setModal(null)} disabled={saving}>Отмена</button>
          <button type="button" className={primaryButton} onClick={() => void saveOrganizationDraft()} disabled={saving}>
            <Check size={16} aria-hidden="true" />
            {saving ? "Сохраняю..." : "Сохранить"}
          </button>
        </footer>
      </>
    );
  }

  function renderDeleteCityModal(cityId: string) {
    const city = data.cities.find((item) => item.id === cityId);
    if (!city) return null;
    return (
      <>
        <header className={styles.modalHeader}>
          <h3 id="training-modal-title">Удалить муниципалитет?</h3>
          <button type="button" className={styles.iconButton} onClick={() => setModal(null)} aria-label="Закрыть">
            <X size={17} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.modalBody}>
          {formError ? <p className={styles.formError}>{formError}</p> : null}
          <p className={styles.confirmText}>
            {city.name} будет удалён вместе с организациями этого муниципалитета.
          </p>
        </div>
        <footer className={styles.modalFooter}>
          <button type="button" className={publicButton} onClick={() => setModal(null)} disabled={saving}>Отмена</button>
          <button type="button" className={dangerButton} onClick={() => void deleteCity(cityId)} disabled={saving}>
            <Trash2 size={16} aria-hidden="true" />
            {saving ? "Удаляю..." : "Удалить"}
          </button>
        </footer>
      </>
    );
  }

  function renderDeleteOrganizationModal(organizationId: string) {
    const organization = data.organizations.find((item) => item.id === organizationId);
    if (!organization) return null;
    return (
      <>
        <header className={styles.modalHeader}>
          <h3 id="training-modal-title">Удалить организацию?</h3>
          <button type="button" className={styles.iconButton} onClick={() => setModal(null)} aria-label="Закрыть">
            <X size={17} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.modalBody}>
          {formError ? <p className={styles.formError}>{formError}</p> : null}
          <p className={styles.confirmText}>{organization.name} исчезнет из списка организаций.</p>
        </div>
        <footer className={styles.modalFooter}>
          <button type="button" className={publicButton} onClick={() => setModal(null)} disabled={saving}>Отмена</button>
          <button type="button" className={dangerButton} onClick={() => void deleteOrganization(organizationId)} disabled={saving}>
            <Trash2 size={16} aria-hidden="true" />
            {saving ? "Удаляю..." : "Удалить"}
          </button>
        </footer>
      </>
    );
  }

  function setCityDraftPatch(patch: Partial<TrainingCity>) {
    setCityDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function setOrganizationDraftPatch(patch: Partial<TrainingOrganization>) {
    setOrganizationDraft((current) => (current ? { ...current, ...patch } : current));
  }
}

function MapCanvas({
  cities,
  selectedCityId,
  onSelect,
  loading,
}: {
  cities: TrainingCity[];
  selectedCityId: string | null;
  onSelect: (city: TrainingCity) => void;
  loading: boolean;
}) {
  return (
    <div className={styles.mapFrame}>
      <Image
        src={MAP_SRC}
        alt="Карта Крыма"
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        priority
        sizes="(max-width: 860px) calc(100vw - 32px), 980px"
        className={styles.mapImage}
      />
      {loading ? <div className={styles.mapLoading} role="status">Загружаем муниципалитеты…</div> : null}
      {cities.map((city) => {
        const selected = city.id === selectedCityId;
        return (
          <button
            key={city.id}
            type="button"
            className={`${styles.marker} ${selected ? styles.markerSelected : ""}`}
            style={{ ["--x" as string]: `${city.mapX}%`, ["--y" as string]: `${city.mapY}%` }}
            onClick={() => onSelect(city)}
            aria-pressed={selected}
            aria-label={`Открыть организации: ${city.name}`}
          >
            <span />
          </button>
        );
      })}
    </div>
  );
}

function TerritoryList({
  cities,
  organizations,
  loading,
  loadError,
  onSelect,
}: {
  cities: TrainingCity[];
  organizations: TrainingOrganization[];
  loading: boolean;
  loadError: string;
  onSelect: (city: TrainingCity) => void;
}) {
  const organizationCounts = new Map<string, number>();
  for (const organization of organizations) {
    if (organization.active) organizationCounts.set(organization.cityId, (organizationCounts.get(organization.cityId) ?? 0) + 1);
  }

  return (
    <section className={styles.territorySection} aria-labelledby="territory-list-title">
      <div className={styles.territoryHeading}>
        <p>Территории</p>
        <h2 id="territory-list-title">Города и районы</h2>
      </div>
      {loading ? <p className={styles.territoryStatus} role="status">Загружаем список из Supabase…</p> : null}
      {!loading && !loadError && cities.length ? (
        <div className={styles.territoryGrid}>
          {cities.map((city) => {
            const organizationsCount = organizationCounts.get(city.id) ?? 0;
            return (
              <button key={city.id} type="button" className={styles.territoryCard} onClick={() => onSelect(city)}>
                <span className={styles.territoryIcon}><MapPin size={19} aria-hidden="true" /></span>
                <span className={styles.territoryCopy}>
                  <b>{city.name}</b>
                  <small>{TERRITORY_TYPE_LABELS[city.territoryType]} · {organizationsCount} {organizationsCount === 1 ? "организация" : organizationsCount >= 2 && organizationsCount <= 4 ? "организации" : "организаций"}</small>
                </span>
                <span className={styles.territoryAction}>Открыть</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function CityPanel({
  city,
  organizations,
  highlightOrganizationId,
  setOrganizationRef,
  onClose,
  compact = false,
}: {
  city: TrainingCity;
  organizations: TrainingOrganization[];
  highlightOrganizationId: string | null;
  setOrganizationRef: (id: string, node: HTMLDivElement | null) => void;
  onClose: () => void;
  compact?: boolean;
}) {
  return (
    <div className={styles.panelContent}>
      {!compact ? (
        <button type="button" className={styles.panelClose} onClick={onClose} aria-label="Закрыть карточку города">
          <X size={18} aria-hidden="true" />
        </button>
      ) : null}
      <p className={styles.panelEyebrow}>Организации</p>
      <h2>{city.name}</h2>

      {[city.responsibleRole, city.responsibleName].filter(Boolean).length ? (
        <section className={styles.responsible}>
          <h3>Ответственный за муниципалитет</h3>
          {city.responsibleRole ? <span>{city.responsibleRole}</span> : null}
          {city.responsibleName ? <b>{city.responsibleName}</b> : null}
        </section>
      ) : null}

      <section className={styles.organizationsSection}>
        <h3>Где заниматься</h3>
        <div className={styles.organizationList}>
          {organizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              highlighted={organization.id === highlightOrganizationId}
              setRef={(node) => setOrganizationRef(organization.id, node)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function OrganizationCard({
  organization,
  highlighted,
  setRef,
}: {
  organization: TrainingOrganization;
  highlighted: boolean;
  setRef: (node: HTMLDivElement | null) => void;
}) {
  const maxHref = optionalUrlHref(organization.maxUrl);
  return (
    <article ref={setRef} className={`${styles.organizationCard} ${highlighted ? styles.organizationHighlighted : ""}`}>
      <p className={styles.organizationType}>{organizationTypeLabel(organization)}</p>
      <h4>{organization.name}</h4>
      <div className={styles.organizationFields}>
        <DetailItem icon={MapPin} label="Адрес" value={organization.address} />
        {organization.address ? (
          <a className={styles.routeLink} href={yandexRouteHref(organization.address)} target="_blank" rel="noopener noreferrer">
            <Route size={15} aria-hidden="true" />
            Маршрут
          </a>
        ) : null}
        <DetailItem icon={UserRound} label="Тренер / руководитель" value={organization.coachName} />
        <DetailItem icon={Phone} label="Телефон" value={organization.phone} href={organization.phone ? phoneHref(organization.phone) : undefined} />
        <DetailItem icon={Send} label="VK" value={organization.vk} href={organization.vk ? externalHref(organization.vk, "https://vk.com/") : undefined} external />
        <DetailItem icon={Send} label="Telegram" value={organization.telegram} href={organization.telegram ? externalHref(organization.telegram, "https://t.me/") : undefined} external />
        <DetailItem icon={Send} label="MAX" value={organization.maxUrl} href={maxHref} external={Boolean(maxHref)} />
        <DetailItem icon={Globe2} label="Сайт" value={organization.website} href={organization.website ? externalHref(organization.website) : undefined} external />
        <DetailItem icon={Info} label="Дополнительно" value={organization.description} multiline />
      </div>
    </article>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  href,
  external = false,
  multiline = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  multiline?: boolean;
}) {
  if (!value.trim()) return null;
  const content = href ? (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
      {value}
      {external ? <ExternalLink size={13} aria-hidden="true" /> : null}
    </a>
  ) : (
    <span>{value}</span>
  );
  return (
    <div className={`${styles.detailItem} ${multiline ? styles.detailMultiline : ""}`}>
      <Icon size={16} aria-hidden="true" />
      <div>
        <dt>{label}</dt>
        <dd>{content}</dd>
      </div>
    </div>
  );
}

function CoordinateEditor({
  city,
  onChange,
}: {
  city: TrainingCity;
  onChange: (patch: Pick<TrainingCity, "mapX" | "mapY">) => void;
}) {
  function pick(clientX: number, clientY: number, target: HTMLDivElement) {
    const rect = target.getBoundingClientRect();
    const x = roundPercent(((clientX - rect.left) / rect.width) * 100);
    const y = roundPercent(((clientY - rect.top) / rect.height) * 100);
    onChange({ mapX: x, mapY: y });
  }

  function adjust(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 5 : 0.5;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    onChange({
      mapX: roundPercent(city.mapX + (event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0)),
      mapY: roundPercent(city.mapY + (event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0)),
    });
  }

  return (
    <div
      className={styles.coordinateEditor}
      role="application"
      tabIndex={0}
      aria-label="Редактор координат маркера"
      onClick={(event) => pick(event.clientX, event.clientY, event.currentTarget)}
      onKeyDown={adjust}
    >
      <Image src={MAP_SRC} alt="" width={MAP_WIDTH} height={MAP_HEIGHT} sizes="520px" className={styles.coordinateMap} />
      <span
        className={styles.coordinateMarker}
        style={{ ["--x" as string]: `${roundPercent(city.mapX)}%`, ["--y" as string]: `${roundPercent(city.mapY)}%` }}
      />
    </div>
  );
}

function AdminNotice({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className={styles.adminNotice}>
      <span>
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}

function TrainingSkeleton() {
  return (
    <div className={styles.skeleton} aria-label="Загрузка">
      <div className={styles.skeletonSearch} />
      <div className={styles.skeletonMap} />
      <div className={styles.skeletonLine} />
    </div>
  );
}
