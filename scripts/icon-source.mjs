/** Existing Akrux symbol geometry, shared by generated public assets. */
export const AKRUX_MARK = `
  <path d="M5.5 18.5 12 12l6.5-6.5" stroke="#111111" stroke-width="1.8" fill="none"/>
  <circle cx="5.5" cy="18.5" r="3" fill="#111111"/>
  <circle cx="12" cy="12" r="2.2" fill="#111111"/>
  <circle cx="18.5" cy="5.5" r="3.4" fill="#111111"/>`;

/** White circular favicon surface with transparent corners and a padded mark. */
export function akruxFaviconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="#FFFFFF"/>
  <g transform="translate(12 12) scale(0.78) translate(-12 -12)">${AKRUX_MARK}
  </g>
</svg>`;
}
