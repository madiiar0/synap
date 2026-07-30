import type { EngineId } from "@synapai/shared";
import { env } from "../config/env.js";
import { getSettings } from "../models/Settings.js";
import { createChatgptAdapter } from "./chatgpt.js";
import { createClaudeAdapter } from "./claude.js";
import { createDemoAdapter } from "./demo.js";
import { createGeminiAdapter } from "./gemini.js";
import { createPerplexityAdapter } from "./perplexity.js";
import { instrumentEngine } from "./wrapper.js";
import type { EngineAdapter } from "./types.js";

const realAdapters = new Map<EngineId, EngineAdapter>();
const demoAdapters = new Map<EngineId, EngineAdapter>();

function realAdapter(id: EngineId): EngineAdapter {
  let adapter = realAdapters.get(id);
  if (!adapter) {
    const factories: Record<EngineId, () => EngineAdapter> = {
      perplexity: createPerplexityAdapter,
      chatgpt: createChatgptAdapter,
      gemini: createGeminiAdapter,
      claude: createClaudeAdapter,
    };
    adapter = instrumentEngine(factories[id]());
    realAdapters.set(id, adapter);
  }
  return adapter;
}

function demoAdapter(id: EngineId): EngineAdapter {
  let adapter = demoAdapters.get(id);
  if (!adapter) {
    adapter = createDemoAdapter(id);
    demoAdapters.set(id, adapter);
  }
  return adapter;
}

/** Is this engine usable right now (key present + admin flag on, or demo)? */
export async function isEngineEnabled(id: EngineId): Promise<boolean> {
  const settings = await getSettings();
  if (settings.engineFlags[id] === false) return false;
  if (env.DEMO_MODE) return true;
  return realAdapter(id).available();
}

/** Resolve the usable adapters for a scan's requested engine list, keeping order. */
export async function resolveEngines(ids: EngineId[]): Promise<EngineAdapter[]> {
  const out: EngineAdapter[] = [];
  for (const id of ids) {
    if (await isEngineEnabled(id)) {
      out.push(env.DEMO_MODE ? demoAdapter(id) : realAdapter(id));
    }
  }
  return out;
}

/** Engine used for extraction + prompt generation (never in DEMO_MODE). */
export function extractionAdapter(): EngineAdapter | null {
  if (env.DEMO_MODE) return null;
  const adapter = realAdapter(env.EXTRACTION_PROVIDER);
  return adapter.available() ? adapter : null;
}

/** Availability map for the admin engines page. */
export async function engineStatus(): Promise<
  { engine: EngineId; keyPresent: boolean; enabled: boolean }[]
> {
  const settings = await getSettings();
  const ids: EngineId[] = ["perplexity", "chatgpt", "gemini", "claude"];
  return ids.map((id) => ({
    engine: id,
    keyPresent: env.DEMO_MODE ? true : realAdapter(id).available(),
    enabled: settings.engineFlags[id] !== false,
  }));
}
