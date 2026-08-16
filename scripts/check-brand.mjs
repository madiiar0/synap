import { execFileSync } from "node:child_process";
import fs from "node:fs";

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
}).trim().split("\n").filter(Boolean);
const textExtensions = new Set([".css", ".html", ".json", ".md", ".mjs", ".ts", ".tsx", ".txt", ".xml", ".yaml", ".yml"]);
// The visible former brand and every machine-readable spelling that preceded
// it. The literals are assembled so this file never trips its own check.
const formerBrand = ["Syn", "ap"].join("");
const formerCompact = `${formerBrand}AI`;
const forbidden = new RegExp(`(?:${formerBrand}|${formerCompact}|SYNAPAI|${formerBrand.toLowerCase()}-ai)`, "g");
// BUILDLOG.md is an append-only history: dated entries legitimately name the
// brand that was in force when they were written.
const skipped = new Set(["scripts/check-brand.mjs", "BUILDLOG.md"]);
const violations = [];

for (const file of files) {
  if (skipped.has(file) || file.startsWith("apps/client/dist")) continue;
  const extension = file.slice(file.lastIndexOf("."));
  if (!textExtensions.has(extension) || !fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    forbidden.lastIndex = 0;
    if (!forbidden.test(line)) return;
    violations.push(`${file}:${index + 1}: ${line.trim()}`);
  });
}

if (violations.length > 0) {
  console.error("Obsolete visible brand references found:\n" + violations.join("\n"));
  process.exit(1);
}
console.log("Brand check passed: no obsolete visible or machine-readable former-brand references found.");
