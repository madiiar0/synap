import type {
  AnswerRowDto,
  BrandDto,
  CompetitorRowDto,
  EngineId,
  LosePromptDto,
  OverviewDto,
  PromptRowDto,
  ScoreSnapshotDto,
  Sentiment,
} from "@synapai/shared";
import { MAX_USER_COMPETITORS, normalizedKey } from "@synapai/shared";
import { env } from "../config/env.js";
import type { UserDoc } from "../models/User.js";
import { AnswerResult } from "../models/AnswerResult.js";
import { type BrandDoc } from "../models/Brand.js";
import { GeneratedPrompt } from "../models/GeneratedPrompt.js";
import { Scan, type ScanDoc } from "../models/Scan.js";
import { ScoreSnapshot, type ScoreSnapshotDoc } from "../models/ScoreSnapshot.js";
import { scanAllowance } from "./allowance.js";
import { keywordSentiment } from "./extraction.js";

export function toBrandDto(brand: BrandDoc): BrandDto {
  return {
    id: String(brand._id),
    name: brand.name,
    aliases: brand.aliases,
    website: brand.website,
    category: brand.category,
    city: brand.city,
    country: brand.country,
    market: brand.market,
    // §6/#10: the editable list stays inside MAX_USER_COMPETITORS; research
    // findings are surfaced separately so a save can never exceed the cap or
    // silently delete them.
    competitors: brand.competitors.filter((c) => !c.detected).slice(0, MAX_USER_COMPETITORS),
    detectedCompetitors: brand.competitors.filter((c) => c.detected),
    locale: brand.locale,
  };
}

function toSnapshotDto(doc: ScoreSnapshotDoc): ScoreSnapshotDto {
  return {
    scanId: String(doc.scanId),
    date: doc.date.toISOString(),
    overall: doc.overall,
    subscores: doc.subscores,
    perEngine: doc.perEngine,
    shareOfVoice: doc.shareOfVoice,
    topSources: doc.topSources,
    avgPosition: doc.avgPosition,
  };
}

/** Latest finished scan (done/partial) with its snapshot, if any. */
export async function latestScoredScan(
  brandId: string,
): Promise<{ scan: ScanDoc; snapshot: ScoreSnapshotDoc } | null> {
  const scans = await Scan.find({ brandId, status: { $in: ["done", "partial"] } })
    .sort({ createdAt: -1 })
    .limit(5);
  for (const scan of scans) {
    const snapshot = await ScoreSnapshot.findOne({ scanId: scan._id });
    if (snapshot) return { scan, snapshot };
  }
  return null;
}

export async function buildOverview(brand: BrandDoc, user: UserDoc): Promise<OverviewDto> {
  const latest = await latestScoredScan(String(brand._id));
  let previous: ScoreSnapshotDto | null = null;
  let losePrompts: LosePromptDto[] = [];

  if (latest) {
    const prev = await ScoreSnapshot.find({
      brandId: brand._id,
      scanId: { $ne: latest.scan._id },
      date: { $lt: latest.snapshot.date },
    })
      .sort({ date: -1 })
      .limit(1);
    previous = prev[0] ? toSnapshotDto(prev[0]) : null;

    // Top prompts where competitors are named and we're not.
    const lost = await AnswerResult.find({
      scanId: latest.scan._id,
      failed: false,
      "extracted.mentioned": false,
      "extracted.brands.0": { $exists: true },
    }).limit(50);
    const promptMap = new Map(
      (await GeneratedPrompt.find({ scanId: latest.scan._id })).map((p) => [String(p._id), p]),
    );
    const scoredIntents = new Set(["category", "best_of", "purchase", "comparison"]);
    losePrompts = lost
      .flatMap((a) => {
        const p = promptMap.get(String(a.promptId));
        return p ? [{ a, p }] : [];
      })
      .sort((x, y) => Number(scoredIntents.has(y.p.intent)) - Number(scoredIntents.has(x.p.intent)))
      .slice(0, 5)
      .map(({ a, p }) => ({
        promptId: String(p._id),
        text: p.text,
        engine: a.engine,
        answerId: String(a._id),
        competitorNames: a.extracted.brands
          .filter((b) => b.name.toLowerCase() !== brand.name.toLowerCase())
          .map((b) => b.name),
      }));
  }

  // §6.3/#7: the SAME allowance the session and the gate use, so the chip and
  // the form can never disagree. The IP gate is deliberately not applied here:
  // the overview reports the account balance, `canScan` on the session carries
  // the network state.
  const scansLeft = scanAllowance(user).scansLeft;

  return {
    brand: toBrandDto(brand),
    scan: latest
      ? {
          id: String(latest.scan._id),
          status: latest.scan.status,
          tier: latest.scan.tier,
          finishedAt: latest.scan.finishedAt?.toISOString() ?? null,
          engines: latest.scan.engines,
        }
      : { id: "", status: "queued", tier: "free", finishedAt: null, engines: [] },
    snapshot: latest ? toSnapshotDto(latest.snapshot) : null,
    previous,
    losePrompts,
    demo: env.DEMO_MODE,
    scansLeft,
  };
}

export interface AnswerFilters {
  engine?: EngineId;
  language?: "ru" | "en";
  intent?: string;
  mentioned?: boolean;
}

export async function buildAnswers(
  scanId: string,
  filters: AnswerFilters,
): Promise<AnswerRowDto[]> {
  const prompts = await GeneratedPrompt.find({ scanId });
  const promptMap = new Map(prompts.map((p) => [String(p._id), p]));
  const query: Record<string, unknown> = { scanId };
  if (filters.engine) query.engine = filters.engine;
  if (filters.mentioned !== undefined) query["extracted.mentioned"] = filters.mentioned;
  const answers = await AnswerResult.find(query).sort({ createdAt: 1 }).limit(500);
  return answers.flatMap((a): AnswerRowDto[] => {
    const prompt = promptMap.get(String(a.promptId));
    if (!prompt) return [];
    if (filters.language && prompt.language !== filters.language) return [];
    if (filters.intent && prompt.intent !== filters.intent) return [];
    return [
      {
        id: String(a._id),
        engine: a.engine,
        model: a.model,
        promptText: prompt.text,
        intent: prompt.intent,
        language: prompt.language,
        rawAnswer: a.rawAnswer,
        citations: a.citations,
        extracted: a.extracted,
        failed: a.failed,
      },
    ];
  });
}

function majoritySentiment(sentiments: Sentiment[]): Sentiment {
  const counts = new Map<Sentiment, number>();
  for (const s of sentiments) counts.set(s, (counts.get(s) ?? 0) + 1);
  let best: Sentiment = "na";
  let bestCount = 0;
  for (const [s, count] of counts) {
    if (s !== "na" && count > bestCount) {
      best = s;
      bestCount = count;
    }
  }
  return best;
}

/** Competitor leaderboard rows computed from a scan's answers. */
export async function competitorRowsForScan(
  scanId: string,
  brand: BrandDoc,
): Promise<CompetitorRowDto[]> {
  const answers = await AnswerResult.find({ scanId, failed: false });
  if (answers.length === 0) return [];
  const snapshot = await ScoreSnapshot.findOne({ scanId });
  const names = new Map<string, string>(); // lower -> display
  names.set(brand.name.toLowerCase(), brand.name);
  for (const c of brand.competitors) names.set(c.name.toLowerCase(), c.name);
  for (const e of snapshot?.shareOfVoice ?? []) names.set(e.name.toLowerCase(), e.name);

  const configured = new Set(brand.competitors.map((c) => c.name.toLowerCase()));
  const usKey = brand.name.toLowerCase();

  const rows: CompetitorRowDto[] = [];
  for (const [key, display] of names) {
    const isUs = key === usKey;
    const relevant = answers.filter((a) =>
      isUs ? a.extracted.mentioned : a.extracted.brands.some((b) => b.name.toLowerCase() === key),
    );
    const positions = relevant
      .map((a) =>
        isUs
          ? a.extracted.position
          : a.extracted.brands.find((b) => b.name.toLowerCase() === key)?.position,
      )
      .filter((p): p is number => typeof p === "number");
    const sentiments = relevant.map((a) =>
      isUs ? a.extracted.sentiment : keywordSentiment(a.rawAnswer),
    );
    rows.push({
      name: display,
      isUs,
      detected: !isUs && !configured.has(key),
      visibilityPct: Math.round((relevant.length / answers.length) * 1000) / 10,
      sentiment: majoritySentiment(sentiments),
      avgPosition:
        positions.length > 0
          ? Math.round((positions.reduce((s, p) => s + p, 0) / positions.length) * 10) / 10
          : null,
      trend: null, // filled by the route when a previous scan exists
    });
  }
  return rows.sort((a, b) => b.visibilityPct - a.visibilityPct);
}

export async function buildPromptRows(scanId: string, brand: BrandDoc): Promise<PromptRowDto[]> {
  const prompts = await GeneratedPrompt.find({ scanId }).sort({ createdAt: 1 });
  const answers = await AnswerResult.find({ scanId });
  const byPrompt = new Map<string, { engine: EngineId; mentioned: boolean; failed: boolean }[]>();
  for (const a of answers) {
    const key = String(a.promptId);
    const list = byPrompt.get(key) ?? [];
    list.push({ engine: a.engine, mentioned: a.extracted.mentioned, failed: a.failed });
    byPrompt.set(key, list);
  }
  const disabled = new Set(brand.disabledPrompts.map((p) => normalizedKey(p)));
  return prompts.map((p) => ({
    promptId: String(p._id),
    text: p.text,
    intent: p.intent,
    language: p.language,
    disabled: disabled.has(normalizedKey(p.text)),
    engines: byPrompt.get(String(p._id)) ?? [],
  }));
}
