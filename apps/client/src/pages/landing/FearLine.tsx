import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * §5: three fixed lines whose words unblur sequentially, driven by the
 * section's scroll progress (p=0 at 85% viewport, p=1 at 35%), rAF-throttled.
 * The final "your competitor" line resolves last. Reduced motion: one fade.
 */
export default function FearLine(): JSX.Element {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);

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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      // Single fade-in: reveal everything when the section shows up.
      if (typeof IntersectionObserver === "undefined") {
        setRevealedCount(totalWords);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setRevealedCount(totalWords);
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
      const vh = window.innerHeight;
      // p: 0 when section top reaches 85% of the viewport, 1 at 35%.
      const p = Math.min(1, Math.max(0, (0.85 * vh - rect.top) / (0.5 * vh)));
      const count = Math.min(totalWords, Math.floor(p * totalWords + 1e-4));
      setRevealedCount((current) => (current === count ? current : count));
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
                const on = wordIndex < revealedCount;
                return (
                  <span key={`${lineIdx}-${word}-${wordIndex}`}>
                    <span className={`fear-word ${on ? "fear-word-on" : ""}`}>{word}</span>{" "}
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
