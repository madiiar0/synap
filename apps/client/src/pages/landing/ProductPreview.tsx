import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANDING_COFFEE_SHOPS } from "./landingCoffeeShops";

interface PreviewRow {
  name: string;
  logo: string | undefined;
  visibility: number;
  trend: "up" | "down";
}

const SAMPLE_METRICS = [
  { visibility: 74, trend: "up" },
  { visibility: 52, trend: "down" },
  { visibility: 38, trend: "up" },
] as const;

const ROWS: PreviewRow[] = LANDING_COFFEE_SHOPS.map((shop, index) => ({
  ...shop,
  ...SAMPLE_METRICS[index],
}));

/** Rankings preview panel used inside the final CTA card (localized). */
export default function ProductPreview(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-xl rounded-2xl border border-darkline bg-dark p-4 text-xs text-darktext shadow-lg sm:p-6 sm:text-sm">
      <div className="flex items-center justify-between gap-4 border-b border-darkline pb-4">
        <p className="text-sm font-semibold">{t("landing.preview.title")}</p>
        <p className="hidden text-xs text-sub sm:block">{t("landing.preview.subtitle")}</p>
      </div>
      <table className="mt-2 w-full table-fixed text-xs sm:text-sm">
        <thead>
          <tr className="text-left text-xs text-sub">
            <th className="w-[52%] py-2 font-medium">{t("landing.preview.colBrand")}</th>
            <th className="w-[34%] py-2 font-medium">{t("landing.preview.colVisibility")}</th>
            <th
              className="w-[14%] py-2 text-right font-medium"
              aria-label={t("landing.preview.colSentiment")}
            >
              <span className="hidden text-[10px] sm:inline">{t("landing.preview.colSentiment")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, index) => (
            <tr key={row.name} className="border-t border-darkline">
              <td className="py-3">
                <span className="inline-flex items-center gap-2">
                  <span className="text-xs text-sub">{index + 1}</span>
                  {row.logo ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-darkline bg-white sm:h-7 sm:w-7">
                      <img
                        src={row.logo}
                        alt={row.name}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-darkline text-xs font-bold sm:h-7 sm:w-7">
                      {row.name.charAt(0)}
                    </span>
                  )}
                  <span className="whitespace-nowrap font-medium">{row.name}</span>
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-10 rounded-full bg-darkline sm:w-24">
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
