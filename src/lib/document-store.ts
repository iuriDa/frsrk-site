import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { federationDocuments, type FederationDocument } from "@/content/documents";

type Changes = Record<string, FederationDocument | null>;
export type DocumentCatalog = { documents: FederationDocument[]; revision: string };
export const documentsDirectory = () => path.resolve(process.env.DOCUMENTS_DATA_DIR || path.join(process.cwd(), "data/document-library"));

export class DocumentError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

async function readChanges(): Promise<Changes> {
  try {
    const parsed = JSON.parse(await readFile(path.join(documentsDirectory(), "catalog.json"), "utf8"));
    if (parsed.version !== 1 || !parsed.changes || typeof parsed.changes !== "object") throw new Error("Invalid document catalog");
    return parsed.changes as Changes;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

function catalog(changes: Changes): DocumentCatalog {
  const documents = new Map(federationDocuments.map((document) => [document.id, document]));
  for (const [id, document] of Object.entries(changes)) {
    if (document) documents.set(id, document); else documents.delete(id);
  }
  const list = [...documents.values()];
  return { documents: list, revision: createHash("sha256").update(JSON.stringify(list)).digest("hex") };
}

export async function readDocumentCatalog(): Promise<DocumentCatalog> {
  return catalog(await readChanges());
}

/** Межпроцессная блокировка + атомарная замена + защита от устаревшей формы. */
export async function changeDocumentCatalog(
  revision: string,
  update: (documents: FederationDocument[]) => Promise<{ id: string; document: FederationDocument | null }>,
): Promise<DocumentCatalog> {
  const directory = documentsDirectory();
  await mkdir(directory, { recursive: true });
  const lock = path.join(directory, ".write-lock");
  let locked = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { await mkdir(lock); locked = true; break; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  if (!locked) throw new DocumentError("Хранилище занято. Повторите сохранение через несколько секунд.", 503);
  const temporary = path.join(directory, `${randomUUID()}.tmp`);
  try {
    const changes = await readChanges();
    const current = catalog(changes);
    if (revision !== current.revision) throw new DocumentError("Список изменён другим редактором. Обновите список и повторите изменение.", 409);
    const result = await update(current.documents);
    changes[result.id] = result.document;
    await writeFile(temporary, JSON.stringify({ version: 1, changes }, null, 2), { flag: "wx", mode: 0o600 });
    await rename(temporary, path.join(directory, "catalog.json"));
    return catalog(changes);
  } finally {
    await rm(temporary, { force: true });
    await rm(lock, { recursive: true, force: true });
  }
}

export function documentFilePath(document: FederationDocument): string {
  if (document.storedFile) {
    if (!/^[a-f0-9-]+\.(pdf|docx|xlsx|xls)$/.test(document.storedFile)) throw new Error("Invalid stored filename");
    return path.join(documentsDirectory(), "files", document.storedFile);
  }
  // Только файлы исходного каталога; путь из запроса сюда не попадает.
  const original = federationDocuments.find((item) => item.id === document.id);
  if (!original) throw new DocumentError("Файл не найден.", 404);
  return path.join(process.cwd(), "public", original.fileUrl);
}

export const documentDownloadUrl = (id: string) => `/api/documents/${encodeURIComponent(id)}/file`;
