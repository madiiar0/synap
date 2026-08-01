import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * #1 regression guard.
 *
 * The Tailwind theme defines a COLOR named `base` (#FAFAFA). Tailwind therefore
 * emits `text-base` twice: once as a font-size and once as a text colour. The
 * colour wins, so `class="text-ink ... sm:text-base"` renders near-white text
 * on a near-white background from the `sm` breakpoint up. That is exactly how
 * the marquee prompts became invisible on laptop and desktop while staying
 * readable on mobile.
 *
 * Any font-size intent must use an explicit value (`text-[1rem]`) instead.
 */
const clientSrc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(tsx?|css)$/.test(entry.name) ? [full] : [];
  });
}

describe("tailwind token collisions (#1)", () => {
  it("never uses the ambiguous `text-base` utility", () => {
    const offenders: string[] = [];
    for (const file of walk(clientSrc)) {
      if (file.endsWith("tailwindTokens.test.ts")) continue;
      fs.readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          // Matches `text-base` and any responsive/state prefix of it.
          if (/(?:^|["'\s:])(?:[a-z-]+:)*text-base(?![\w-])/.test(line)) {
            offenders.push(`${path.relative(clientSrc, file)}:${i + 1}`);
          }
        });
    }
    expect(
      offenders,
      `\`text-base\` resolves to the theme colour #FAFAFA, not a font size. Use text-[1rem].\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
