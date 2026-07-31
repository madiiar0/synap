import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

/**
 * §4 (iteration 3): continuous feathered word unblur driven by scroll.
 * ~FEATHER words are always mid-transition, so at any frozen frame the
 * reader sees sharp, slightly soft, soft, and invisible words at once.
 * Styles are written directly per rAF frame; no CSS transitions.
 */
const FEATHER = 4.5;
const START_VH = 0.88; // p = 0 when the section top is at 88% of the viewport
const END_VH = 0.3; // p = 1 at 30%, before the headline reaches the centre

const FROM = { r: 0xb4, g: 0xb4, b: 0xb4 };
const TO = { r: 0x11, g: 0x11, b: 0x11 };

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export default function FearLine(): JSX.Element {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const lines = useMemo(
    () => [
      t("landing.fear.line1").split(" "),
      t("landing.fear.line2").split(" "),
      t("landing.fear.line3").split(" "),
    ],
    [t],
  );
  const totalWords = lines.reduce((sum, words) => sum + words.length, 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = wordRefs.current.slice(0, totalWords);

    const paint = (e: number, span: HTMLSpanElement): void => {
      span.style.filter = e >= 1 ? "none" : `blur(${((1 - e) * 14).toFixed(2)}px)`;
      span.style.opacity = (0.12 + e * 0.88).toFixed(3);
      const r = Math.round(FROM.r + (TO.r - FROM.r) * e);
      const g = Math.round(FROM.g + (TO.g - FROM.g) * e);
      const b = Math.round(FROM.b + (TO.b - FROM.b) * e);
      span.style.color = `rgb(${r}, ${g}, ${b})`;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      // Single fade-in, no blur.
      words.forEach((span) => {
        if (span) {
          span.style.transition = "opacity 500ms ease";
          span.style.opacity = "0.12";
          span.style.color = "rgb(17, 17, 17)";
        }
      });
      if (typeof IntersectionObserver === "undefined") {
        words.forEach((span) => span && (span.style.opacity = "1"));
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            words.forEach((span) => span && (span.style.opacity = "1"));
            observer.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }

    let ticking = false;
    const update = (): void => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const startY = START_VH * window.innerHeight;
      const endY = END_VH * window.innerHeight;
      const p = clamp01((startY - rect.top) / (startY - endY));
      words.forEach((span, i) => {
        if (!span) return;
        const raw = (p * (totalWords + FEATHER) - i) / FEATHER;
        const tt = clamp01(raw);
        const e = 1 - Math.pow(1 - tt, 3); // easeOutCubic
        paint(e, span);
      });
    };
    const onScroll = (): void => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [totalWords]);

  let wordIndex = -1;
  return (
    <section className="hairline-dashed bg-base pb-8 pt-28 sm:pt-32">
      <div ref={ref} className="guides mx-auto max-w-container px-6">
        <p
          className="mx-auto max-w-5xl text-center font-semibold tracking-tight"
          style={{ fontSize: "clamp(24px, 3.9vw, 50px)", lineHeight: 1.2 }}
        >
          {lines.map((words, lineIdx) => (
            <span key={lineIdx} className="block">
              {words.map((word) => {
                wordIndex += 1;
                const idx = wordIndex;
                return (
                  <span key={`${lineIdx}-${idx}`}>
                    <span
                      ref={(node) => {
                        wordRefs.current[idx] = node;
                      }}
                      className="fear-word"
                    >
                      {word}
                    </span>{" "}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
