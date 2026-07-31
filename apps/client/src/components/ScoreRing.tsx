import { useEffect, useRef, useState } from "react";

/** Animated 0-100 score ring with a count-up. */
export default function ScoreRing({
  value,
  size = 180,
  dark = false,
}: {
  value: number;
  size?: number;
  dark?: boolean;
}): JSX.Element {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const duration = 900;
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value]);

  const radius = size * 0.39;
  const circumference = 2 * Math.PI * radius;
  const filled = (display / 100) * circumference;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${value}/100`}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={dark ? "#262626" : "#E7E7E7"}
        strokeWidth={size * 0.055}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#2563EB"
        strokeWidth={size * 0.055}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference - filled}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text
        x={center}
        y={center + size * 0.045}
        textAnchor="middle"
        fill={dark ? "#F5F5F5" : "#171717"}
        style={{ fontSize: size * 0.23, fontWeight: 600, letterSpacing: "-0.02em" }}
      >
        {display}
      </text>
    </svg>
  );
}
