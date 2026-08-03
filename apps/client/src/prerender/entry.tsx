import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import {
  PUBLIC_PATHS,
  localizedPublicPath,
  type Locale,
  type PublicPath,
} from "@synapai/shared";
import i18n from "../lib/i18n";
import App from "../App";

/**
 * §1.1 layer 2: build-time prerender entry. scripts/prerender.mjs calls this
 * for every public route × locale and writes static HTML with real body
 * content, so crawlers and AI bots never see an empty shell.
 */
export async function render(url: string, locale: Locale): Promise<string> {
  await i18n.changeLanguage(locale);
  const queryClient = new QueryClient();
  return renderToString(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </QueryClientProvider>,
  );
}

export function prerenderRoutes(): Array<{
  url: string;
  basePath: PublicPath;
  locale: Locale;
  out: string;
}> {
  return PUBLIC_PATHS.flatMap((basePath) =>
    (["ru", "en"] as const).map((locale) => {
      const url = localizedPublicPath(basePath, locale);
      return {
        url,
        basePath,
        locale,
        out: url === "/" ? "index.html" : `${url.replace(/^\//, "")}/index.html`,
      };
    }),
  );
}
