import {
  AUTO_COMPETITOR_MIN_MENTIONS,
  CATEGORY_GROUP,
  ENGINE_WEIGHTS,
  POSITION_BONUS,
  SUBSCORE_WEIGHTS,
  type EngineId,
  type Extracted,
  type PerEngineScore,
  type PromptIntent,
  type ShareOfVoiceEntry,
  type TopSource,
} from "@synapai/shared";
import type { Citation } from "@synapai/shared";

export interface ScoringPrompt {
  id: string;
  intent: PromptIntent;
}

export interface ScoringAnswer {
  promptId: string;
  engine: EngineId;
  failed: boolean;
  extracted: Extracted;
  citations: Citation[];
}

export interface ScoringInput {
  brandName: string;
  configuredCompetitors: string[];
  prompts: ScoringPrompt[];
  answers: ScoringAnswer[];
  /**
   * §2.3 fair comparison: per-engine metrics (mention rate, engine score)
   * are computed ONLY over this shared prompt set that every queried engine
   * answered. Empty/omitted → all prompts (full scans).
   */
  corePromptIds?: string[];
}

export interface SnapshotData {
  overall: number;
  subscores: { branded: number; category: number; comparison: number };
  perEngine: PerEngineScore[];
  shareOfVoice: ShareOfVoiceEntry[];
  topSources: TopSource[];
  avgPosition: number | null;
}

type Group = "branded" | "category" | "comparison";

function groupOf(intent: PromptIntent): Group | null {
  if (intent === "branded") return "branded";
  if ((CATEGORY_GROUP as readonly string[]).includes(intent)) return "category";
  if (intent === "comparison") return "comparison";
  return null; // informational: counted in mentionRate/SoV only
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Weighted average over entries that exist; weights renormalized over present
 * keys (e.g. a free scan with no comparison prompts ignores that weight).
 */
function weightedAverage(parts: { value: number; weight: number }[]): number {
  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return 0;
  return parts.reduce((sum, p) => sum + p.value * p.weight, 0) / totalWeight;
}

/**
 * Pure scoring: per-engine mention rates by intent group → subscores →
 * engine-weighted overall with the position bonus. See shared/constants.ts.
 */
export function computeSnapshot(input: ScoringInput): SnapshotData {
  const intentByPrompt = new Map(input.prompts.map((p) => [p.id, p.intent]));
  const engines = [...new Set(input.answers.map((a) => a.engine))];
  const coreSet =
    input.corePromptIds && input.corePromptIds.length > 0
      ? new Set(input.corePromptIds)
      : null;

  const perEngine: PerEngineScore[] = [];
  const engineSubscores = new Map<EngineId, Partial<Record<Group, number>>>();

  const groupStats = (
    answers: ScoringAnswer[],
  ): { subs: Partial<Record<Group, number>>; mentionRate: number } => {
    const byGroup: Record<Group, { total: number; mentioned: number }> = {
      branded: { total: 0, mentioned: 0 },
      category: { total: 0, mentioned: 0 },
      comparison: { total: 0, mentioned: 0 },
    };
    let mentioned = 0;
    for (const answer of answers) {
      if (answer.extracted.mentioned) mentioned += 1;
      const intent = intentByPrompt.get(answer.promptId);
      const group = intent ? groupOf(intent) : null;
      if (group) {
        byGroup[group].total += 1;
        if (answer.extracted.mentioned) byGroup[group].mentioned += 1;
      }
    }
    const subs: Partial<Record<Group, number>> = {};
    for (const group of ["branded", "category", "comparison"] as const) {
      if (byGroup[group].total > 0) {
        subs[group] = (byGroup[group].mentioned / byGroup[group].total) * 100;
      }
    }
    return { subs, mentionRate: answers.length > 0 ? mentioned / answers.length : 0 };
  };

  for (const engine of engines) {
    const allAnswers = input.answers.filter((a) => a.engine === engine && !a.failed);
    // Overall subscores use everything the engine answered (weights applied).
    engineSubscores.set(engine, groupStats(allAnswers).subs);

    // §2.3 displayed per-engine metrics: only the shared core prompt set,
    // so engines are never compared on prompts they did not both see.
    const coreAnswers = coreSet
      ? allAnswers.filter((a) => coreSet.has(a.promptId))
      : allAnswers;
    const core = groupStats(coreAnswers);
    const engineScore = weightedAverage(
      (Object.entries(core.subs) as [Group, number][]).map(([group, value]) => ({
        value,
        weight: SUBSCORE_WEIGHTS[group],
      })),
    );
    perEngine.push({
      engine,
      mentionRate: core.mentionRate,
      score: Math.round(engineScore),
    });
  }

  // Cross-engine subscores (engine weights renormalized over engines present).
  const subscores = { branded: 0, category: 0, comparison: 0 };
  for (const group of ["branded", "category", "comparison"] as const) {
    const parts = engines
      .map((engine) => ({ engine, value: engineSubscores.get(engine)?.[group] }))
      .filter((p): p is { engine: EngineId; value: number } => p.value !== undefined)
      .map((p) => ({ value: p.value, weight: ENGINE_WEIGHTS[p.engine] }));
    subscores[group] = round1(weightedAverage(parts));
  }

  // Average position where we are mentioned.
  const positions = input.answers
    .filter((a) => !a.failed && a.extracted.mentioned && a.extracted.position)
    .map((a) => a.extracted.position as number);
  const avgPosition =
    positions.length > 0
      ? round1(positions.reduce((s, p) => s + p, 0) / positions.length)
      : null;

  const groupsPresent = (["branded", "category", "comparison"] as const).filter((group) =>
    engines.some((e) => engineSubscores.get(e)?.[group] !== undefined),
  );
  let overall = weightedAverage(
    groupsPresent.map((group) => ({
      value: subscores[group],
      weight: SUBSCORE_WEIGHTS[group],
    })),
  );
  if (avgPosition !== null && avgPosition <= POSITION_BONUS.maxAvgPosition) {
    overall *= POSITION_BONUS.multiplier;
  }
  overall = Math.min(100, Math.round(overall));

  // Share of voice across every non-failed answer.
  const mentionCounts = new Map<string, { name: string; mentions: number }>();
  for (const answer of input.answers) {
    if (answer.failed) continue;
    for (const brand of answer.extracted.brands) {
      const key = brand.name.toLowerCase();
      const entry = mentionCounts.get(key);
      if (entry) entry.mentions += 1;
      else mentionCounts.set(key, { name: brand.name, mentions: 1 });
    }
  }
  const configured = new Set(input.configuredCompetitors.map((c) => c.toLowerCase()));
  const usKey = input.brandName.toLowerCase();
  // Make sure "us" and configured competitors appear even with zero mentions.
  if (!mentionCounts.has(usKey)) mentionCounts.set(usKey, { name: input.brandName, mentions: 0 });
  for (const comp of input.configuredCompetitors) {
    if (!mentionCounts.has(comp.toLowerCase())) {
      mentionCounts.set(comp.toLowerCase(), { name: comp, mentions: 0 });
    }
  }
  const totalMentions = [...mentionCounts.values()].reduce((s, e) => s + e.mentions, 0);
  const shareOfVoice: ShareOfVoiceEntry[] = [...mentionCounts.entries()]
    .filter(([key, entry]) => {
      if (key === usKey || configured.has(key)) return true;
      return entry.mentions >= AUTO_COMPETITOR_MIN_MENTIONS; // auto-detected
    })
    .map(([key, entry]) => ({
      name: entry.name,
      mentions: entry.mentions,
      pct: totalMentions > 0 ? round1((entry.mentions / totalMentions) * 100) : 0,
      isUs: key === usKey,
      detected: key !== usKey && !configured.has(key),
    }))
    .sort((a, b) => b.mentions - a.mentions);

  // Top cited domains.
  const domainStats = new Map<string, { citations: number; mentionsUs: boolean }>();
  for (const answer of input.answers) {
    if (answer.failed) continue;
    for (const citation of answer.citations) {
      const entry = domainStats.get(citation.domain) ?? { citations: 0, mentionsUs: false };
      entry.citations += 1;
      if (answer.extracted.mentioned) entry.mentionsUs = true;
      domainStats.set(citation.domain, entry);
    }
  }
  const topSources: TopSource[] = [...domainStats.entries()]
    .map(([domain, s]) => ({ domain, citations: s.citations, mentionsUs: s.mentionsUs }))
    .sort((a, b) => b.citations - a.citations)
    .slice(0, 10);

  return { overall, subscores, perEngine, shareOfVoice, topSources, avgPosition };
}
