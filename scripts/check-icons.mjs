import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { akruxFaviconSvg, akruxIconPng, CORNER_RADIUS, MARK_SCALE } from "./icon-source.mjs";

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
assert.equal(svg, await akruxFaviconSvg(24), "favicon.svg must be generated from icon-source.mjs");
// The plate is a rounded square, not a circle.
assert.match(
  svg,
  new RegExp(`<rect width="24" height="24" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}" fill="#0A0A0A"/>`),
  "favicon.svg must use a rounded-square plate",
);
assert.doesNotMatch(svg, /<circle/, "the plate must not be a circle");
assert.ok(CORNER_RADIUS > 0 && CORNER_RADIUS < 12, "corner radius must round without becoming a circle");
// The symbol is centred and aspect-preserving: width is pinned to MARK_SCALE
// and the height follows the artwork, so it is never stretched.
const inner = Number((24 * MARK_SCALE).toFixed(4));
const offsetX = Number(((24 - inner) / 2).toFixed(4));
const placed = svg.match(
  /<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" preserveAspectRatio="xMidYMid meet" href="data:image\/png;base64,/,
);
assert.ok(placed, "favicon.svg must embed the symbol as a placed image");
assert.equal(Number(placed[3]), inner, "symbol width must follow MARK_SCALE");
assert.equal(Number(placed[1]), offsetX, "symbol must be horizontally centred");
assert.equal(
  Number(placed[2]).toFixed(2),
  ((24 - Number(placed[4])) / 2).toFixed(2),
  "symbol must be vertically centred",
);

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

  let platePixels = 0;
  let symbolPixels = 0;
  let symbolMinX = info.width;
  let symbolMaxX = -1;
  let symbolMinY = info.height;
  let symbolMaxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const [red, green, blue, alpha] = pixel(x, y);
      if (alpha > 200 && red < 55 && green < 55 && blue < 55) platePixels += 1;
      // Deliberately loose: at 16px almost every symbol pixel is antialiased
      // against the plate, so a strict "pure white" test would only measure
      // the rasterizer, not whether the symbol is actually there.
      if (alpha > 128 && red > 140 && green > 140 && blue > 140) {
        symbolPixels += 1;
        symbolMinX = Math.min(symbolMinX, x);
        symbolMaxX = Math.max(symbolMaxX, x);
        symbolMinY = Math.min(symbolMinY, y);
        symbolMaxY = Math.max(symbolMaxY, y);
      }
    }
  }
  assert.ok(platePixels > expectedSize * expectedSize * 0.3, `${label} needs the dark plate`);
  assert.ok(symbolPixels > expectedSize * expectedSize * 0.1, `${label} needs the light symbol`);
  // Padding: inside the plate, but tight enough to avoid dead space.
  assert.ok(symbolMinX >= expectedSize * 0.06 && symbolMaxX <= expectedSize * 0.94, `${label} horizontal padding`);
  assert.ok(symbolMinY >= expectedSize * 0.1 && symbolMaxY <= expectedSize * 0.9, `${label} vertical padding`);
  assert.ok(
    symbolMaxX - symbolMinX > expectedSize * 0.6,
    `${label} symbol is too small for its plate`,
  );
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
await inspectRaster(Buffer.from(await akruxFaviconSvg(48)), 48, "favicon.svg at 48px");
// The rasterizer and the SVG must agree, so a browser using either renders
// the same icon.
await inspectRaster(await akruxIconPng(64), 64, "generated icon at 64px");

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

console.log(`Icon check passed: ${referenced.length} HTML/manifest references and rounded-square 16/32/48/180/192/512px assets.`);
