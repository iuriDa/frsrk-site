export interface DisciplineAudio {
  /** Порядковый номер по официальному перечню звуковых дорожек. */
  order: number;
  /** Название дисциплины. */
  title: string;
  /** Файл в /public/audio. */
  fileUrl: string;
  /** Размер файла для показа рядом с кнопкой. */
  fileSize: string;
}

/**
 * Официальные звуковые дорожки дисциплин роуп скиппинга.
 * Источник: «ЗВУК ФРСР УТВЕРЖДЕН» (утверждён федерацией).
 * Порядок соответствует официальному перечню.
 */
export const disciplineAudio: DisciplineAudio[] = [
  { order: 1, title: "30 секунд", fileUrl: "/audio/30-sekund.mp3", fileSize: "1,6 МБ" },
  { order: 2, title: "60 секунд", fileUrl: "/audio/60-sekund.mp3", fileSize: "2,7 МБ" },
  { order: 3, title: "90 секунд", fileUrl: "/audio/90-sekund.mp3", fileSize: "3,8 МБ" },
  { order: 4, title: "120 секунд", fileUrl: "/audio/120-sekund.mp3", fileSize: "5,0 МБ" },
  { order: 5, title: "180 секунд", fileUrl: "/audio/180-sekund.mp3", fileSize: "7,3 МБ" },
  { order: 6, title: "Скорость 2 по 30 секунд", fileUrl: "/audio/skorost-2x30-sekund.mp3", fileSize: "2,8 МБ" },
  { order: 7, title: "Сила 2 по 30 секунд", fileUrl: "/audio/sila-2x30-sekund.mp3", fileSize: "2,8 МБ" },
  { order: 8, title: "Прыжки, 4 человека", fileUrl: "/audio/pryzhki-4-cheloveka.mp3", fileSize: "5,0 МБ" },
  { order: 9, title: "Прыжки через 2 скакалки, 4 человека", fileUrl: "/audio/pryzhki-2-skakalki-4-cheloveka.mp3", fileSize: "7,3 МБ" },
  { order: 10, title: "Двойные прыжки", fileUrl: "/audio/dvojnye-pryzhki.mp3", fileSize: "0,5 МБ" },
  { order: 11, title: "Тройные прыжки", fileUrl: "/audio/trojnye-pryzhki.mp3", fileSize: "0,5 МБ" },
  { order: 12, title: "Прыжки через 2 скакалки, 1 человек", fileUrl: "/audio/pryzhki-2-skakalki-1-chelovek.mp3", fileSize: "3,3 МБ" },
  { order: 13, title: "Прыжки через 2 скакалки, 2 человека", fileUrl: "/audio/pryzhki-2-skakalki-2-cheloveka.mp3", fileSize: "3,3 МБ" },
  { order: 14, title: "Вольные упражнения", fileUrl: "/audio/volnye-uprazhneniya.mp3", fileSize: "3,3 МБ" },
  { order: 15, title: "Вольные упражнения, группа", fileUrl: "/audio/volnye-uprazhneniya-gruppa.mp3", fileSize: "3,3 МБ" },
  { order: 16, title: "Командные соревнования", fileUrl: "/audio/komandnye-sorevnovaniya.mp3", fileSize: "0,5 МБ" },
];
