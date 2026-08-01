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

  // §4: ONE string, wrapped by the browser. The per-word spans exist only for
  // the feathering animation; they no longer impose a line structure.
  const words = useMemo(() => t("landing.fear.text").split(/\s+/).filter(Boolean), [t]);
  const totalWords = words.length;

  // Group each one or two letter word with the word after it, so it can never
  // be stranded at the end of a line. Applies to every language.
  const groups = useMemo(() => {
    const out: { word: string; index: number }[][] = [];
    let pending: { word: string; index: number }[] = [];
    words.forEach((word, index) => {
      pending.push({ word, index });
      const letters = word.replace(/[^\p{L}\p{N}]/gu, "").length;
      if (letters > 2 || index === words.length - 1) {
        out.push(pending);
        pending = [];
      }
    });
    if (pending.length > 0) out.push(pending);
    return out;
  }, [words]);

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

  return (
    <section className="hairline-dashed bg-base pb-8 pt-28 sm:pt-32">
      <div ref={ref} className="guides mx-auto max-w-container px-4 sm:px-6">
        <p
          /* `text-balance` evens the lines out where supported; browsers that
             lack it simply wrap normally, which is still correct. */
          className="mx-auto max-w-4xl text-balance text-center font-semibold tracking-tight"
          style={{ fontSize: "clamp(22px, 5.6vw, 50px)", lineHeight: 1.28 }}
        >
          {groups.map((group, gi) => (
            /* `.fear-word` is inline-block for the per-word filter, and browsers
               may break between adjacent atomic inline boxes even across a
               non-breaking space. Grouping a short word with the word that
               follows it in a `nowrap` span is what actually keeps them
               together. General rule: any word of one or two letters. */
            <span key={gi} className="whitespace-nowrap">
              {group.map(({ word, index }, wi) => (
                <span key={index}>
                  <span
                    ref={(node) => {
                      wordRefs.current[index] = node;
                    }}
                    className="fear-word"
                  >
                    {word}
                  </span>
                  {wi < group.length - 1 ? "\u00A0" : ""}
                </span>
              ))}
            </span>
          )).flatMap((node, gi) =>
            // The separating space must live OUTSIDE the nowrap span, or the
            // whole paragraph becomes unbreakable.
            gi < groups.length - 1 ? [node, <span key={`s${gi}`}> </span>] : [node],
          )}
        </p>
      </div>
    </section>
  );
}
