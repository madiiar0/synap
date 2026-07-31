/**
 * Every AI platform the product talks about. `scannable` platforms have a
 * working engine adapter; display-only platforms (no public API) appear in
 * marketing surfaces (hero cycle, marquee) but NEVER in scan results.
 * Logo files live in apps/client/src/assets/ai-logos/<logo>.
 */
export interface AiPlatform {
  id: string;
  name: string;
  logo: string;
  scannable: boolean;
}

export const AI_PLATFORMS: readonly AiPlatform[] = [
  { id: "chatgpt", name: "ChatGPT", logo: "chatgpt.png", scannable: true },
  { id: "claude", name: "Claude", logo: "claude.png", scannable: true },
  { id: "gemini", name: "Gemini", logo: "gemini.png", scannable: true },
  { id: "perplexity", name: "Perplexity", logo: "perplexity.png", scannable: true },
  { id: "deepseek", name: "DeepSeek", logo: "deepseek.png", scannable: true },
  { id: "grok", name: "Grok", logo: "grok.png", scannable: true },
  { id: "copilot", name: "Copilot", logo: "copilot.png", scannable: false }, // no public API — display only
] as const;

export type AiPlatformId = (typeof AI_PLATFORMS)[number]["id"];
