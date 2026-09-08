import { createClient } from "@supabase/supabase-js";
import { DocumentError } from "@/lib/document-store";

/** Проверяем токен и существующие права редактора на сервере при каждом запросе. */
export async function requireDocumentEditor(request: Request): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new DocumentError("Вход редактора пока не настроен.", 503);
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new DocumentError("Войдите в учётную запись редактора.", 401);
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new DocumentError("Сеанс завершён. Войдите снова.", 401);
  const permission = await client.rpc("is_calendar_editor");
  if (permission.error || permission.data !== true) throw new DocumentError("У этой учётной записи нет прав редактора.", 403);
}

export function documentErrorResponse(error: unknown): Response {
  return Response.json({ error: error instanceof DocumentError ? error.message : "Не удалось обратиться к хранилищу документов. Повторите попытку." }, {
    status: error instanceof DocumentError ? error.status : 500,
    headers: { "Cache-Control": "no-store" },
  });
}
