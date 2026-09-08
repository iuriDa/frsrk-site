import { CATEGORIES, CATEGORY_KEYS, MAX_YEAR, MIN_YEAR, type CalendarEvent } from "@/lib/calendar";
import { createCalendarPdf, type CalendarPdfInput } from "@/lib/calendar-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function invalid(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

const text = (value: unknown, max: number) => typeof value === "string" && value.trim().length <= max;
const isoDate = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const MAX_REQUEST_BYTES = 512 * 1024;

async function readJson(request: Request): Promise<unknown> {
  if (!request.body) throw new Error("empty request");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new RangeError("request too large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function isEvent(value: unknown): value is CalendarEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;
  const tbd = typeof event.tbd === "boolean" && event.tbd;
  return text(event.id, 120) && Boolean(String(event.id).trim()) && text(event.title, 500) && Boolean(String(event.title).trim())
    && typeof event.cat === "string" && CATEGORY_KEYS.includes(event.cat as CalendarEvent["cat"])
    && typeof event.tbd === "boolean" && Number.isInteger(event.year) && Number(event.year) >= MIN_YEAR && Number(event.year) <= MAX_YEAR
    && Number.isInteger(event.month) && Number(event.month) >= 1 && Number(event.month) <= 12
    && text(event.place, 300) && text(event.rank, 300) && text(event.org, 300) && typeof event.ekp === "boolean"
    && (tbd || (isoDate(event.start) && isoDate(event.end) && String(event.end) >= String(event.start)));
}

function isInput(value: unknown): value is CalendarPdfInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return text(input.period, 50) && Array.isArray(input.categories) && input.categories.length <= CATEGORY_KEYS.length
    && input.categories.every((category) => typeof category === "string" && Object.values(CATEGORIES).some((meta) => meta.name === category))
    && Array.isArray(input.events) && input.events.length > 0 && input.events.length <= 1000 && input.events.every(isEvent);
}

export async function POST(request: Request) {
  try {
    const declaredLength = Number(request.headers.get("content-length"));
    if (declaredLength > MAX_REQUEST_BYTES) return invalid("Слишком большой список мероприятий.", 413);
    const input: unknown = await readJson(request);
    if (!isInput(input)) return invalid("Не удалось подготовить PDF: данные календаря некорректны.");
    const bytes = await createCalendarPdf(input);
    const suffix = /^\d{4}$/.test(input.period) ? input.period : "vse-gody";
    return new Response(Buffer.from(bytes), { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kalendar-frsrk-${suffix}.pdf"`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    if (error instanceof RangeError) return invalid("Слишком большой список мероприятий.", 413);
    return invalid("Не удалось сформировать PDF. Повторите попытку.", 500);
  }
}
