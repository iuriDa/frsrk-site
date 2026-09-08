/* Изолированные интеграционные проверки: временные файлы и имитация Auth API. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const loadTs = createRequire(import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "frsrk-documents-test-"));
process.env.DOCUMENTS_DATA_DIR = directory;
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://documents-test.invalid";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";

// Компилируем настоящие TS-модули существующим TypeScript, без копий реализации.
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolveFilename.call(this, request.startsWith("@/") ? path.join(root, "src", request.slice(2)) : request, ...args);
};
loadTs.extensions[".ts"] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  module._compile(outputText, filename);
};

let permissionChecks = 0;
global.fetch = async (input, init) => {
  const url = new URL(String(input));
  assert.equal(url.origin, "https://documents-test.invalid", "Тест не обращается к настоящему Supabase");
  const token = new Headers(init?.headers).get("authorization");
  if (url.pathname === "/auth/v1/user") {
    return Response.json(token === "Bearer invalid" ? { message: "Invalid token" } : { id: "test-user", email: "editor@example.test" }, { status: token === "Bearer invalid" ? 401 : 200 });
  }
  assert.equal(url.pathname, "/rest/v1/rpc/is_calendar_editor");
  permissionChecks++;
  return Response.json(token === "Bearer test-editor");
};

const route = loadTs("../src/app/api/documents/route.ts");
const download = loadTs("../src/app/api/documents/[id]/file/route.ts");
const store = loadTs("../src/lib/document-store.ts");
const { PDFDocument } = loadTs("pdf-lib");
const { createCalendarPdf } = loadTs("../src/lib/calendar-export.ts");
const calendarPdfRoute = loadTs("../src/app/api/calendar/pdf/route.ts");
const { validateDocumentFile, readDocumentForm } = loadTs("../src/lib/document-upload.ts");
const pdf = fs.readFileSync(path.join(root, "public/documents/polozhenie-evsk-173-2025.pdf"));
const request = (method, form, token = "test-editor") => new Request("http://localhost/api/documents", {
  method, body: form, headers: token ? { authorization: `Bearer ${token}` } : {},
});
function form(revision, id = "", file = pdf) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ revision, id, title: "Проверка загрузки", description: "Только во временном хранилище", source: "Тестовый источник", category: "standarty", status: "requiresVerification", documentNumber: "", documentDate: "", edition: "" })) data.set(key, value);
  if (file) data.set("file", new File([file], "test.pdf", { type: "application/pdf" }));
  return data;
}

test("каталог, права доступа, загрузка, замена, конфликт и удаление", async () => {
  try {
    const initial = await store.readDocumentCatalog();
    assert.equal(initial.documents.length, 9);
    assert.equal(new Set(initial.documents.map((item) => item.id)).size, 9);
    for (const method of ["GET", "POST", "DELETE"]) {
      for (const [token, status] of [[null, 401], ["invalid", 401], ["viewer", 403]]) {
        assert.equal((await route[method](request(method, method === "GET" ? undefined : form(initial.revision), token))).status, status);
      }
    }
    assert.equal((await route.GET(request("GET"))).status, 200);
    assert.equal((await route.POST(request("POST", form(initial.revision, "", Buffer.from("fake PDF"))))).status, 400);
    const prototypeCategory = form(initial.revision); prototypeCategory.set("category", "__proto__");
    assert.equal((await route.POST(request("POST", prototypeCategory))).status, 400);
    assert.equal((await route.POST(request("POST", form(initial.revision, "", null)))).status, 400);

    let response = await route.POST(request("POST", form(initial.revision)));
    assert.equal(response.status, 200);
    let state = await response.json();
    const added = state.documents.find((item) => item.title === "Проверка загрузки");
    assert(added.storedFile); assert.equal(state.documents.length, 10);
    response = await download.GET(new Request("http://localhost"), { params: Promise.resolve({ id: added.id }) });
    assert.equal(response.status, 200); assert.match(response.headers.get("content-disposition"), /attachment/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), pdf);
    const stale = await route.POST(request("POST", form(initial.revision, added.id)));
    assert.equal(stale.status, 409);

    const edit = form(state.revision, added.id, null); edit.set("title", "Обновлённый документ");
    response = await route.POST(request("POST", edit)); assert.equal(response.status, 200); state = await response.json();
    assert.equal(state.documents.find((item) => item.id === added.id).storedFile, added.storedFile);
    const replacement = form(state.revision, added.id, Buffer.concat([pdf, Buffer.from("\n% replacement test\n")]));
    response = await route.POST(request("POST", replacement)); assert.equal(response.status, 200); state = await response.json();
    assert.notEqual(state.documents.find((item) => item.id === added.id).storedFile, added.storedFile);
    assert.equal((await store.readDocumentCatalog()).revision, state.revision, "Сохранение на диске");

    const deletion = new FormData(); deletion.set("id", added.id); deletion.set("revision", state.revision);
    response = await route.DELETE(request("DELETE", deletion)); assert.equal(response.status, 200);
    assert.equal((await response.json()).documents.length, initial.documents.length);
    assert.equal((await download.GET(new Request("http://localhost"), { params: Promise.resolve({ id: added.id }) })).status, 404);
    assert.equal((await download.GET(new Request("http://localhost"), { params: Promise.resolve({ id: "../../.env.local" }) })).status, 404);

    const seedState = await store.readDocumentCatalog();
    const seedEdit = form(seedState.revision, "evsk-299-2026", null);
    response = await route.POST(request("POST", seedEdit)); assert.equal(response.status, 200);
    response = await download.GET(new Request("http://localhost"), { params: Promise.resolve({ id: "evsk-299-2026" }) });
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), fs.readFileSync(path.join(root, "public/documents/evsk-299-2026.xls")));
    assert(permissionChecks >= 10, "Сервер проверяет роль при запросах");
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test("проверка форматов и ограничение загрузки", async () => {
  await assert.rejects(validateDocumentFile(new File(["<html>"], "wrong.pdf")), /не соответствует/);
  await assert.rejects(validateDocumentFile(new File(["%PDF-"], "wrong.html")), /Допустимы/);
  await assert.rejects(readDocumentForm(new Request("http://localhost", { method: "POST", headers: { "Content-Length": String(30 * 1024 * 1024) }, body: "too large" })), /20 МБ/);
  const xls = fs.readFileSync(path.join(root, "public/documents/evsk-299-2026.xls"));
  assert.equal((await validateDocumentFile(new File([xls], "norms.xls"))).fileType, "xls");
});

test("PDF мероприятий: русский текст, несколько страниц и проверка входных данных", async () => {
  const common = { year: 2026, month: 9, cat: "mr", place: "Симферополь", rank: "", org: "", ekp: false };
  const events = [
    { ...common, id: "2", title: "Неизвестная дата", tbd: true },
    ...Array.from({ length: 35 }, (_, index) => ({
      ...common, id: String(index + 3), title: `Межрегиональное мероприятие № ${index + 1}`, tbd: false,
      start: `2026-09-${String((index % 28) + 1).padStart(2, "0")}`, end: `2026-09-${String((index % 28) + 1).padStart(2, "0")}`,
    })),
  ];
  const bytes = await createCalendarPdf({ events, period: "2026", categories: ["Межрегиональные"] });
  assert.equal(Buffer.from(bytes).subarray(0, 5).toString(), "%PDF-");
  const pdf = await PDFDocument.load(bytes);
  assert(pdf.getPageCount() > 1); assert.match(pdf.getTitle(), /2026/);
  if (process.env.CALENDAR_PDF_SAMPLE) fs.writeFileSync(process.env.CALENDAR_PDF_SAMPLE, bytes);

  let response = await calendarPdfRoute.POST(new Request("http://localhost/api/calendar/pdf", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events: events.slice(0, 2), period: "2026", categories: ["Межрегиональные"] }),
  }));
  assert.equal(response.status, 200); assert.equal(response.headers.get("content-type"), "application/pdf");
  assert.match(response.headers.get("content-disposition"), /kalendar-frsrk-2026\.pdf/);
  assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString(), "%PDF-");

  response = await calendarPdfRoute.POST(new Request("http://localhost/api/calendar/pdf", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ events: [], period: "2026", categories: [] }),
  }));
  assert.equal(response.status, 400);

  response = await calendarPdfRoute.POST(new Request("http://localhost/api/calendar/pdf", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "x".repeat(513 * 1024),
  }));
  assert.equal(response.status, 413);
});
