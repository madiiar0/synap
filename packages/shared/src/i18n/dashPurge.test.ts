import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * §0.1 dash purge: no em/en dashes in user-facing copy — the i18n bundles,
 * every client component/page source file, and the shared quotes module.
 */
const DASH = /[—–]/;

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../..");

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function jsonOffenders(file: string): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  const scan = (node: unknown, prefix: string): void => {
    if (typeof node === "string") {
      if (DASH.test(node)) out.push({ key: prefix, value: node });
      return;
    }
    if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node)) {
        scan(value, prefix ? `${prefix}.${key}` : key);
      }
    }
  };
  scan(JSON.parse(fs.readFileSync(file, "utf8")), "");
  return out;
}

describe("dash purge (§0.1)", () => {
  it("i18n bundles contain no em/en dashes", () => {
    const offenders: string[] = [];
    for (const file of ["ru.json", "en.json"]) {
      for (const hit of jsonOffenders(path.join(here, file))) {
        offenders.push(`${file} → ${hit.key}: "${hit.value}"`);
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("client source files contain no em/en dashes", () => {
    const clientSrc = path.join(repoRoot, "apps/client/src");
    const offenders: string[] = [];
    for (const file of walk(clientSrc)) {
      if (!/\.(tsx|ts)$/.test(file)) continue;
      const lines = fs.readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (DASH.test(line)) {
          offenders.push(`${path.relative(repoRoot, file)}:${i + 1}  ${line.trim().slice(0, 80)}`);
        }
      });
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("quotes module contains no em/en dashes", () => {
    const file = path.resolve(here, "../quotes.ts");
    expect(DASH.test(fs.readFileSync(file, "utf8"))).toBe(false);
  });
});
