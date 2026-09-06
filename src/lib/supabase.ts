import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Публичный (browser) клиент Supabase.
 *
 * Использует ТОЛЬКО публикуемый (publishable / anon) ключ из переменных окружения —
 * никаких service_role ключей в клиентском коде. Доступ к данным ограничен
 * политиками RLS на стороне Supabase (см. supabase-calendar.sql): читать
 * calendar_events могут все, менять — только редакторы из calendar_editors.
 *
 * Если переменные окружения не заданы, возвращается null; разделы с данными из
 * Supabase показывают пустое состояние вместо локальных mock/fallback-записей.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (cached) return cached;
  cached = createClient(SUPABASE_URL as string, SUPABASE_PUBLISHABLE_KEY as string, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return cached;
}
