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
 * The icon plate: a slightly rounded square rather than a circle, in the same
 * flat black the landing page uses for its primary buttons. A solid dark plate
 * keeps the symbol readable at 16px against light *and* dark browser chrome,
 * survives the opaque background iOS composites behind home-screen icons, and
 * is what makes the rounded corners visible at all.
 */
export const PLATE_COLOR = "#0A0A0A";
export const SYMBOL_COLOR = "#FFFFFF";

/** Corner radius in viewBox units (24), i.e. ~21% — rounded, not a squircle. */
export const CORNER_RADIUS = 5;

/** Share of the plate width taken by the symbol; the rest is optical padding. */
export const MARK_SCALE = 0.78;

/** Pixel width of the symbol embedded into favicon.svg. */
const EMBED_SIZE = 256;

const PNG_OPTIONS = { compressionLevel: 9, effort: 10, palette: true, colours: 64 };

/**
 * The symbol recoloured to `color`, on a transparent canvas `size` wide. Only
 * the width is pinned: the master's own aspect ratio decides the height, so
 * the mark is never stretched.
 */
export async function markPng(size, color = SYMBOL_COLOR) {
  const scaled = await sharp(MARK_SOURCE).resize({ width: size }).png().toBuffer();
  const { width, height } = await sharp(scaled).metadata();
  const alpha = await sharp(scaled).extractChannel("alpha").raw().toBuffer();
  return sharp({ create: { width, height, channels: 3, background: color } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png(PNG_OPTIONS)
    .toBuffer();
}

function plateSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><rect width="24" height="24" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}" fill="${PLATE_COLOR}"/></svg>`;
}

/**
 * Rounded-square icon with transparent corners and a centred symbol. The plate
 * stays a real vector; only the symbol is embedded, so the corners keep their
 * clean edge at every rendered size.
 */
export async function akruxFaviconSvg(size) {
  const symbol = await markPng(EMBED_SIZE);
  const meta = await sharp(symbol).metadata();
  const embedded = symbol.toString("base64");
  const w = Number((24 * MARK_SCALE).toFixed(4));
  const h = Number(((w * meta.height) / meta.width).toFixed(4));
  const x = Number(((24 - w) / 2).toFixed(4));
  const y = Number(((24 - h) / 2).toFixed(4));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <rect width="24" height="24" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}" fill="${PLATE_COLOR}"/>
  <image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${embedded}"/>
</svg>`;
}

/** Raster icon: the same rounded plate and centred symbol, rasterized to PNG. */
export async function akruxIconPng(size) {
  return sharp(Buffer.from(plateSvg(size)), { density: (72 * size) / 24 })
    .resize(size, size)
    .composite([{ input: await markPng(Math.round(size * MARK_SCALE)), gravity: "centre" }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}
