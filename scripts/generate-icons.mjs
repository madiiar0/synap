/**
 * §1.7: generate favicon/app icons and the OG image from the Akrux brand
 * masters in apps/client/src/assets/brand (the same files the UI imports).
 * Outputs land in apps/client/public/ and are committed.
 * Re-run: node scripts/generate-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { akruxFaviconSvg, akruxIconPng, WORDMARK_SOURCE } from "./icon-source.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "apps/client/public");
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, "favicon.svg"), await akruxFaviconSvg(24));

async function png(size, out) {
  fs.writeFileSync(path.join(publicDir, out), await akruxIconPng(size));
}

await png(192, "icon-192.png");
await png(512, "icon-512.png");
await png(180, "apple-touch-icon.png");
await png(16, "favicon-16.png");
await png(32, "favicon-32.png");

// favicon.ico: ICO container with PNG-encoded 16 + 32 entries (Vista+ format).
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + 16 * entries.length;
  entries.forEach(({ size, data }, i) => {
    dir.writeUInt8(size >= 256 ? 0 : size, i * 16 + 0);
    dir.writeUInt8(size >= 256 ? 0 : size, i * 16 + 1);
    dir.writeUInt8(0, i * 16 + 2); // palette
    dir.writeUInt8(0, i * 16 + 3); // reserved
    dir.writeUInt16LE(1, i * 16 + 4); // planes
    dir.writeUInt16LE(32, i * 16 + 6); // bpp
    dir.writeUInt32LE(data.length, i * 16 + 8);
    dir.writeUInt32LE(offset, i * 16 + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

const ico = buildIco([
  { size: 16, data: fs.readFileSync(path.join(publicDir, "favicon-16.png")) },
  { size: 32, data: fs.readFileSync(path.join(publicDir, "favicon-32.png")) },
]);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico);

// OG image 1200x630: white background, the horizontal wordmark and a tagline.
// The wordmark is placed by width and lets sharp derive the height, so its
// aspect ratio is never altered.
const OG = { width: 1200, height: 630 };
const wordmarkWidth = 620;
const wordmark = await sharp(WORDMARK_SOURCE)
  .resize({ width: wordmarkWidth })
  .png()
  .toBuffer();
const wordmarkHeight = (await sharp(wordmark).metadata()).height;
// Centre the wordmark-plus-tagline block, derived from the artwork's own
// height so a future logo with a different aspect ratio stays composed.
const TAGLINE_GAP = 46;
const TAGLINE_SIZE = 30;
const wordmarkTop = Math.round((OG.height - (wordmarkHeight + TAGLINE_GAP + TAGLINE_SIZE)) / 2);
const taglineBaseline = wordmarkTop + wordmarkHeight + TAGLINE_GAP + Math.round(TAGLINE_SIZE * 0.8);

// Rasterized at 2x and scaled back down so the text stays crisp.
const tagline = await sharp(
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.width}" height="${OG.height}">
  <text x="600" y="${taglineBaseline}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${TAGLINE_SIZE}" fill="#6F6F6F">AI visibility analytics for businesses</text>
</svg>`,
  ),
  { density: 144 },
)
  .resize(OG.width, OG.height)
  .png()
  .toBuffer();

await sharp({
  create: {
    width: OG.width,
    height: OG.height,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([
    { input: wordmark, left: Math.round((OG.width - wordmarkWidth) / 2), top: wordmarkTop },
    { input: tagline, left: 0, top: 0 },
  ])
  .png()
  .toFile(path.join(publicDir, "og-image.png"));

// The manifest's copy (name, description, locale) is curated elsewhere and is
// validated by apps/server/test/seo.test.ts. Only the generated icon list is
// owned here, so read the current file and merge rather than overwrite it.
const manifestPath = path.join(publicDir, "site.webmanifest");
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : { id: "/", name: "Akrux", short_name: "Akrux", start_url: "/", scope: "/", lang: "ru" };
manifest.icons = [
  { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
  { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
];
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `icons + og-image written to apps/client/public/ (wordmark ${wordmarkWidth}x${wordmarkHeight})`,
);
