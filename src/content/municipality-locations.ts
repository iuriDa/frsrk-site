import { municipalities } from "@/content/municipalities";

export type MunicipalityLocationStatus = "active" | "planned" | "requires-verification";

export type MunicipalityLocationType = "club" | "section" | "school" | "federation" | "coach" | "other";

export interface MunicipalityLocation {
  id: string;
  municipality: string;
  city?: string;
  type: MunicipalityLocationType;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  telegram?: string;
  vk?: string;
  website?: string;
  description?: string;
  /** Схематичная позиция на локальном силуэте карты (0–100, не географические координаты). */
  mapPosition: { x: number; y: number };
  status: MunicipalityLocationStatus;
}

/**
 * Единственный источник данных для интерактивной карты — построен из
 * src/content/municipalities.ts (9 подтверждённых муниципалитетов проекта).
 * Адресов, клубов, контактных лиц и телефонов для них в проекте нет, поэтому
 * такие поля не заполняются (а не заменяются вымышленными значениями), а
 * статус — всегда "requires-verification".
 *
 * mapPosition — схематичные координаты (0–100) для общего силуэта полуострова,
 * приблизительно отражающие взаимное расположение территорий (запад/восток,
 * север/юг). Это не точные географические или административные границы.
 */
const SCHEMATIC_POSITIONS: Record<string, { x: number; y: number }> = {
  simferopol: { x: 48, y: 46 },
  "simferopol-district": { x: 45, y: 42 },
  yalta: { x: 50, y: 76 },
  alushta: { x: 57, y: 68 },
  evpatoria: { x: 22, y: 38 },
  kerch: { x: 92, y: 48 },
  feodosia: { x: 76, y: 58 },
  sudak: { x: 68, y: 66 },
  "bakhchisaray-district": { x: 36, y: 48 },
};

export const municipalityLocations: MunicipalityLocation[] = municipalities.map((item) => ({
  id: item.slug,
  municipality: item.name,
  city: item.kind !== "район" ? item.name : undefined,
  type: "other",
  name: item.name,
  description: item.summary,
  mapPosition: SCHEMATIC_POSITIONS[item.slug] ?? { x: 50, y: 50 },
  status: "requires-verification",
}));

export function getLocationsByMunicipality(municipalityName: string): MunicipalityLocation[] {
  return municipalityLocations.filter((location) => location.municipality === municipalityName);
}
