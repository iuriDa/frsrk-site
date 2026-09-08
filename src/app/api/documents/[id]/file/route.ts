import { readFile } from "node:fs/promises";
import { documentErrorResponse } from "@/lib/document-access";
import { DocumentError, documentFilePath, readDocumentCatalog } from "@/lib/document-store";
import { documentMimeTypes } from "@/lib/document-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { documents } = await readDocumentCatalog();
    const document = documents.find((item) => item.id === id);
    if (!document) throw new DocumentError("Документ не найден.", 404);
    const bytes = await readFile(documentFilePath(document));
    return new Response(bytes, { headers: {
      "Content-Type": documentMimeTypes[document.fileType],
      "Content-Disposition": `attachment; filename="document.${document.fileType}"; filename*=UTF-8''${encodeURIComponent(document.title.replace(/[\r\n]/g, "") + "." + document.fileType)}`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return documentErrorResponse(new DocumentError("Файл не найден.", 404));
    return documentErrorResponse(error);
  }
}
