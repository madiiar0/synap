/**
 * `pnpm engines:check` (§1.3) — one minimal LIVE call per configured engine
 * through the Perplexity Agent API, so model ids are verified against the
 * provider rather than against documentation. Prints engine, model, HTTP
 * status, latency, tokens and cost. Exits 1 if any engine fails.
 */
import { ENGINES, ENGINE_IDS, EXTRACTION_MODEL } from "@synapai/shared";
import { env } from "./config/env.js";
import { agentCallRaw } from "./engines/perplexityAgent.js";

interface Row {
  engine: string;
  model: string;
  status: string;
  ms: number;
  tokens: string;
  cost: string;
  error?: string;
}

function pad(value: string, width: number): string {
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

async function probe(engine: string, model: string, webSearch: boolean): Promise<Row> {
  const started = Date.now();
  try {
    const answer = await agentCallRaw("Reply with the single word: ok", {
      model,
      webSearch,
      maxOutputTokens: 32,
    });
    return {
      engine,
      model,
      status: "200",
      ms: Date.now() - started,
      tokens: `${answer.tokensIn}/${answer.tokensOut}`,
      cost: `$${answer.costUsd.toFixed(5)}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /http (\d{3})/.exec(message)?.[1] ?? "ERR";
    return {
      engine,
      model,
      status,
      ms: Date.now() - started,
      tokens: "-",
      cost: "-",
      error: message,
    };
  }
}

async function main(): Promise<void> {
  if (!env.PERPLEXITY_API_KEY) {
    console.error("PERPLEXITY_API_KEY is not set. Add it to .env, then run this again.");
    process.exit(1);
  }
  console.log("Making one minimal live call per engine (this costs a few cents at most).\n");

  const rows: Row[] = [];
  for (const id of ENGINE_IDS) {
    rows.push(await probe(id, ENGINES[id].model, true));
  }
  // The extraction/prompt-generation model runs without web_search.
  rows.push(await probe("extraction", EXTRACTION_MODEL, false));

  const widths = {
    engine: Math.max(10, ...rows.map((r) => r.engine.length)),
    model: Math.max(12, ...rows.map((r) => r.model.length)),
  };
  console.log(
    `${pad("ENGINE", widths.engine)}  ${pad("MODEL", widths.model)}  STATUS  LATENCY  TOKENS(in/out)  COST`,
  );
  for (const row of rows) {
    console.log(
      `${pad(row.engine, widths.engine)}  ${pad(row.model, widths.model)}  ${pad(row.status, 6)}  ${pad(
        `${row.ms}ms`,
        7,
      )}  ${pad(row.tokens, 14)}  ${row.cost}`,
    );
  }

  const failures = rows.filter((r) => r.status !== "200");
  if (failures.length > 0) {
    console.error("\nFAILURES:");
    for (const failure of failures) {
      console.error(`\n  ${failure.engine} (${failure.model}) -> ${failure.status}`);
      console.error(`  ${failure.error}`);
    }
    console.error(
      "\nFix the model ids in packages/shared/src/engines.ts, then run `pnpm engines:check` again.",
    );
    process.exit(1);
  }

  const total = rows.reduce((sum, r) => sum + Number(r.cost.replace("$", "")), 0);
  console.log(`\nAll ${rows.length} models responded. Probe cost: $${total.toFixed(5)}`);
  process.exit(0);
}

void main();
