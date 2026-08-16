/**
 * Single source of truth for generated Akrux icon assets.
 *
 * The brand masters live with the client so the UI and the generated public
 * icons cannot drift apart: `akrux-mark.png` is the square symbol (favicons,
 * app icons, icon-only UI) and `akrux-logo.png` is the horizontal wordmark.
 * Both are trimmed to their ink on a transparent background, so padding is
 * decided here rather than baked into the files.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const BRAND_DIR = path.join(root, "apps/client/src/assets/brand");
export const MARK_SOURCE = path.join(BRAND_DIR, "akrux-mark.png");
export const WORDMARK_SOURCE = path.join(BRAND_DIR, "akrux-logo.png");

/**
 * Share of the icon box occupied by the symbol. The remaining margin keeps the
 * mark inside the white disc and clear of the rounding that browsers and
 * launchers apply to app icons.
 */
export const MARK_SCALE = 0.72;

/** Pixel size of the symbol embedded into favicon.svg. */
const EMBED_SIZE = 256;

const PNG_OPTIONS = { compressionLevel: 9, effort: 10, palette: true, colours: 64 };

/** The symbol on a transparent square canvas, at an exact pixel size. */
export async function markPng(size) {
  return sharp(MARK_SOURCE)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png(PNG_OPTIONS)
    .toBuffer();
}

/**
 * White circular icon surface with transparent corners and a padded symbol.
 * The disc keeps the black mark legible on dark browser chrome; the corners
 * stay transparent so the icon reads as a circle, not a white square.
 */
export async function akruxFaviconSvg(size) {
  const embedded = (await markPng(EMBED_SIZE)).toString("base64");
  const inner = Number((24 * MARK_SCALE).toFixed(4));
  const offset = Number(((24 - inner) / 2).toFixed(4));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="#FFFFFF"/>
  <image x="${offset}" y="${offset}" width="${inner}" height="${inner}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${embedded}"/>
</svg>`;
}

/** Raster icon: the same white disc and padded symbol, rasterized to PNG. */
export async function akruxIconPng(size) {
  const disc = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#FFFFFF"/></svg>`,
  );
  return sharp(disc, { density: (72 * size) / 24 })
    .resize(size, size)
    .composite([{ input: await markPng(Math.round(size * MARK_SCALE)), gravity: "centre" }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}
