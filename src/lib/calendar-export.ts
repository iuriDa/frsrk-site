import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PageSizes, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CATEGORIES, formatEventDates, sortEvents, type CalendarEvent } from "@/lib/calendar";
import { siteSettings } from "@/content/site-settings";

export interface CalendarPdfInput {
  events: CalendarEvent[];
  period: string;
  categories: string[];
}

const PAGE_WIDTH = PageSizes.A4[1];
const PAGE_HEIGHT = PageSizes.A4[0];
const MARGIN = 32;
const TABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FONT_SIZE = 7.4;
const LINE_HEIGHT = 9.2;
const HEADER_HEIGHT = 24;
const FOOTER_TOP = 42;

const columns = [
  { label: "№", width: 24 },
  { label: "Даты", width: 82 },
  { label: "Мероприятие", width: 220 },
  { label: "Вид", width: 95 },
  { label: "Место", width: 100 },
  { label: "Уровень", width: 100 },
  { label: "Организаторы", width: 125 },
  { label: "ЕКП", width: 32 },
] as const;

const colors = {
  navy: rgb(11 / 255, 31 / 255, 58 / 255),
  blue: rgb(20 / 255, 84 / 255, 163 / 255),
  text: rgb(16 / 255, 24 / 255, 40 / 255),
  muted: rgb(71 / 255, 84 / 255, 103 / 255),
  border: rgb(203 / 255, 213 / 255, 225 / 255),
  surface: rgb(244 / 255, 247 / 255, 250 / 255),
  white: rgb(1, 1, 1),
};

const cleanText = (value: string) => value
  .replace(/[\u2010-\u2015]/g, "-")
  .replace(/·/g, "-")
  .replace(/\s+/g, " ")
  .trim();

function splitLongWord(word: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const pieces: string[] = [];
  let current = "";
  for (const character of word) {
    if (!current || font.widthOfTextAtSize(current + character, size) <= maxWidth) current += character;
    else { pieces.push(current); current = character; }
  }
  if (current) pieces.push(current);
  return pieces;
}

function wrapText(value: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = cleanText(value || "-").split(" ").flatMap((word) => (
    font.widthOfTextAtSize(word, size) > maxWidth ? splitLongWord(word, font, size, maxWidth) : [word]
  ));
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["-"];
}

function drawLines(page: PDFPage, lines: string[], x: number, top: number, font: PDFFont, size: number, color = colors.text, lineHeight = LINE_HEIGHT) {
  lines.forEach((line, index) => page.drawText(line, { x, y: top - size - index * lineHeight, size, font, color }));
}

function drawDocumentHeader(page: PDFPage, regular: PDFFont, bold: PDFFont, input: CalendarPdfInput): number {
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 8, width: PAGE_WIDTH, height: 8, color: colors.blue });
  page.drawText(cleanText(siteSettings.officialName), { x: MARGIN, y: PAGE_HEIGHT - 30, size: 8.5, font: regular, color: colors.muted });
  page.drawText(`Список мероприятий - ${cleanText(input.period)}`, { x: MARGIN, y: PAGE_HEIGHT - 58, size: 19, font: bold, color: colors.navy });
  const categoryLines = wrapText(`Виды мероприятий: ${input.categories.map(cleanText).join(", ")}.`, regular, 7.8, TABLE_WIDTH - 180);
  drawLines(page, categoryLines, MARGIN, PAGE_HEIGHT - 73, regular, 7.8, colors.muted, 10);
  const generated = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow" }).format(new Date());
  page.drawText(`Мероприятий: ${input.events.length}. Выгружено: ${generated}.`, { x: PAGE_WIDTH - MARGIN - 176, y: PAGE_HEIGHT - 81, size: 7.8, font: regular, color: colors.muted });
  return PAGE_HEIGHT - 104 - Math.max(0, categoryLines.length - 1) * 10;
}

function drawTableHeader(page: PDFPage, top: number, bold: PDFFont): number {
  page.drawRectangle({ x: MARGIN, y: top - HEADER_HEIGHT, width: TABLE_WIDTH, height: HEADER_HEIGHT, color: colors.navy });
  let x = MARGIN;
  for (const column of columns) {
    page.drawText(column.label, { x: x + 5, y: top - 15, size: 7.4, font: bold, color: colors.white });
    x += column.width;
  }
  return top - HEADER_HEIGHT;
}

function eventCells(event: CalendarEvent, index: number): string[] {
  const date = event.tbd ? `${formatEventDates(event, true)}. Точная дата уточняется` : formatEventDates(event, true);
  return [String(index + 1), date, event.title, CATEGORIES[event.cat].name, event.place || "Уточняется", event.rank || "-", event.org || "Уточняются", event.ekp ? "Да" : "-"];
}

function prepareRow(event: CalendarEvent, index: number, regular: PDFFont, bold: PDFFont) {
  const cells = eventCells(event, index).map((value, cellIndex) => wrapText(value, cellIndex === 2 ? bold : regular, FONT_SIZE, columns[cellIndex].width - 10));
  const height = Math.max(22, Math.max(...cells.map((lines) => lines.length)) * LINE_HEIGHT + 10);
  return { cells, height };
}

function drawRow(page: PDFPage, top: number, row: ReturnType<typeof prepareRow>, index: number, regular: PDFFont, bold: PDFFont): number {
  const bottom = top - row.height;
  if (index % 2) page.drawRectangle({ x: MARGIN, y: bottom, width: TABLE_WIDTH, height: row.height, color: colors.surface });
  page.drawRectangle({ x: MARGIN, y: bottom, width: TABLE_WIDTH, height: row.height, borderColor: colors.border, borderWidth: 0.5 });
  let x = MARGIN;
  row.cells.forEach((lines, cellIndex) => {
    if (cellIndex) page.drawLine({ start: { x, y: bottom }, end: { x, y: top }, thickness: 0.5, color: colors.border });
    drawLines(page, lines, x + 5, top - 5, cellIndex === 2 ? bold : regular, FONT_SIZE);
    x += columns[cellIndex].width;
  });
  return bottom;
}

export async function createCalendarPdf(input: CalendarPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fontsDirectory = path.join(process.cwd(), "public", "fonts");
  const [regularBytes, boldBytes] = await Promise.all([
    readFile(path.join(fontsDirectory, "LiberationSans-Regular.ttf")),
    readFile(path.join(fontsDirectory, "LiberationSans-Bold.ttf")),
  ]);
  const [regular, bold] = await Promise.all([
    pdf.embedFont(regularBytes, { subset: true }),
    pdf.embedFont(boldBytes, { subset: true }),
  ]);
  pdf.setTitle(`Календарь мероприятий ФРСРК - ${cleanText(input.period)}`);
  pdf.setAuthor(siteSettings.shortName);
  pdf.setSubject("Календарный план мероприятий Федерации роуп скиппинга Республики Крым");
  pdf.setCreator(siteSettings.shortName);
  pdf.setProducer(siteSettings.shortName);
  pdf.setLanguage("ru-RU");

  const events = sortEvents(input.events);
  const pages: PDFPage[] = [];
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(page);
  let y = drawTableHeader(page, drawDocumentHeader(page, regular, bold, { ...input, events }), bold);

  for (let index = 0; index < events.length; index++) {
    const row = prepareRow(events[index], index, regular, bold);
    if (y - row.height < FOOTER_TOP) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pages.push(page);
      y = drawTableHeader(page, drawDocumentHeader(page, regular, bold, { ...input, events }), bold);
    }
    y = drawRow(page, y, row, index, regular, bold);
  }

  pages.forEach((currentPage, index) => {
    currentPage.drawText("Даты и места могут уточняться. Перед поездкой проверьте актуальную информацию в календаре федерации.", { x: MARGIN, y: 20, size: 7.2, font: regular, color: colors.muted });
    const pageLabel = `${index + 1} / ${pages.length}`;
    currentPage.drawText(pageLabel, { x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(pageLabel, 7.2), y: 20, size: 7.2, font: regular, color: colors.muted });
  });

  return pdf.save();
}
