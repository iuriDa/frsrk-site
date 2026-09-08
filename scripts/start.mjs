import path from "node:path";
import { fileURLToPath } from "node:url";

// Next standalone меняет cwd: сохраняем один каталог данных между dev и start.
process.env.DOCUMENTS_DATA_DIR ||= path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/document-library");
await import("../.next/standalone/server.js");
