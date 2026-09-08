import fs from "node:fs";

function readEnvironment() {
  const file = fs.existsSync(".env.local") ? ".env.local" : ".env";
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].replace(/^['\"]|['\"]$/g, "")]),
  );
}

const env = { ...readEnvironment(), ...process.env };
const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!baseUrl || !publishableKey) {
  console.error("Supabase: не заданы NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}

const headers = { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` };
const expectedColumns = {
  training_cities: ["id", "slug", "name", "territory_type", "map_x", "map_y", "responsible_name", "responsible_role", "active", "sort_order", "created_at", "updated_at"],
  training_organizations: ["id", "city_id", "name", "organization_type", "organization_type_other", "address", "phone", "phone_secondary", "max_url", "website", "vk", "telegram", "coach_name", "description", "active", "sort_order", "created_at", "updated_at"],
  calendar_events: ["id", "title", "cat", "tbd", "starts_on", "ends_on", "yr", "mo", "place", "rank", "org", "ekp", "updated_at"],
};

async function timedFetch(path, options = {}) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const body = await response.json().catch(() => null);
  return { response, body, duration: Math.round(performance.now() - started) };
}

const citySelect = "id,slug,name,territory_type,map_x,map_y,responsible_name,responsible_role,active,sort_order,organizations:training_organizations(id,city_id,name,organization_type,organization_type_other,address,phone,phone_secondary,max_url,website,vk,telegram,coach_name,description,active,sort_order)";
const migrationColumns = [
  ["training_cities", "territory_type"],
  ["training_organizations", "organization_type"],
  ["training_organizations", "organization_type_other"],
  ["training_organizations", "max_url"],
];
const tableChecks = await Promise.all(Object.entries(expectedColumns).map(async ([table, columns]) => ({
  table,
  columns,
  result: await timedFetch(`${table}?select=${columns.join(",")}&limit=1`),
})));
const columnChecks = await Promise.all(migrationColumns.map(async ([table, column]) => ({
  table,
  column,
  result: await timedFetch(`${table}?select=${column}&limit=0`),
})));
const combined = await timedFetch(`training_cities?select=${encodeURIComponent(citySelect)}`);
const calendar = await timedFetch("calendar_events?select=id,title,cat,tbd,starts_on,ends_on,yr,mo,place,rank,org,ekp&limit=1");
const contentEditor = await timedFetch("rpc/is_content_editor", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
const calendarEditor = await timedFetch("rpc/is_calendar_editor", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });

const missing = columnChecks
  .filter(({ result }) => !result.response.ok)
  .map(({ table, column }) => `${table}.${column}`);
for (const { table, columns, result } of tableChecks) {
  if (!result.response.ok) {
    if (result.response.status === 404) missing.push(`${table}: таблица недоступна`);
    continue;
  }
  if (Array.isArray(result.body) && result.body[0]) {
    const available = new Set(Object.keys(result.body[0]));
    const absent = columns.filter((column) => !available.has(column));
    if (absent.length) missing.push(`${table}: ${absent.join(", ")}`);
  }
}

console.log(`Муниципалитеты + организации: ${combined.response.status}, ${combined.duration} мс, 1 запрос`);
console.log(`Календарь: ${calendar.response.status}, ${calendar.duration} мс`);
console.log(`is_content_editor: ${contentEditor.response.status}, анонимный результат ${String(contentEditor.body)}`);
console.log(`is_calendar_editor: ${calendarEditor.response.status}, ${calendarEditor.response.ok ? `анонимный результат ${String(calendarEditor.body)}` : "доступ без входа закрыт"}`);

if (missing.length) {
  console.error(`Отсутствуют поля:\n- ${missing.join("\n- ")}`);
}
if (!combined.response.ok) {
  console.error(`Запрос муниципалитетов: ${combined.body?.message || `HTTP ${combined.response.status}`}`);
}
if (!calendar.response.ok) {
  console.error(`Запрос календаря: ${calendar.body?.message || `HTTP ${calendar.response.status}`}`);
}

if (missing.length || !combined.response.ok || !calendar.response.ok || !contentEditor.response.ok) process.exit(1);
