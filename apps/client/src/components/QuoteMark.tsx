/**
 * §5: ONE decorative quote mark for every language.
 *
 * The marks used to be typed into the localized strings themselves (« » in
 * Russian, “ ” in English), so the two languages rendered different glyphs in
 * different fonts at different weights, and a fallback font could substitute
 * the Russian ones. This SVG is language independent: only the quoted text
 * changes between locales.
 */
export default function QuoteMark({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number;
}): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      focusable="false"
      className={className}
    >
      {/* Two solid comma forms; currentColor keeps it on the text token. */}
      <path
        fill="currentColor"
        d="M13.2 6.5c-4.9 1.9-8.2 6.3-8.2 11.9 0 4.3 2.6 7.1 6.1 7.1 3.1 0 5.5-2.3 5.5-5.3 0-3-2.1-5.1-4.9-5.1-.5 0-1.1.1-1.3.2.6-2.4 2.9-4.7 5.6-5.9L13.2 6.5Zm13.5 0c-4.9 1.9-8.2 6.3-8.2 11.9 0 4.3 2.6 7.1 6.1 7.1 3.1 0 5.5-2.3 5.5-5.3 0-3-2.1-5.1-4.9-5.1-.5 0-1.1.1-1.3.2.6-2.4 2.9-4.7 5.6-5.9L26.7 6.5Z"
      />
    </svg>
  );
}
