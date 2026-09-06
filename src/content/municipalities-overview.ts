export interface MunicipalitiesStat {
  id: string;
  value: number;
  label: string;
}

export interface TrainingFormat {
  id: string;
  title: string;
}

/**
 * ВАЖНО (этап 1.7): эти цифры — самостоятельные декоративные показатели блока
 * «География роуп-скиппинга в Крыму» на главной странице. Они НЕ рассчитаны из
 * src/content/municipalities.ts (там сейчас 9 подтверждённых муниципалитетов —
 * см. municipalitiesCount в том файле) и требуют отдельной проверки у федерации:
 * пока неизвестно, откуда взяты 18/16/4 (например, более широкий охват, включая
 * не размещённые на сайте территории). Значения оставлены без изменений по
 * прямому указанию — не удалять и не пересчитывать молча. Интерактивная карта
 * секций встроена в /municipalities и не пересчитывает эти декоративные
 * показатели.
 */
export const municipalitiesOverviewStats: MunicipalitiesStat[] = [
  { id: "territories", value: 18, label: "муниципальных территорий" },
  { id: "school-league", value: 16, label: "территорий Школьной лиги" },
  { id: "formats", value: 4, label: "формата работы" },
];

export const trainingFormats: TrainingFormat[] = [
  { id: "academy", title: "Академия" },
  { id: "clubs", title: "Клубы" },
  { id: "studios", title: "Студии" },
  { id: "school-league", title: "Школьная лига" },
];

export const municipalitiesTagline = ["Единое спортивное пространство.", "Равные возможности для каждого ребёнка."];
