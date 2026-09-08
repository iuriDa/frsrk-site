import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireDocumentEditor, documentErrorResponse } from "@/lib/document-access";
import { changeDocumentCatalog, DocumentError, documentsDirectory, readDocumentCatalog } from "@/lib/document-store";
import { documentFields, readDocumentForm, validateDocumentFile } from "@/lib/document-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const response = (data: unknown) => Response.json(data, { headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  try { await requireDocumentEditor(request); return response(await readDocumentCatalog()); }
  catch (error) { return documentErrorResponse(error); }
}

export async function POST(request: Request) {
  let uploadedPath: string | undefined;
  try {
    await requireDocumentEditor(request);
    const form = await readDocumentForm(request);
    const fields = documentFields(form);
    const editingId = String(form.get("id") || "");
    const revision = String(form.get("revision") || "");
    const file = form.get("file");
    const upload = file instanceof File && file.name ? await validateDocumentFile(file) : undefined;
    const result = await changeDocumentCatalog(revision, async (documents) => {
      const existing = documents.find((document) => document.id === editingId);
      if (editingId && !existing) throw new DocumentError("Документ уже удалён. Обновите список.", 409);
      if (!existing && !upload) throw new DocumentError("Добавьте файл документа.");
      const id = existing?.id || randomUUID();
      let storedFile = existing?.storedFile;
      if (upload) {
        storedFile = `${randomUUID()}.${upload.fileType}`;
        await mkdir(path.join(documentsDirectory(), "files"), { recursive: true });
        uploadedPath = path.join(documentsDirectory(), "files", storedFile);
        await writeFile(uploadedPath, upload.bytes, { flag: "wx", mode: 0o600 });
      }
      return { id, document: {
        ...existing, ...fields, id, storedFile,
        // Смена источника не должна оставлять старую подпись издавшего органа.
        issuingAuthority: fields.source,
        orderNumber: fields.documentNumber, orderDate: fields.documentDate,
        fileUrl: `/api/documents/${id}/file`,
        fileType: upload?.fileType || existing!.fileType,
        fileSize: upload?.fileSize || existing!.fileSize,
        pages: upload ? undefined : existing?.pages,
        localFile: upload ? undefined : existing?.localFile,
        officialUrl: upload ? undefined : existing?.officialUrl,
        lastVerifiedAt: undefined,
      } };
    });
    return response(result);
  } catch (error) {
    if (uploadedPath) await rm(uploadedPath, { force: true }).catch(() => undefined);
    return documentErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireDocumentEditor(request);
    const form = await readDocumentForm(request);
    const id = String(form.get("id") || "");
    const result = await changeDocumentCatalog(String(form.get("revision") || ""), async (documents) => {
      if (!documents.some((document) => document.id === id)) throw new DocumentError("Документ уже удалён. Обновите список.", 409);
      return { id, document: null };
    });
    return response(result);
  } catch (error) { return documentErrorResponse(error); }
}
