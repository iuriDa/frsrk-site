export type AntiDopingDocumentStatus = "current" | "archived" | "repealed" | "verification_required";

export interface AntiDopingDocument {
  id: string;
  title: string;
  category: "current" | "prohibited-lists" | "international" | "russian-law" | "methodical" | "archive";
  year?: number;
  status: AntiDopingDocumentStatus;
  description?: string;
  externalUrl: string;
  sourceName: string;
  isFeatured?: boolean;
}

const rusadaInternational = "https://rusada.ru/documents/wada-code-and-other-international-standards/";
const rusadaRules = "https://rusada.ru/documents/all-russian-anti-doping-rules/";
const rusadaMaterials = "https://rusada.ru/education/materials/";
const rusadaDocuments = "https://rusada.ru/documents/";
const minSportAntidoping = "https://www.minsport.gov.ru/open-ministry/anti-doping/";

export const antiDopingDocuments: AntiDopingDocument[] = [
  { id: "all-russian-rules-2026", title: "Общероссийские антидопинговые правила 2026", category: "current", year: 2026, status: "current", externalUrl: rusadaRules, sourceName: "РУСАДА", isFeatured: true },
  { id: "prohibited-list-2026", title: "Запрещённый список 2026", category: "current", year: 2026, status: "current", externalUrl: rusadaInternational, sourceName: "РУСАДА / WADA", isFeatured: true },
  { id: "changes-2026", title: "Обзор основных изменений в Запрещённом списке 2026", category: "current", year: 2026, status: "current", externalUrl: rusadaInternational, sourceName: "РУСАДА / WADA", isFeatured: true },
  { id: "monitoring-2026", title: "Программа мониторинга 2026", category: "current", year: 2026, status: "current", externalUrl: rusadaInternational, sourceName: "РУСАДА / WADA" },
  { id: "wada-code-2021", title: "Всемирный антидопинговый кодекс 2021", category: "international", year: 2021, status: "current", externalUrl: rusadaInternational, sourceName: "WADA / РУСАДА" },
  { id: "prohibited-list-2025", title: "Запрещённый список 2025", category: "prohibited-lists", year: 2025, status: "archived", externalUrl: rusadaInternational, sourceName: "РУСАДА / WADA" },
  { id: "changes-2025", title: "Обзор основных изменений в Запрещённом списке 2025", category: "prohibited-lists", year: 2025, status: "archived", externalUrl: rusadaInternational, sourceName: "РУСАДА / WADA" },
  { id: "monitoring-2025", title: "Программа мониторинга 2025", category: "prohibited-lists", year: 2025, status: "archived", externalUrl: rusadaInternational, sourceName: "РУСАДА / WADA" },
  { id: "prohibited-list-2024", title: "Запрещённый список 2024", category: "prohibited-lists", year: 2024, status: "archived", externalUrl: "https://rusada.ru/substances/prohibited-list/arkhiv/", sourceName: "РУСАДА / WADA" },
  { id: "tue-2023", title: "Международный стандарт по терапевтическому использованию 2023", category: "international", year: 2023, status: "current", externalUrl: rusadaInternational, sourceName: "WADA / РУСАДА" },
  { id: "testing-2023", title: "Международный стандарт по тестированию и расследованиям 2023", category: "international", year: 2023, status: "current", externalUrl: rusadaInternational, sourceName: "WADA / РУСАДА" },
  { id: "results-2023", title: "Международный стандарт по обработке результатов 2023", category: "international", year: 2023, status: "current", externalUrl: rusadaInternational, sourceName: "WADA / РУСАДА" },
  { id: "education-2021", title: "Международный стандарт по образованию 2021", category: "international", year: 2021, status: "current", externalUrl: rusadaInternational, sourceName: "WADA / РУСАДА" },
  { id: "privacy-2021", title: "Международный стандарт по защите неприкосновенности частной жизни и личной информации 2021", category: "international", year: 2021, status: "current", externalUrl: rusadaInternational, sourceName: "WADA / РУСАДА" },
  { id: "federal-law-329", title: "Федеральный закон № 329-ФЗ «О физической культуре и спорте в Российской Федерации»", category: "russian-law", status: "current", externalUrl: rusadaDocuments, sourceName: "РУСАДА / законодательство РФ" },
  { id: "government-339", title: "Постановление Правительства РФ от 28.03.2017 № 339", category: "russian-law", year: 2017, status: "current", externalUrl: minSportAntidoping, sourceName: "Минспорт России" },
  { id: "order-464", title: "Приказ Минспорта России № 464 от 24.06.2021", category: "archive", year: 2021, status: "repealed", description: "Документ утратил силу. Оставлен только в архиве.", externalUrl: minSportAntidoping, sourceName: "Минспорт России" },
  { id: "coach-memo", title: "Памятка для тренеров", category: "methodical", status: "current", externalUrl: rusadaMaterials, sourceName: "РУСАДА" },
  { id: "parent-memo", title: "Памятка для родителей", category: "methodical", status: "current", externalUrl: rusadaMaterials, sourceName: "РУСАДА" },
  { id: "athlete-rights", title: "Памятка по правам спортсменов", category: "methodical", status: "current", externalUrl: rusadaMaterials, sourceName: "РУСАДА" },
  { id: "test-procedure", title: "Процедура допинг-контроля", category: "methodical", status: "current", externalUrl: rusadaMaterials, sourceName: "РУСАДА" },
  { id: "important-doping-questions", title: "Антидопинговые правила: важные факты и основные моменты", category: "methodical", status: "current", externalUrl: rusadaMaterials, sourceName: "РУСАДА" },
];

export const antiDopingServices = [
  { title: "Проверить лекарство", description: "Официальный сервис проверки лекарственных средств РУСАДА.", href: "https://list.rusada.ru", external: true },
  { title: "Получить сертификат", description: "Пройти онлайн-курс РУСАДА и получить именной сертификат.", href: "https://course.rusada.ru", external: true },
  { title: "Сообщить о допинге", description: "Конфиденциальный официальный канал РУСАДА.", href: "https://rusada.ru/doping-control/investigations/report-about-doping/", external: true },
  { title: "Документы РУСАДА", description: "Кодекс, стандарты, правила, нормативные акты и архив.", href: "https://rusada.ru/documents/", external: true },
] as const;

/**
 * Контакт, присланный владельцем сайта, не публикуется до подтверждения,
 * потому что домен wrestrus.ru связан с федерацией спортивной борьбы.
 */
export const antiDopingOfficer = {
  name: "",
  role: "Ответственный за антидопинговое обеспечение",
  email: "",
  phone: "",
  appointmentDocument: "",
  requiresVerification: true,
} as const;
