import { ENGINE_IDS, type EngineId } from "@synapai/shared";
import { env } from "../config/env.js";
import { getSettings } from "../models/Settings.js";
import { createDemoAdapter } from "./demo.js";
import { createAgentEngineAdapter } from "./perplexityAgent.js";
import { instrumentEngine } from "./wrapper.js";
import type { EngineAdapter } from "./types.js";

const realAdapters = new Map<EngineId, EngineAdapter>();
const demoAdapters = new Map<EngineId, EngineAdapter>();

function realAdapter(id: EngineId): EngineAdapter {
  let adapter = realAdapters.get(id);
  if (!adapter) {
    adapter = instrumentEngine(createAgentEngineAdapter(id));
    realAdapters.set(id, adapter);
  }
  return adapter;
}

function demoAdapter(id: EngineId): EngineAdapter {
  let adapter = demoAdapters.get(id);
  if (!adapter) {
    // Instrumented too, so demo runs record call volumes (at zero cost) and
    // exercise the same budget-guard path as real engines.
    adapter = instrumentEngine(createDemoAdapter(id));
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

/** Availability map for the admin engines page. */
export async function engineStatus(): Promise<
  { engine: EngineId; keyPresent: boolean; enabled: boolean }[]
> {
  const settings = await getSettings();
  const keyPresent = env.DEMO_MODE || Boolean(env.PERPLEXITY_API_KEY);
  return ENGINE_IDS.map((id) => ({
    engine: id,
    keyPresent,
    enabled: settings.engineFlags[id] !== false,
  }));
}
