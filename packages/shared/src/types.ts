import type { EngineId, Locale, Market, PromptIntent } from "./constants.js";

export type ScanTier = "free" | "full";
export type ScanStatus = "queued" | "running" | "done" | "partial" | "failed";
export type Sentiment = "pos" | "neu" | "neg" | "na";
export type LeadType = "scan_email" | "book_call";
export type LeadSource = "landing" | "dashboard" | "report";
export type UserRole = "user" | "admin";
export type PromptLanguage = Locale;

export interface Citation {
  url: string;
  domain: string;
  title?: string;
}

export interface ExtractedBrand {
  name: string;
  position?: number;
}

export interface Extracted {
  mentioned: boolean;
  matchedAlias?: string;
  position?: number;
  sentiment: Sentiment;
  brands: ExtractedBrand[];
}

export interface CompetitorRef {
  name: string;
  aliases: string[];
}

export interface ScanProgressDto {
  scanId: string;
  status: ScanStatus;
  done: number;
  total: number;
  currentPrompt: string | null;
}

export interface TeaserEngineBar {
  engine: EngineId;
  mentionRate: number; // 0..1
}

export interface TeaserDto {
  scanId: string;
  brandName: string;
  status: ScanStatus;
  overall: number;
  engines: TeaserEngineBar[];
  competitorsDetected: number;
  /** One sample answer where a competitor is named; shown blurred in the teaser. */
  sampleAnswer: { engine: EngineId; prompt: string; snippet: string } | null;
  demo: boolean;
}

export interface PerEngineScore {
  engine: EngineId;
  mentionRate: number; // 0..1 across all prompts run on this engine
  score: number; // 0..100 intent-weighted within the engine
}

export interface ShareOfVoiceEntry {
  name: string;
  mentions: number;
  pct: number; // 0..100
  isUs: boolean;
  detected: boolean; // auto-discovered (not user-configured)
}

export interface TopSource {
  domain: string;
  citations: number;
  mentionsUs: boolean;
}

export interface ScoreSnapshotDto {
  scanId: string;
  date: string; // ISO
  overall: number;
  subscores: { branded: number; category: number; comparison: number };
  perEngine: PerEngineScore[];
  shareOfVoice: ShareOfVoiceEntry[];
  topSources: TopSource[];
  avgPosition: number | null;
}

export interface BrandDto {
  id: string;
  name: string;
  aliases: string[];
  website?: string;
  category: string;
  city?: string;
  country: string;
  market: Market;
  competitors: CompetitorRef[];
  locale?: Locale;
}

export interface LosePromptDto {
  promptId: string;
  text: string;
  engine: EngineId;
  answerId: string;
  competitorNames: string[];
}

export interface OverviewDto {
  brand: BrandDto;
  scan: { id: string; status: ScanStatus; tier: ScanTier; finishedAt: string | null };
  snapshot: ScoreSnapshotDto | null;
  previous: ScoreSnapshotDto | null;
  losePrompts: LosePromptDto[];
  demo: boolean;
  rescanAvailableAt: string | null; // null => available now
}

export interface AnswerRowDto {
  id: string;
  engine: EngineId;
  model: string;
  promptText: string;
  intent: PromptIntent;
  language: PromptLanguage;
  rawAnswer: string;
  citations: Citation[];
  extracted: Extracted;
  failed: boolean;
}

export interface CompetitorRowDto {
  name: string;
  isUs: boolean;
  detected: boolean;
  visibilityPct: number; // share of answers that mention the brand, 0..100
  sentiment: Sentiment;
  avgPosition: number | null;
  trend: number | null; // delta in visibilityPct vs previous scan
}

export interface PromptRowDto {
  promptId: string;
  text: string;
  intent: PromptIntent;
  language: PromptLanguage;
  disabled: boolean;
  engines: { engine: EngineId; mentioned: boolean; failed: boolean }[];
}

export interface ScanListItemDto {
  id: string;
  brandName: string;
  tier: ScanTier;
  status: ScanStatus;
  createdAt: string;
  finishedAt: string | null;
  overall: number | null;
  costUsd: number;
}

export interface LeadRowDto {
  id: string;
  type: LeadType;
  email?: string;
  phone?: string;
  name?: string;
  brandName: string;
  scanId?: string;
  message?: string;
  source: LeadSource;
  createdAt: string;
}

export interface UsageDayDto {
  date: string; // YYYY-MM-DD
  provider: string;
  calls: number;
  tokens: number;
  costUsd: number;
}

export interface BudgetStateDto {
  todaySpendUsd: number;
  dailyBudgetUsd: number;
  paused: boolean;
}

export interface SessionUserDto {
  id: string;
  email: string;
  name?: string;
  locale: Locale;
  role: UserRole;
}
