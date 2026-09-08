import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const loadTs = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://municipalities-test.invalid";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";

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

const training = loadTs("../src/lib/where-to-train.ts");

test("активный муниципалитет виден до добавления организации", () => {
  const city = { id: "city-1", slug: "test", name: "Тест", territoryType: "city", mapX: 50, mapY: 50, responsibleName: "", responsibleRole: "", active: true, sortOrder: 0 };
  const hidden = { ...city, id: "city-2", slug: "hidden", name: "Скрытый", active: false };
  assert.deepEqual(training.getVisibleTrainingCities({ cities: [hidden, city], organizations: [] }).map((item) => item.id), ["city-1"]);
});

test("города и организации загружаются одним запросом без статического fallback", async () => {
  let requests = 0;
  global.fetch = async (input) => {
    requests += 1;
    const url = new URL(input instanceof Request ? input.url : String(input));
    assert.equal(url.origin, "https://municipalities-test.invalid");
    assert.equal(url.pathname, "/rest/v1/training_cities");
    assert.match(url.searchParams.get("select") ?? "", /organizations:training_organizations/);
    return Response.json([{
      id: "11111111-1111-4111-8111-111111111111",
      slug: "test-city",
      name: "Тестовый город",
      territory_type: "city",
      map_x: 44,
      map_y: 55,
      responsible_name: null,
      responsible_role: null,
      active: true,
      sort_order: 0,
      organizations: [{
        id: "22222222-2222-4222-8222-222222222222",
        city_id: "11111111-1111-4111-8111-111111111111",
        name: "Тестовая секция",
        organization_type: "sports_section",
        organization_type_other: null,
        address: "Тестовый адрес",
        phone: null,
        phone_secondary: null,
        max_url: null,
        website: null,
        vk: null,
        telegram: null,
        coach_name: null,
        description: null,
        active: true,
        sort_order: 0,
      }],
    }]);
  };

  const data = await training.fetchTrainingData();
  assert.equal(requests, 1);
  assert.equal(data.cities[0].name, "Тестовый город");
  assert.equal(data.organizations[0].name, "Тестовая секция");
  assert.equal(data.organizations[0].cityId, data.cities[0].id);
});
