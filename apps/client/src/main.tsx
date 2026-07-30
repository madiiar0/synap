// index.css includes all subsets (incl. Cyrillic) via unicode-range.
import "@fontsource-variable/inter";
import "./styles/index.css";
import "./lib/i18n";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import i18n from "./lib/i18n";
import { ApiError } from "./lib/api";
import { toast } from "./lib/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 401s are handled by redirects; polling queries opt out via meta.
      if (error instanceof ApiError && error.status === 401) return;
      if (query.meta?.silent) return;
      toast(i18n.t("common.error"));
    },
  }),
});

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
