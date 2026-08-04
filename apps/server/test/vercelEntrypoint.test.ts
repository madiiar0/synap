import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const serverRoot = path.resolve(import.meta.dirname, "..");
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
});
