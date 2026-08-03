import { parseLocalizedPublicPath, type PublicPath } from "@synapai/shared";

export type PublicMetricEvent = "page_view" | "signup_intent" | "contact_intent";
export type PublicMetricSource =
  | "direct"
  | "internal"
  | "search"
  | "chatgpt"
  | "perplexity"
  | "claude"
  | "copilot"
  | "other";

const SEARCH_HOSTS = ["google.", "bing.com", "yandex.", "duckduckgo.com", "baidu.com"];

export function classifyPublicReferrer(referrer: string, currentOrigin: string): PublicMetricSource {
  if (!referrer) return "direct";
  try {
    const url = new URL(referrer);
    if (url.origin === currentOrigin) return "internal";
    const host = url.hostname.toLowerCase();
    if (host === "chatgpt.com" || host.endsWith(".chatgpt.com") || host === "openai.com") return "chatgpt";
    if (host === "perplexity.ai" || host.endsWith(".perplexity.ai")) return "perplexity";
    if (host === "claude.ai" || host.endsWith(".claude.ai") || host === "anthropic.com") return "claude";
    if (host === "copilot.microsoft.com") return "copilot";
    if (SEARCH_HOSTS.some((candidate) => host.includes(candidate))) return "search";
    return "other";
  } catch {
    return "other";
  }
}

export function trackPublicEvent(event: PublicMetricEvent, explicitPath?: PublicPath): void {
  if (typeof window === "undefined") return;
  const parsed = parseLocalizedPublicPath(window.location.pathname);
  const path = explicitPath ?? parsed?.path;
  const locale = parsed?.locale;
  if (!path || !locale) return;
  const body = JSON.stringify({
    path,
    locale,
    event,
    source: classifyPublicReferrer(document.referrer, window.location.origin),
  });
  void fetch("/api/analytics/public", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    credentials: "omit",
    keepalive: true,
  }).catch(() => undefined);
}
