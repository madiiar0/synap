import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PreviewRow {
  name: string;
  visibility: number;
  trend: "up" | "down";
}

// Fictional names only — numbers/rankings never carry real companies.
const ROWS: PreviewRow[] = [
  { name: "Astra", visibility: 74, trend: "up" },
  { name: "Nurly", visibility: 52, trend: "down" },
  { name: "Vega", visibility: 38, trend: "up" },
  { name: "Orion", visibility: 21, trend: "down" },
];

/** Rankings preview panel used inside the final CTA card (localized). */
export default function ProductPreview(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-xl rounded-2xl border border-darkline bg-dark p-6 text-darktext shadow-lg">
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
                    <ArrowUpRight size={14} />+
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
