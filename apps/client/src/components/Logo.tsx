import markUrl from "../assets/brand/akrux-mark.png";
import wordmarkUrl from "../assets/brand/akrux-logo.png";

/**
 * Akrux brand lockup. `withWordmark` renders the horizontal logo (symbol plus
 * wordmark) as a single image; otherwise only the square symbol, which is the
 * same master the favicon and app icons are generated from.
 *
 * Both files are trimmed to their ink, so one dimension drives the size and
 * the other stays automatic: the aspect ratio is never altered. The wordmark
 * is sized in `em` so it keeps tracking the `text-*` class each caller already
 * passes, which is what preserves the previous optical size and the existing
 * responsive behavior.
 */
export default function Logo({
  size = 20,
  withWordmark = true,
  className = "",
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <span className={`inline-flex items-center gap-2 text-ink ${className}`}>
      {withWordmark ? (
        <img
          src={wordmarkUrl}
          alt="Akrux"
          width={1612}
          height={305}
          className="h-[1.4em] w-auto shrink-0"
        />
      ) : (
        <img
          src={markUrl}
          alt="Akrux"
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="shrink-0"
        />
      )}
    </span>
  );
}
