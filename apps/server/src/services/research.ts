import {
  businessResearchSchema,
  RESEARCH_MODEL,
  type BusinessResearch,
  type Market,
} from "@synapai/shared";
import { env } from "../config/env.js";
import { agentCallRaw } from "../engines/perplexityAgent.js";
import { logger } from "../lib/logger.js";
import { recordUsage } from "./usage.js";

/**
 * §2 Stage A: research the business BEFORE writing any prompts, so the
 * questions reflect what it actually sells rather than the raw category
 * string. Uses Sonar with web_search, plus fetch_url when a site is known.
 *
 * Honesty rule: if the business cannot be identified, confidence is "low" and
 * the caller falls back to the form fields. Services and competitors are never
 * invented to fill the shape.
 */

const RESEARCH_INSTRUCTIONS = `You are a market researcher. Investigate the business the user describes using web search.
Report only what you can actually find. If you cannot identify the business, say so with confidence "low" and leave the lists empty.
Never invent services, competitors or facts. Prefer sources about this exact business in this exact city.
Reply with ONE JSON object and nothing else, matching exactly:
{"summary":string,"services":string[],"audience":string,"differentiators":string[],"likelyCompetitors":string[],"aliases":string[],"subBrands":string[],"confidence":"high"|"medium"|"low","sourcesUsed":string[]}
- summary: 2 to 3 sentences on what this business actually does.
- services: concrete services or products you found.
- aliases: OTHER NAMES FOR THE SAME COMPANY: spelling and language variants, transliterations, the legal entity name, the domain name.
- subBrands: official products, apps, services or sub-brands OWNED BY this business. For a company called X, names like "X Bank", "X Pay", "X Red" almost always belong here, NOT in likelyCompetitors.
- likelyCompetitors: SEPARATE, INDEPENDENT companies competing with this business. Never list a product, sub-brand, division or alternative name of the business itself. If unsure whether a name is a rival or part of this business, put it in subBrands.
- sourcesUsed: URLs you relied on.`;

export interface ResearchInput {
  name: string;
  category: string;
  city?: string;
  market: Market;
  website?: string;
  competitors: string[];
}

export interface ResearchOutcome {
  research: BusinessResearch;
  calls: number;
  costUsd: number;
  searchFeeUsd: number;
}

/** Empty, honest result used when research is impossible or fails. */
export function emptyResearch(): BusinessResearch {
  return businessResearchSchema.parse({ confidence: "low" });
}

/** Tolerant JSON extraction: models like to wrap objects in prose or fences. */
export function parseResearch(raw: string): BusinessResearch | null {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
    const result = businessResearchSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function buildPrompt(input: ResearchInput): string {
  const lines = [
    `Business name: ${input.name}`,
    `Category as stated by the owner: ${input.category}`,
  ];
  if (input.city) lines.push(`City: ${input.city}`);
  lines.push(`Market: ${input.market}`);
  if (input.website) {
    lines.push(`Website: ${input.website} (read this page before answering)`);
  }
  if (input.competitors.length > 0) {
    lines.push(`Competitors the owner named: ${input.competitors.join(", ")}`);
  }
  lines.push(
    "",
    "Research this business and reply with the JSON object described in your instructions.",
  );
  return lines.join("\n");
}

/**
 * Run Stage A. Never throws: research is an enhancement, so a failure degrades
 * to low confidence and the scan continues on the form fields alone.
 */
export async function researchBusiness(input: ResearchInput): Promise<ResearchOutcome> {
  if (env.DEMO_MODE || !env.PERPLEXITY_API_KEY) {
    return { research: emptyResearch(), calls: 0, costUsd: 0, searchFeeUsd: 0 };
  }

  let costUsd = 0;
  let searchFeeUsd = 0;
  let calls = 0;

  try {
    const answer = await agentCallRaw(buildPrompt(input), {
      model: RESEARCH_MODEL,
      webSearch: true,
      fetchUrl: Boolean(input.website),
      instructions: RESEARCH_INSTRUCTIONS,
      maxOutputTokens: 1200,
    });
    calls += 1;
    costUsd += answer.costUsd;
    searchFeeUsd += answer.searchFeeUsd ?? 0;
    await recordUsage("research", {
      tokensIn: answer.tokensIn,
      tokensOut: answer.tokensOut,
      costUsd: answer.costUsd,
      searchFeeUsd: answer.searchFeeUsd ?? 0,
    });

    const parsed = parseResearch(answer.text);
    if (!parsed) {
      logger.warn(
        { business: input.name, preview: answer.text.slice(0, 200) },
        "research returned unparsable JSON, continuing with form fields only",
      );
      return { research: emptyResearch(), calls, costUsd, searchFeeUsd };
    }
    // Citations are a more reliable source list than the model's own claim.
    if (parsed.sourcesUsed.length === 0 && answer.citations.length > 0) {
      parsed.sourcesUsed = answer.citations.slice(0, 10).map((c) => c.url);
    }
    logger.info(
      {
        business: input.name,
        confidence: parsed.confidence,
        services: parsed.services.length,
        competitors: parsed.likelyCompetitors.length,
        costUsd: Math.round(costUsd * 100000) / 100000,
      },
      "stage A research complete",
    );
    return { research: parsed, calls, costUsd, searchFeeUsd };
  } catch (err) {
    logger.error({ err, business: input.name }, "research stage failed, continuing without it");
    return { research: emptyResearch(), calls, costUsd, searchFeeUsd };
  }
}
