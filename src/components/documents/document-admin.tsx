"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Download, LogOut, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { documentCategories, documentStatusLabels, type FederationDocument } from "@/content/documents";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { DocumentCatalog } from "@/lib/document-store";
import styles from "./document-admin.module.css";

type Phase = "loading" | "login" | "ready" | "denied" | "error";
type Draft = { document: FederationDocument | null; revision: string };
const downloadUrl = (id: string) => `/api/documents/${encodeURIComponent(id)}/file`;

export function DocumentAdmin() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [catalog, setCatalog] = useState<DocumentCatalog>({ documents: [], revision: "" });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    try {
      const client = getSupabaseClient();
      const session = await client?.auth.getSession();
      if (!session?.data.session) { setPhase("login"); setCatalog({ documents: [], revision: "" }); setDraft(null); return; }
      setEmail(session.data.session.user.email || "");
      const response = await fetch("/api/documents", { headers: { Authorization: `Bearer ${session.data.session.access_token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setPhase(response.status === 403 ? "denied" : response.status === 401 ? "login" : "error");
        setError(data.error || "Не удалось загрузить документы.");
        return;
      }
      setCatalog(data); setPhase("ready"); setError("");
    } catch { setPhase("error"); setError("Не удалось загрузить документы. Проверьте соединение и повторите попытку."); }
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    let timer: number | undefined;
    // INITIAL_SESSION запускает первую загрузку; методы Auth вызываем вне callback.
    const subscription = client?.auth.onAuthStateChange(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { void load(); }, 0);
    });
    return () => { window.clearTimeout(timer); subscription?.data.subscription.unsubscribe(); };
  }, [load]);

  useEffect(() => {
    if (draft) {
      formRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      formRef.current?.querySelector<HTMLInputElement>("input[name=title]")?.focus({ preventScroll: true });
    }
  }, [draft]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error("Вход редактора не настроен.");
      const result = await client.auth.signInWithPassword({ email: String(form.get("email")).trim(), password: String(form.get("password")) });
      if (result.error) throw new Error("Не удалось войти. Проверьте почту и пароль.");
      await load();
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось войти."); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true);
    try {
      const result = await getSupabaseClient()?.auth.signOut();
      if (result?.error) throw result.error;
      setDraft(null); setMessage(""); setError(""); setPhase("login");
    } catch { setError("Не удалось выйти. Повторите попытку."); }
    finally { setBusy(false); }
  }

  async function mutate(method: "POST" | "DELETE", form: FormData): Promise<boolean> {
    setBusy(true); setError(""); setMessage("");
    try {
      const session = await getSupabaseClient()?.auth.getSession();
      if (!session?.data.session) { setPhase("login"); throw new Error("Войдите снова, чтобы сохранить изменения."); }
      const response = await fetch("/api/documents", { method, headers: { Authorization: `Bearer ${session.data.session.access_token}` }, body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось сохранить изменения.");
      setCatalog(data); setDraft(null);
      setMessage(method === "DELETE" ? "Документ удалён из каталога сайта." : "Документ сохранён. Изменения уже видны на сайте.");
      return true;
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось сохранить изменения."); return false; }
    finally { setBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const form = new FormData(event.currentTarget);
    form.set("id", draft.document?.id || ""); form.set("revision", draft.revision);
    const file = form.get("file");
    if (file instanceof File && file.size > 20 * 1024 * 1024) { setError("Выберите файл размером до 20 МБ."); return; }
    await mutate("POST", form);
  }

  async function remove(document: FederationDocument) {
    if (!window.confirm(`Удалить «${document.title}» из каталога сайта?`)) return;
    const form = new FormData(); form.set("id", document.id); form.set("revision", catalog.revision);
    await mutate("DELETE", form);
  }

  if (!isSupabaseConfigured) return <section className={styles.gate}><h2>Вход редактора не настроен</h2><p>Для управления документами требуется подключение существующей учётной записи редактора сайта.</p></section>;

  const notices = <div aria-live="polite">{error ? <p role="alert" className={styles.error}>{error}</p> : null}{message ? <p className={styles.success}>{message}</p> : null}</div>;
  if (phase === "loading") return <p role="status">Проверяем доступ…</p>;
  if (phase === "login") return <section className={styles.gate}>
    <h2>Вход редактора</h2><p>Используйте почту и пароль редактора календаря.</p>
    <form onSubmit={login} className={styles.login}>
      <label>Электронная почта<input name="email" type="email" autoComplete="username" required disabled={busy} /></label>
      <label>Пароль<input name="password" type="password" autoComplete="current-password" required disabled={busy} /></label>
      {notices}<button className={styles.primary} disabled={busy}>{busy ? "Входим…" : "Войти"}</button>
    </form></section>;
  if (phase === "denied" || phase === "error") return <section className={styles.gate}>
    <h2>{phase === "denied" ? "Нужны права редактора" : "Не удалось открыть каталог"}</h2>{notices}
    <div className={styles.actions}><button onClick={() => void load()} disabled={busy}>Повторить</button><button onClick={() => void logout()} disabled={busy}>Выйти</button></div>
  </section>;

  const visible = catalog.documents.filter((document) => `${document.title} ${document.description} ${document.documentNumber || ""}`.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru")));
  const doc = draft?.document;
  return <section className={styles.admin} aria-label="Каталог документов">
    <div className={styles.toolbar}>
      <div><strong>{catalog.documents.length} документов</strong><p>{email}</p></div>
      <div className={styles.actions}>
        <button className={styles.primary} disabled={busy || !!draft} onClick={() => { setDraft({ document: null, revision: catalog.revision }); setError(""); setMessage(""); }}><Plus size={17} aria-hidden="true" />Добавить документ</button>
        <button onClick={() => void load()} disabled={busy}><RefreshCw size={17} aria-hidden="true" />Обновить список</button>
        <button onClick={() => void logout()} disabled={busy}><LogOut size={17} aria-hidden="true" />Выйти</button>
      </div>
    </div>
    {!draft ? notices : null}
    {draft ? <form ref={formRef} key={doc?.id || "new"} onSubmit={save} className={styles.editor}>
      <h2>{doc ? "Редактирование документа" : "Новый документ"}</h2>
      <fieldset disabled={busy}>
        <label>Название<input name="title" defaultValue={doc?.title} maxLength={300} required /></label>
        <label>Описание<textarea name="description" defaultValue={doc?.description} maxLength={3000} rows={4} required /></label>
        <div className={styles.fields}>
          <label>Категория<select name="category" defaultValue={doc?.category || "standarty"}>{Object.entries(documentCategories).map(([key, category]) => <option key={key} value={key}>{category.label}</option>)}</select></label>
          <label>Актуальность<select name="status" defaultValue={doc ? (doc.status ?? "current") : "requiresVerification"}>{Object.entries(documentStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        </div>
        <label>Источник / издавшая организация<input name="source" defaultValue={doc?.source} maxLength={300} required /></label>
        <div className={styles.fields}>
          <label>Номер приказа<input name="documentNumber" defaultValue={doc?.documentNumber} maxLength={100} /></label>
          <label>Дата документа<input name="documentDate" defaultValue={doc?.documentDate} maxLength={50} placeholder="ДД.ММ.ГГГГ или год" /></label>
        </div>
        <label>Редакция<input name="edition" defaultValue={doc?.edition} maxLength={150} /></label>
        <label>{doc ? "Заменить файл" : "Файл документа"}<input name="file" type="file" accept=".pdf,.docx,.xls,.xlsx" required={!doc} aria-describedby="document-file-hint" /></label>
        <p id="document-file-hint" className={styles.hint}>PDF, DOCX, XLS или XLSX, до 20 МБ.{doc ? ` Сейчас: ${doc.fileType.toUpperCase()}, ${doc.fileSize}. Оставьте поле пустым, чтобы сохранить файл.` : ""}</p>
        {notices}
        <div className={styles.actions}><button className={styles.primary} type="submit">{busy ? "Сохраняем…" : "Сохранить на сайте"}</button><button type="button" onClick={() => { if (window.confirm("Закрыть форму без сохранения изменений?")) { setDraft(null); setError(""); } }}>Отмена</button></div>
      </fieldset>
    </form> : null}
    <label className={styles.search}>Поиск по документам<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название, номер приказа или описание" /></label>
    <p className={styles.hint} aria-live="polite">Найдено: {visible.length}</p>
    <ul className={styles.list}>{visible.map((document) => <li key={document.id}>
      <div className={styles.details}><p className={styles.meta}>{documentCategories[document.category].label} · {documentStatusLabels[document.status || "current"]}</p>
        <h2>{document.title}</h2><p>{document.description}</p><p className={styles.meta}>{document.fileType.toUpperCase()} · {document.fileSize}{document.edition ? ` · Ред. ${document.edition}` : ""}</p>
      </div>
      <div className={styles.actions}>
        <a href={downloadUrl(document.id)} download aria-label={`Скачать: ${document.title}`}><Download size={17} aria-hidden="true" />Скачать</a>
        <button disabled={busy || !!draft} onClick={() => { setDraft({ document, revision: catalog.revision }); setError(""); setMessage(""); }} aria-label={`Редактировать: ${document.title}`}><Pencil size={17} aria-hidden="true" />Изменить</button>
        <button className={styles.danger} disabled={busy || !!draft} onClick={() => void remove(document)} aria-label={`Удалить: ${document.title}`}><Trash2 size={17} aria-hidden="true" />Удалить</button>
      </div>
    </li>)}</ul>
    {!visible.length ? <p className={styles.empty}>{catalog.documents.length ? "По этому запросу ничего не найдено. Измените запрос." : "Документов пока нет. Нажмите «Добавить документ», чтобы загрузить первый файл."}</p> : null}
  </section>;
}
