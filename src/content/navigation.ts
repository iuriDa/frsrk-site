export interface NavigationItem {
  label: string;
  href: string;
  children?: ReadonlyArray<{ label: string; href: string; external?: boolean }>;
}

export const primaryNavigation: ReadonlyArray<NavigationItem> = [
  { label: "Главная", href: "/" },
  {
    label: "О федерации",
    href: "/about",
    children: [
      { label: "История Федерации", href: "/about/history" },
      { label: "Документы", href: "/documents" },
      { label: "Контакты", href: "/contacts" },
    ],
  },
  { label: "Календарь", href: "/calendar" },
  { label: "Муниципалитеты", href: "/municipalities" },
  {
    label: "Обучение",
    href: "/education",
    children: [
      { label: "Судейские", href: "/education/judges" },
      { label: "Тренерские", href: "/education/coaches" },
    ],
  },
  {
    label: "Антидопинг",
    href: "/antidoping",
    children: [
      { label: "Антидопинговое обеспечение", href: "/antidoping" },
      { label: "Запрещённый список и документы", href: "/antidoping/documents" },
      { label: "Проверить лекарство", href: "https://list.rusada.ru", external: true },
      { label: "Получить сертификат", href: "https://course.rusada.ru", external: true },
      {
        label: "Сообщить о допинге",
        href: "https://rusada.ru/doping-control/investigations/report-about-doping/",
        external: true,
      },
    ],
  },
  { label: "Медиа", href: "/media" },
];

export const footerNavigation = {
  federation: [
    { label: "О федерации", href: "/about" },
    { label: "Руководство", href: "/about/leadership" },
    { label: "Структура", href: "/about/structure" },
    { label: "Реквизиты", href: "/about/requisites" },
  ],
  activity: [
    { label: "Календарь", href: "/calendar" },
    { label: "Муниципалитеты", href: "/municipalities" },
    { label: "Обучение", href: "/education" },
    { label: "Антидопинг", href: "/antidoping" },
  ],
  information: [
    { label: "Документы", href: "/documents" },
    { label: "Медиа", href: "/media" },
    { label: "Контакты", href: "/contacts" },
  ],
};
