import { documentCategories, documentStatusLabels, type FederationDocument } from "@/content/documents";
import { DocumentError } from "@/lib/document-store";

export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
export const documentMimeTypes = {
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export function documentFields(form: FormData) {
  const text = (name: string, max: number, required = false) => {
    const raw = form.get(name);
    if (typeof raw !== "string" || raw.trim().length > max || (required && !raw.trim())) throw new DocumentError("Проверьте обязательные поля и длину текста.");
    return raw.trim();
  };
  const title = text("title", 300, true);
  const description = text("description", 3000, true);
  const source = text("source", 300, true);
  const category = text("category", 50);
  const status = text("status", 50);
  if (!Object.hasOwn(documentCategories, category) || !Object.hasOwn(documentStatusLabels, status)) throw new DocumentError("Выберите категорию и статус из списка.");
  return {
    title, description, source,
    category: category as FederationDocument["category"], status: status as FederationDocument["status"],
    documentNumber: text("documentNumber", 100), documentDate: text("documentDate", 50), edition: text("edition", 150),
  };
}

export async function validateDocumentFile(file: File) {
  if (!file.size || file.size > MAX_DOCUMENT_SIZE) throw new DocumentError("Выберите непустой файл размером до 20 МБ.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !Object.hasOwn(documentMimeTypes, extension)) throw new DocumentError("Допустимы PDF, DOCX, XLS и XLSX.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const signature = bytes.subarray(0, 8).toString("hex");
  const valid = extension === "pdf" ? bytes.subarray(0, 5).toString() === "%PDF-"
    : extension === "xls" ? signature === "d0cf11e0a1b11ae1"
    : signature.startsWith("504b0304") && bytes.includes(Buffer.from("[Content_Types].xml"))
      && bytes.includes(Buffer.from(extension === "docx" ? "word/document.xml" : "xl/workbook.xml"));
  if (!valid) throw new DocumentError("Содержимое файла не соответствует расширению.");
  return { bytes, fileType: extension as FederationDocument["fileType"], fileSize: `${Math.ceil(file.size / 1024).toLocaleString("ru-RU")} КБ` };
}

/** Ограничение применяется и к запросам без Content-Length. */
export async function readDocumentForm(request: Request): Promise<FormData> {
  const limit = MAX_DOCUMENT_SIZE + 64 * 1024;
  if (Number(request.headers.get("content-length")) > limit) throw new DocumentError("Файл превышает 20 МБ.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new DocumentError("Пустой запрос.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) { await reader.cancel(); throw new DocumentError("Файл превышает 20 МБ.", 413); }
      chunks.push(value);
    }
    return await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
  } catch (error) {
    if (error instanceof DocumentError) throw error;
    throw new DocumentError("Не удалось прочитать форму загрузки.");
  } finally { reader.releaseLock(); }
}
