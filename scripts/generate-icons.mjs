/**
 * §1.7: generate favicon/app icons and the OG image from the black synapse
 * mark (same geometry as apps/client/src/components/Logo.tsx). Outputs land
 * in apps/client/public/ and are committed. Re-run: node scripts/generate-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "apps/client/public");
fs.mkdirSync(publicDir, { recursive: true });

const MARK = `
  <path d="M5.5 18.5 12 12l6.5-6.5" stroke="#111111" stroke-width="1.8" fill="none"/>
  <circle cx="5.5" cy="18.5" r="3" fill="#111111"/>
  <circle cx="12" cy="12" r="2.2" fill="#111111"/>
  <circle cx="18.5" cy="5.5" r="3.4" fill="#111111"/>`;

const markSvg = (size, withBg) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  ${withBg ? '<rect width="24" height="24" rx="5" fill="#FFFFFF"/>' : ""}${MARK}
</svg>`;

// favicon.svg (transparent background)
fs.writeFileSync(path.join(publicDir, "favicon.svg"), markSvg(24, false));

async function png(size, out, withBg) {
  await sharp(Buffer.from(markSvg(size, withBg)), { density: (72 * size) / 24 })
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, out));
}

await png(192, "icon-192.png", true);
await png(512, "icon-512.png", true);
await png(180, "apple-touch-icon.png", true);
await png(16, "favicon-16.png", true);
await png(32, "favicon-32.png", true);

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

// OG image 1200x630: white background, mark + wordmark + tagline.
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <g transform="translate(480, 140) scale(6.5)">${MARK}</g>
  <text x="600" y="410" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="84" font-weight="700" fill="#111111">Synap</text>
  <text x="600" y="480" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#6F6F6F">AI visibility analytics for businesses</text>
</svg>`;
await sharp(Buffer.from(ogSvg), { density: 150 }).resize(1200, 630).png().toFile(path.join(publicDir, "og-image.png"));

fs.writeFileSync(
  path.join(publicDir, "site.webmanifest"),
  JSON.stringify(
    {
      id: "/",
      name: "Synap",
      short_name: "Synap",
      description: "AI visibility analytics for businesses",
      start_url: "/",
      scope: "/",
      lang: "ru",
      categories: ["business", "analytics"],
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: "#FFFFFF",
      background_color: "#FFFFFF",
      display: "browser",
    },
    null,
    2,
  ),
);

console.log("icons + og-image written to apps/client/public/");
