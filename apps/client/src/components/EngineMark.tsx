import type { EngineId } from "@synapai/shared";
import { ENGINE_LABELS } from "@synapai/shared";

/**
 * Minimal monochrome geometric marks — deliberately NOT the official
 * multi-color logos (see footer trademark note).
 */
function Glyph({ engine, size }: { engine: EngineId; size: number }): JSX.Element {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    "aria-hidden": true as const,
  };
  switch (engine) {
    case "chatgpt": // hexagonal knot
      return (
        <svg {...common}>
          <path d="M8 1.8 13.4 5v6L8 14.2 2.6 11V5L8 1.8Z" />
          <circle cx="8" cy="8" r="2.4" />
        </svg>
      );
    case "claude": // starburst
      return (
        <svg {...common}>
          <path d="M8 1.5v13M1.5 8h13M3.4 3.4l9.2 9.2M12.6 3.4l-9.2 9.2" />
        </svg>
      );
    case "gemini": // twin crescents
      return (
        <svg {...common}>
          <path d="M8 1.5C8 5.1 4.9 8 1.5 8 4.9 8 8 10.9 8 14.5 8 10.9 11.1 8 14.5 8 11.1 8 8 5.1 8 1.5Z" />
        </svg>
      );
    case "perplexity": // angular knot
      return (
        <svg {...common}>
          <path d="M8 1.5v13M8 5 3 2v5.5L8 11l5-3.5V2L8 5ZM3 14V9m10 5V9" />
        </svg>
      );
  }
}

export default function EngineMark({
  engine,
  size = 14,
  withLabel = true,
  className = "",
}: {
  engine: EngineId;
  size?: number;
  withLabel?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Glyph engine={engine} size={size} />
      {withLabel && <span>{ENGINE_LABELS[engine]}</span>}
    </span>
  );
}
