import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Служебные каталоги, не относящиеся к исходному коду сайта.
    ".claude/**",
    ".agents/**",
    ".codex/**",
    "node_modules/**",
    "dist/**",
    "coverage/**",
    "public/**",
  ]),
]);

export default eslintConfig;
