/**
 * i18n sweep (P4 exit gate):
 * 1. No hard-coded Cyrillic in apps/client/src outside the shared i18n JSONs
 *    (sample data lives in packages/shared, e.g. the marquee chips).
 * 2. ru.json and en.json have exactly mirrored key sets.
 * Non-zero exit on any violation.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientSrc = path.join(root, "apps/client/src");
const i18nDir = path.join(root, "packages/shared/src/i18n");

let failed = false;

// --- 1. Cyrillic scan over client source ---
const cyrillic = /[А-Яа-яЁё]/;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const offenders = [];
for (const file of walk(clientSrc)) {
  if (!/\.(ts|tsx|css|html)$/.test(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  if (cyrillic.test(content)) {
    const lines = content
      .split("\n")
      .map((line, i) => ({ line, n: i + 1 }))
      .filter(({ line }) => cyrillic.test(line))
      .slice(0, 3);
    offenders.push({ file: path.relative(root, file), lines });
  }
}

if (offenders.length > 0) {
  failed = true;
  console.error("✗ Hard-coded Cyrillic found outside i18n JSON:");
  for (const { file, lines } of offenders) {
    for (const { line, n } of lines) {
      console.error(`  ${file}:${n}  ${line.trim().slice(0, 80)}`);
    }
  }
}

// --- 2. Locale key parity ---
function keysOf(obj, prefix = "") {
  const out = [];
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") out.push(...keysOf(value, full));
    else out.push(full);
  }
  return out;
}

const ru = JSON.parse(fs.readFileSync(path.join(i18nDir, "ru.json"), "utf8"));
const en = JSON.parse(fs.readFileSync(path.join(i18nDir, "en.json"), "utf8"));
const ruKeys = new Set(keysOf(ru));
const enKeys = new Set(keysOf(en));
const missingInEn = [...ruKeys].filter((k) => !enKeys.has(k));
const missingInRu = [...enKeys].filter((k) => !ruKeys.has(k));

if (missingInEn.length > 0 || missingInRu.length > 0) {
  failed = true;
  if (missingInEn.length > 0) console.error("✗ Missing in en.json:", missingInEn.join(", "));
  if (missingInRu.length > 0) console.error("✗ Missing in ru.json:", missingInRu.join(", "));
}

if (failed) {
  process.exit(1);
}
console.log(
  `✓ i18n sweep clean: no hard-coded Cyrillic in apps/client/src; ${ruKeys.size} keys mirrored in ru/en`,
);
