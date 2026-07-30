import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PreviewRow {
  name: string;
  visibility: number;
  sentiment: "pos" | "neu";
  trend: "up" | "down";
}

// Neutral demo names only — mirrors the real Competitors page structure.
const ROWS: PreviewRow[] = [
  { name: "Astra", visibility: 74, sentiment: "pos", trend: "up" },
  { name: "Nurly", visibility: 52, sentiment: "neu", trend: "down" },
  { name: "Vega", visibility: 38, sentiment: "pos", trend: "up" },
  { name: "Orion", visibility: 21, sentiment: "neu", trend: "down" },
];

/**
 * §12.7: an angled dark "dashboard screenshot" built as a real styled div.
 * `angled` is off in the final-CTA peek variant.
 */
export default function ProductPreview({ angled = true }: { angled?: boolean }): JSX.Element {
  const { t } = useTranslation();
  return (
    <div
      className="w-full max-w-xl rounded-2xl border border-darkline bg-dark p-6 text-darktext shadow-2xl"
      style={
        angled
          ? { transform: "perspective(1200px) rotateX(6deg) rotateY(-8deg) rotateZ(1deg)" }
          : undefined
      }
    >
      <div className="flex items-center justify-between border-b border-darkline pb-4">
        <p className="text-sm font-semibold">{t("landing.preview.title")}</p>
        <p className="text-xs text-sub">{t("landing.preview.subtitle")}</p>
      </div>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-sub">
            <th className="py-2 font-medium">{t("landing.preview.colBrand")}</th>
            <th className="py-2 font-medium">{t("landing.preview.colVisibility")}</th>
            <th className="py-2 text-right font-medium">{t("landing.preview.colSentiment")}</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, index) => (
            <tr key={row.name} className="border-t border-darkline">
              <td className="py-3">
                <span className="mr-2 text-xs text-sub">{index + 1}</span>
                <span className="font-medium">{row.name}</span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 rounded-full bg-darkline">
                    <div
                      className="h-1.5 rounded-full bg-darktext/70"
                      style={{ width: `${row.visibility}%` }}
                    />
                  </div>
                  <span className="text-sub">{row.visibility}%</span>
                </div>
              </td>
              <td className="py-3 text-right">
                {row.trend === "up" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <ArrowUpRight size={14} />
                    {row.sentiment === "pos" ? "+" : "·"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-400">
                    <ArrowDownRight size={14} />·
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
