export interface Municipality {
  slug: string;
  name: string;
  kind: "город" | "район" | "городской округ";
  summary: string;
  representative?: string;
  clubsCount?: number;
  athletesCount?: number;
  requiresVerification: boolean;
}

export const municipalities: Municipality[] = [
  { slug: "simferopol", name: "Симферополь", kind: "городской округ", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
  { slug: "yalta", name: "Ялта", kind: "городской округ", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
  { slug: "alushta", name: "Алушта", kind: "городской округ", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
  { slug: "evpatoria", name: "Евпатория", kind: "городской округ", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
  { slug: "kerch", name: "Керчь", kind: "городской округ", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
  { slug: "feodosia", name: "Феодосия", kind: "городской округ", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
  { slug: "sudak", name: "Судак", kind: "городской округ", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
  { slug: "bakhchisaray-district", name: "Бахчисарайский район", kind: "район", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
  { slug: "simferopol-district", name: "Симферопольский район", kind: "район", summary: "Информация о представителях, клубах, тренерах и спортсменах готовится к публикации.", requiresVerification: true },
];

/**
 * Фактическое число подтверждённых на сайте муниципалитетов — считается из
 * массива выше (сейчас 9), а не задаётся вручную. Это НЕ то же число, что
 * декоративное «18» в municipalities-overview.ts — см. комментарий в том файле
 * и раздел «Расхождение 9 и 18/16/4» в отчёте этапа 1.7.
 */
export const municipalitiesCount = municipalities.length;
