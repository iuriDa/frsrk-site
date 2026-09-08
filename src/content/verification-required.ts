export const verificationRequired = {
  officialName: "Общественная организация «Федерация роуп скиппинга (спортивной скакалки) Республики Крым»",
  legalShortName: "ОО «ФРСРК»",
  phone: "+7 978 738-32-46",
  email: "crimea.skipping@mail.ru",
  address: "295003, Республика Крым, г. Симферополь, ул. Балаклавская, дом 41, офис 118",
  addressMapUrl: "https://yandex.ru/maps/?text=" + encodeURIComponent("Симферополь, улица Балаклавская, 41"),
  ogrn: "1249100003448",
  accreditation: {
    status: "Аккредитована" as const,
    orderNumber: "242-ОД",
    orderDate: "22.04.2024",
    validFrom: "22.04.2024",
    validUntil: "21.04.2027",
    vrvsCode: "1780001411Я",
  },
  requisites: null,
  leadership: [
    { name: "Жмакина Виктория Николаевна", role: "Президент" },
    { name: "Данильченко Юрий Леонидович", role: "Вице-президент, Главный тренер сборной" },
  ],
  social: {
    vk: "https://vk.ru/rope_skipping_crimea",
    telegram: "https://t.me/+3uyHm_gL9wtmNzRi",
  },
} as const;
