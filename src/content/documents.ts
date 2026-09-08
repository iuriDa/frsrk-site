export type DocumentStatus = "current" | "archived" | "requiresVerification";

export interface FederationDocument {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  source: string;
  documentNumber?: string;
  documentDate?: string;
  fileUrl: string;
  fileType: "pdf" | "docx" | "xls" | "xlsx";
  fileSize: string;
  pages?: number;
  /** Статус актуальности документа. По умолчанию считается «current». */
  status?: DocumentStatus;
  /** Издавший орган (уточнённое поле поверх свободного `source`). */
  issuingAuthority?: string;
  /** Номер приказа/акта. */
  orderNumber?: string;
  /** Дата приказа/акта. */
  orderDate?: string;
  /** Редакция документа, напр. «2022–2025». */
  edition?: string;
  /** Локальный файл в /public (совпадает с fileUrl, если файл размещён на сайте). */
  localFile?: string;
  /** Ссылка на официальный источник (добавлять только после проверки). */
  officialUrl?: string;
  /** Дата последней проверки актуальности (ISO). */
  lastVerifiedAt?: string;
  /** Имя файла в серверном хранилище; никогда не принимается от клиента. */
  storedFile?: string;
}

export const documentStatusLabels: Record<DocumentStatus, string> = {
  current: "Действующий",
  archived: "Архивная редакция",
  requiresVerification: "Требует проверки",
};

export const documentStatusClasses: Record<DocumentStatus, string> = {
  current: "bg-emerald-50 text-emerald-700",
  archived: "bg-amber-50 text-amber-700",
  requiresVerification: "bg-slate-100 text-slate-600",
};

export type DocumentCategory =
  | "prikazy-minsporta"
  | "standarty"
  | "sudejstvo";

export const documentCategories: Record<DocumentCategory, { label: string; description: string }> = {
  "prikazy-minsporta": {
    label: "Приказы Минспорта России",
    description: "Официальные приказы и программы Министерства спорта Российской Федерации по виду спорта «роуп скиппинг (спортивная скакалка)».",
  },
  "standarty": {
    label: "Стандарты спортивной подготовки",
    description: "Федеральные стандарты, нормативы и классификация для спортсменов.",
  },
  "sudejstvo": {
    label: "Судейство",
    description: "Положения, квалификационные требования и программы подготовки спортивных судей.",
  },
};

export const federationDocuments: FederationDocument[] = [
  {
    id: "pravila-vida-sporta",
    title: "Правила вида спорта «роуп скиппинг (спортивная скакалка)»",
    description: "Полный текст правил, утверждённых приказом Минспорта России. Термины, спортивные дисциплины, возрастные группы, требования к организаторам, критерии оценивания, штрафы.",
    category: "prikazy-minsporta",
    source: "Министерство спорта Российской Федерации",
    documentNumber: "№264",
    documentDate: "29.03.2022",
    fileUrl: "/documents/pravila-vida-sporta-2024.pdf",
    fileType: "pdf",
    fileSize: "3 МБ",
    pages: 53,
  },
  {
    id: "programma-razvitiya",
    title: "Программа развития вида спорта в Российской Федерации",
    description: "Анализ состояния и перспектив развития роуп скиппинга в РФ и мире. Целевые показатели, этапы реализации, критерии формирования сборной команды.",
    category: "prikazy-minsporta",
    source: "Министерство спорта Российской Федерации",
    documentNumber: "№163",
    documentDate: "22.02.2022",
    fileUrl: "/documents/programma-razvitiya-vida-sporta.pdf",
    fileType: "pdf",
    fileSize: "1,4 МБ",
    pages: 52,
  },
  {
    id: "obrazovatelnaya-programma",
    title: "Примерная дополнительная образовательная программа спортивной подготовки",
    description: "Программа образовательной деятельности по спортивной подготовке. Этапы: начальная подготовка, учебно-тренировочный, совершенствование, высшее мастерство.",
    category: "prikazy-minsporta",
    source: "Министерство спорта Российской Федерации",
    documentNumber: "№1118",
    documentDate: "30.11.2022",
    fileUrl: "/documents/obrazovatelnaya-programma-sportpodgotovki.pdf",
    fileType: "pdf",
    fileSize: "1 МБ",
    pages: 17,
  },
  {
    id: "federalnyj-standart",
    title: "Федеральный стандарт спортивной подготовки (ФССП)",
    description: "Минимальные требования к спортивной подготовке по виду спорта: сроки этапов, возрастные границы, объём программы, нормативы.",
    category: "standarty",
    source: "Министерство спорта Российской Федерации",
    fileUrl: "/documents/federalnyj-standart-sportpodgotovki.docx",
    fileType: "docx",
    fileSize: "109 КБ",
  },
  {
    id: "polozhenie-evsk-173-2025",
    title: "Положение о Единой всероссийской спортивной классификации",
    description: "Порядок присвоения, подтверждения, лишения и восстановления спортивных званий и разрядов. Исходная редакция приказа от 03.03.2025: файл не включает последующие изменения, в том числе приказ № 510 от 09.07.2025.",
    category: "standarty",
    source: "Министерство спорта Российской Федерации",
    documentNumber: "№173",
    documentDate: "03.03.2025",
    fileUrl: "/documents/polozhenie-evsk-173-2025.pdf",
    localFile: "/documents/polozhenie-evsk-173-2025.pdf",
    fileType: "pdf",
    fileSize: "4,2 МБ",
    pages: 61,
    status: "archived",
    edition: "03.03.2025, без последующих изменений",
  },
  {
    id: "evsk-299-2026",
    title: "ЕВСК: требования по роуп скиппингу — 2026",
    description: "Приложение № 59 к приказу Минспорта России № 299 от 09.04.2026. Требования и условия выполнения для КМС, I–III спортивных и юношеских разрядов. Актуальность сверяется с официальной публикацией.",
    category: "standarty",
    source: "Министерство спорта Российской Федерации",
    documentNumber: "№299",
    documentDate: "09.04.2026",
    fileUrl: "/documents/evsk-299-2026.xls",
    localFile: "/documents/evsk-299-2026.xls",
    fileType: "xls",
    fileSize: "77 КБ",
    edition: "2026",
    status: "requiresVerification",
  },
  {
    id: "evsk-2022-2025",
    title: "Единая всероссийская спортивная классификация (ЕВСК) 2022–2025",
    description: "Требования для присвоения спортивных разрядов по роуп скиппингу. Архивная редакция 2022–2025 оставлена для справки; таблица по приказу № 299 от 09.04.2026 размещена отдельно.",
    category: "standarty",
    source: "Министерство спорта Российской Федерации",
    fileUrl: "/documents/evsk-2022-2025.xls",
    fileType: "xls",
    fileSize: "75 КБ",
    status: "archived",
    edition: "2022–2025",
    issuingAuthority: "Министерство спорта Российской Федерации",
    localFile: "/documents/evsk-2022-2025.xls",
  },
  {
    id: "polozhenie-sudejskie-kongressy",
    title: "Положение о проведении судейских конгрессов ФРСР 2024",
    description: "Порядок проведения региональных и всероссийских судейских конгрессов: цели, участники, программа, регистрация, финансовые условия.",
    category: "sudejstvo",
    source: "Федерация роуп скиппинга (спортивной скакалки) России",
    documentDate: "2024",
    fileUrl: "/documents/polozhenie-sudejskie-kongressy-2024.pdf",
    fileType: "pdf",
    fileSize: "163 КБ",
    pages: 7,
  },
  {
    id: "ktss",
    title: "Квалификационные требования к спортивным судьям (КТСС)",
    description: "Требования к присвоению и подтверждению судейских категорий по виду спорта «роуп скиппинг (спортивная скакалка)».",
    category: "sudejstvo",
    source: "Федерация роуп скиппинга (спортивной скакалки) России",
    fileUrl: "/documents/ktss-sportivnye-sudji.xls",
    fileType: "xls",
    fileSize: "114 КБ",
  },
];
