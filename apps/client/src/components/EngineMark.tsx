import { AI_PLATFORMS } from "@synapai/shared";
import { AI_LOGOS } from "../lib/aiLogos";

const NAMES = new Map(AI_PLATFORMS.map((p) => [p.id, p.name]));

/**
 * Platform mark: the real logo image (owner-provided assets, original colors,
 * aspect ratio preserved) with an optional name label.
 */
export default function EngineMark({
  engine,
  size = 16,
  withLabel = true,
  className = "",
}: {
  engine: string;
  size?: number;
  withLabel?: boolean;
  className?: string;
}): JSX.Element {
  const logo = AI_LOGOS[engine];
  const name = NAMES.get(engine) ?? engine;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {logo && (
        <img
          src={logo}
          alt={name}
          style={{ height: size, width: "auto" }}
          className="inline-block shrink-0 object-contain"
          loading="lazy"
        />
      )}
      {withLabel && <span>{name}</span>}
    </span>
  );
}
