import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * §12.2: huge centered statement; the last two words start blurred and gray,
 * then unblur + darken when scrolled into view.
 */
export default function FearLine(): JSX.Element {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hairline-dashed bg-base py-28 sm:py-36">
      <div ref={ref} className="guides mx-auto max-w-container px-6">
        <p
          className="mx-auto max-w-4xl text-center font-semibold tracking-tight text-ink"
          style={{ fontSize: "clamp(30px, 4.6vw, 56px)", lineHeight: 1.15 }}
        >
          {t("landing.fear.before")}{" "}
          <span
            className="inline-block transition-all duration-[900ms] ease-out"
            style={{
              filter: revealed ? "blur(0)" : "blur(8px)",
              color: revealed ? "#171717" : "#a3a3a3",
              fontWeight: 700,
            }}
          >
            {t("landing.fear.emphasis")}
          </span>
        </p>
      </div>
    </section>
  );
}
