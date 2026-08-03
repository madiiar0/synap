import { execFileSync } from "node:child_process";
import fs from "node:fs";

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
}).trim().split("\n").filter(Boolean);
const textExtensions = new Set([".css", ".html", ".json", ".md", ".mjs", ".ts", ".tsx", ".txt", ".xml", ".yaml", ".yml"]);
const formerCompact = ["Synap", "AI"].join("");
const formerSpaced = ["Synap", " AI"].join("");
const forbidden = new RegExp(`(?:${formerCompact}|${formerSpaced}|SYNAPAI|synap-ai)`, "g");
const violations = [];

for (const file of files) {
  if (file === "scripts/check-brand.mjs" || file.startsWith("apps/client/dist")) continue;
  const extension = file.slice(file.lastIndexOf("."));
  if (!textExtensions.has(extension) || !fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    forbidden.lastIndex = 0;
    if (!forbidden.test(line)) return;
    const allowedEntityContinuity =
      file === "packages/shared/src/seo.ts" && line.includes("alternateName:");
    if (!allowedEntityContinuity) violations.push(`${file}:${index + 1}: ${line.trim()}`);
  });
}

if (violations.length > 0) {
  console.error("Obsolete visible brand references found:\n" + violations.join("\n"));
  process.exit(1);
}
console.log("Brand check passed: the former name appears only as structured-data entity continuity.");
