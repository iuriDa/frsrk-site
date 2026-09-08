import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export const TRAINING_CITY_TABLE = "training_cities";
export const TRAINING_ORGANIZATION_TABLE = "training_organizations";

export const TRAINING_CITY_SELECT = "id,slug,name,territory_type,map_x,map_y,responsible_name,responsible_role,active,sort_order";
export const TRAINING_ORGANIZATION_SELECT = "id,city_id,name,organization_type,organization_type_other,address,phone,phone_secondary,max_url,website,vk,telegram,coach_name,description,active,sort_order";
const TRAINING_DATA_SELECT = `${TRAINING_CITY_SELECT},organizations:${TRAINING_ORGANIZATION_TABLE}(${TRAINING_ORGANIZATION_SELECT})`;

export const TERRITORY_TYPES = ["city", "district"] as const;
export type TerritoryType = (typeof TERRITORY_TYPES)[number];

export const TERRITORY_TYPE_LABELS: Record<TerritoryType, string> = {
  city: "Город",
  district: "Район",
};

export const ORGANIZATION_TYPES = [
  "sports_section",
  "sports_club",
  "sports_school",
  "school",
  "studio",
  "other",
] as const;
export type TrainingOrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const ORGANIZATION_TYPE_LABELS: Record<TrainingOrganizationType, string> = {
  sports_section: "Спортивная секция",
  sports_club: "Спортивный клуб",
  sports_school: "Спортивная школа",
  school: "Школа / образовательная организация",
  studio: "Студия",
  other: "Другое",
};

export interface TrainingCity {
  id: string;
  slug: string;
  name: string;
  territoryType: TerritoryType;
  mapX: number;
  mapY: number;
  responsibleName: string;
  responsibleRole: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingOrganization {
  id: string;
  cityId: string;
  name: string;
  organizationType: TrainingOrganizationType;
  organizationTypeOther: string;
  address: string;
  phone: string;
  phoneSecondary: string;
  maxUrl: string;
  website: string;
  vk: string;
  telegram: string;
  coachName: string;
  description: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingData {
  cities: TrainingCity[];
  organizations: TrainingOrganization[];
}

export interface TrainingCityRow {
  id: string;
  slug: string | null;
  name: string;
  territory_type?: string | null;
  map_x: number | null;
  map_y: number | null;
  responsible_name: string | null;
  responsible_role: string | null;
  active: boolean | null;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingOrganizationRow {
  id: string;
  city_id: string;
  name: string;
  organization_type?: string | null;
  organization_type_other?: string | null;
  address: string | null;
  phone: string | null;
  phone_secondary: string | null;
  max_url?: string | null;
  website: string | null;
  vk: string | null;
  telegram: string | null;
  coach_name: string | null;
  description: string | null;
  active: boolean | null;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
}

interface TrainingDataRow extends TrainingCityRow {
  organizations: TrainingOrganizationRow[] | null;
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const empty = (value?: string | null) => value?.trim() ?? "";
const clampPercent = (value?: number | null) => Math.min(100, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 50));
const normalizeTerritoryType = (value?: string | null): TerritoryType =>
  TERRITORY_TYPES.includes(value as TerritoryType) ? (value as TerritoryType) : "city";
const normalizeOrganizationType = (value?: string | null): TrainingOrganizationType =>
  ORGANIZATION_TYPES.includes(value as TrainingOrganizationType) ? (value as TrainingOrganizationType) : "sports_section";

export function normalizeForSearch(value: string): string {
  return value.trim().toLocaleLowerCase("ru-RU");
}

export function makeTrainingSlug(name: string, fallback = "city"): string {
  const transliterated = normalizeForSearch(name)
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");
  const slug = transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug || fallback;
}

export function sortTrainingCities(cities: TrainingCity[]): TrainingCity[] {
  return [...cities].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export function sortTrainingOrganizations(organizations: TrainingOrganization[]): TrainingOrganization[] {
  return [...organizations].sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export function getActiveOrganizationsForCity(cityId: string, organizations: TrainingOrganization[]): TrainingOrganization[] {
  return sortTrainingOrganizations(organizations.filter((organization) => organization.cityId === cityId && organization.active));
}

export function getVisibleTrainingCities(data: TrainingData): TrainingCity[] {
  return sortTrainingCities(data.cities.filter((city) => city.active));
}

export function fromTrainingCityRow(row: TrainingCityRow): TrainingCity {
  return {
    id: String(row.id),
    slug: empty(row.slug) || makeTrainingSlug(row.name, String(row.id)),
    name: empty(row.name),
    territoryType: normalizeTerritoryType(row.territory_type),
    mapX: clampPercent(row.map_x),
    mapY: clampPercent(row.map_y),
    responsibleName: empty(row.responsible_name),
    responsibleRole: empty(row.responsible_role),
    active: row.active !== false,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTrainingCityRow(city: TrainingCity): TrainingCityRow {
  return {
    id: city.id,
    slug: city.slug,
    name: city.name.trim(),
    territory_type: city.territoryType,
    map_x: clampPercent(city.mapX),
    map_y: clampPercent(city.mapY),
    responsible_name: empty(city.responsibleName) || null,
    responsible_role: empty(city.responsibleRole) || null,
    active: city.active,
    sort_order: Number(city.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
}

export function fromTrainingOrganizationRow(row: TrainingOrganizationRow): TrainingOrganization {
  return {
    id: String(row.id),
    cityId: String(row.city_id),
    name: empty(row.name),
    organizationType: normalizeOrganizationType(row.organization_type),
    organizationTypeOther: empty(row.organization_type_other),
    address: empty(row.address),
    phone: empty(row.phone),
    phoneSecondary: empty(row.phone_secondary),
    maxUrl: empty(row.max_url),
    website: empty(row.website),
    vk: empty(row.vk),
    telegram: empty(row.telegram),
    coachName: empty(row.coach_name),
    description: empty(row.description),
    active: row.active !== false,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTrainingOrganizationRow(organization: TrainingOrganization): TrainingOrganizationRow {
  return {
    id: organization.id,
    city_id: organization.cityId,
    name: organization.name.trim(),
    organization_type: organization.organizationType,
    organization_type_other: organization.organizationType === "other" ? empty(organization.organizationTypeOther) || null : null,
    address: empty(organization.address) || null,
    phone: empty(organization.phone) || null,
    phone_secondary: empty(organization.phoneSecondary) || null,
    max_url: empty(organization.maxUrl) || null,
    website: empty(organization.website) || null,
    vk: empty(organization.vk) || null,
    telegram: empty(organization.telegram) || null,
    coach_name: empty(organization.coachName) || null,
    description: empty(organization.description) || null,
    active: organization.active,
    sort_order: Number(organization.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchTrainingData(): Promise<TrainingData> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase не настроен: проверьте публичный URL и publishable key.");
  }

  const { data, error } = await supabase
    .from(TRAINING_CITY_TABLE)
    .select(TRAINING_DATA_SELECT);

  if (error) throw error;
  const rows = (data ?? []) as unknown as TrainingDataRow[];

  return {
    cities: sortTrainingCities(rows.map(fromTrainingCityRow)),
    organizations: sortTrainingOrganizations(rows.flatMap((row) => row.organizations ?? []).map(fromTrainingOrganizationRow)),
  };
}

export { isSupabaseConfigured };
