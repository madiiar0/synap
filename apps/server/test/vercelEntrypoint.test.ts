import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const serverRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(serverRoot, "../..");
const recognizedNames = ["app", "index", "server"];
const recognizedExtensions = ["js", "cjs", "mjs", "ts", "cts", "mts"];

describe("Vercel Express entrypoint", () => {
  it("has one unambiguous recognized entrypoint", () => {
    const candidates = [serverRoot, path.join(serverRoot, "src")].flatMap((directory) =>
      recognizedNames.flatMap((name) =>
        recognizedExtensions.map((extension) => path.join(directory, `${name}.${extension}`)),
      ),
    );
    const entrypoints = candidates
      .filter((candidate) => fs.existsSync(candidate))
      .map((candidate) => path.relative(serverRoot, candidate));

    expect(entrypoints).toEqual([path.join("src", "index.ts")]);
  });

  it("builds and includes the shared workspace runtime", () => {
    const vercelConfig = JSON.parse(
      fs.readFileSync(path.join(serverRoot, "vercel.json"), "utf8"),
    ) as { functions?: { "src/index.ts"?: { includeFiles?: string } } };

    expect(vercelConfig.functions?.["src/index.ts"]?.includeFiles).toBe(
      "../../packages/shared/dist/**",
    );

    const sharedPackage = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "packages/shared/package.json"), "utf8"),
    ) as {
      main?: string;
      exports?: { "."?: { types?: string; default?: string } };
    };
    expect(sharedPackage.main).toBe("./dist/index.js");
    expect(sharedPackage.exports?.["."]?.default).toBe("./dist/index.js");
  });
});
