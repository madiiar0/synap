import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { synapFaviconSvg } from "./icon-source.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "apps/client/public");
const html = fs.readFileSync(path.join(root, "apps/client/index.html"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(publicDir, "site.webmanifest"), "utf8"));

const referenced = [
  ...[...html.matchAll(/<(?:link)[^>]+href="([^"]+)"/g)].map((match) => match[1]),
  ...manifest.icons.map((icon) => icon.src),
].filter((href) => href.startsWith("/"));

for (const href of referenced) {
  assert.ok(fs.existsSync(path.join(publicDir, href.slice(1))), `missing referenced icon: ${href}`);
}

const svgPath = path.join(publicDir, "favicon.svg");
const svg = fs.readFileSync(svgPath, "utf8");
assert.equal(svg, synapFaviconSvg(24), "favicon.svg must be generated from icon-source.mjs");
assert.match(svg, /<circle cx="12" cy="12" r="11" fill="#FFFFFF"\/>/);
assert.match(svg, /scale\(0\.78\)/);
assert.doesNotMatch(svg, /<rect/);

async function inspectRaster(input, expectedSize, label) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, expectedSize, `${label} width`);
  assert.equal(info.height, expectedSize, `${label} height`);

  const pixel = (x, y) => {
    const offset = (y * info.width + x) * 4;
    return data.subarray(offset, offset + 4);
  };
  for (const [x, y] of [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1],
  ]) {
    assert.ok(pixel(x, y)[3] < 32, `${label} must have transparent corners`);
  }

  let whitePixels = 0;
  let blackPixels = 0;
  let blackMinX = info.width;
  let blackMaxX = -1;
  let blackMinY = info.height;
  let blackMaxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const [red, green, blue, alpha] = pixel(x, y);
      if (alpha > 200 && red > 235 && green > 235 && blue > 235) whitePixels += 1;
      if (alpha > 200 && red < 55 && green < 55 && blue < 55) {
        blackPixels += 1;
        blackMinX = Math.min(blackMinX, x);
        blackMaxX = Math.max(blackMaxX, x);
        blackMinY = Math.min(blackMinY, y);
        blackMaxY = Math.max(blackMaxY, y);
      }
    }
  }
  assert.ok(whitePixels > expectedSize * expectedSize * 0.15, `${label} needs a white circle`);
  assert.ok(blackPixels > expectedSize * expectedSize * 0.02, `${label} needs the black mark`);
  assert.ok(blackMinX >= expectedSize * 0.12 && blackMaxX <= expectedSize * 0.88, `${label} horizontal padding`);
  assert.ok(blackMinY >= expectedSize * 0.12 && blackMaxY <= expectedSize * 0.88, `${label} vertical padding`);
}

for (const [filename, size] of [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await inspectRaster(path.join(publicDir, filename), size, filename);
}
await inspectRaster(Buffer.from(synapFaviconSvg(48)), 48, "favicon.svg at 48px");

const ico = fs.readFileSync(path.join(publicDir, "favicon.ico"));
assert.equal(ico.readUInt16LE(4), 2, "favicon.ico should contain 16px and 32px entries");
for (const [index, size] of [16, 32].entries()) {
  const directoryOffset = 6 + index * 16;
  assert.equal(ico.readUInt8(directoryOffset), size);
  assert.equal(ico.readUInt8(directoryOffset + 1), size);
  const length = ico.readUInt32LE(directoryOffset + 8);
  const offset = ico.readUInt32LE(directoryOffset + 12);
  assert.deepEqual(
    ico.subarray(offset, offset + length),
    fs.readFileSync(path.join(publicDir, `favicon-${size}.png`)),
  );
}

console.log(`Icon check passed: ${referenced.length} HTML/manifest references and circular 16/32/48/180/192/512px assets.`);
