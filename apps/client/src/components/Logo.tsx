/**
 * SynapAI mark: a minimal black "synapse": three nodes joined by two
 * strokes. Single file so the owner can swap it trivially. Uses
 * currentColor; legible at 20px.
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
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path d="M5.5 18.5 12 12l6.5-6.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="5.5" cy="18.5" r="3" fill="currentColor" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
        <circle cx="18.5" cy="5.5" r="3.4" fill="currentColor" />
      </svg>
      {withWordmark && <span className="font-bold tracking-tight">SynapAI</span>}
    </span>
  );
}
