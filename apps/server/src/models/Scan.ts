import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { BusinessResearch, EngineId, ScanStage, ScanStatus, ScanTier } from "@synapai/shared";

export interface ScanTotals {
  prompts: number;
  calls: number;
  tokensIn: number;
  tokensOut: number;
  searchFees: number;
  costUsd: number;
}

export interface EngineCost {
  engine: EngineId;
  calls: number;
  tokensIn: number;
  tokensOut: number;
  searchFees: number;
  costUsd: number;
}

export interface ScanDoc extends Document {
  _id: Types.ObjectId;
  brandId: Types.ObjectId;
  tier: ScanTier;
  status: ScanStatus;
  /** §2: `stage` drives the staged progress labels in the UI. */
  progress: { done: number; total: number; currentPrompt: string | null; stage: ScanStage };
  engines: EngineId[];
  /** §2: which engines get core prompts vs the tail (fixed at creation so
   * resume uses the same plan). */
  plan: { coreEngines: EngineId[]; tailEngines: EngineId[] };
  /** §2 Stage A output, stored so the owner can inspect what the system believed. */
  research?: BusinessResearch | null;
  /** §2: cost broken out per pipeline stage. */
  stageCosts: { stage: string; calls: number; costUsd: number }[];
  trigger: "public" | "user" | "admin";
  startedAt?: Date;
  finishedAt?: Date;
  totals: ScanTotals;
  engineCosts: EngineCost[];
  pausedReason?: "budget" | null;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scanSchema = new Schema<ScanDoc>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    tier: { type: String, enum: ["free", "full"], required: true },
    status: {
      type: String,
      enum: ["queued", "running", "done", "partial", "failed"],
      default: "queued",
      index: true,
    },
    progress: {
      done: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      currentPrompt: { type: String, default: null },
      stage: { type: String, enum: ["research", "prompts", "engines"], default: "research" },
    },
    engines: { type: [String], default: [] },
    plan: {
      coreEngines: { type: [String], default: [] },
      tailEngines: { type: [String], default: [] },
    },
    research: { type: Schema.Types.Mixed, default: null },
    stageCosts: { type: [{ stage: String, calls: Number, costUsd: Number }], default: [] },
    trigger: { type: String, enum: ["public", "user", "admin"], default: "user" },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    totals: {
      prompts: { type: Number, default: 0 },
      calls: { type: Number, default: 0 },
      tokensIn: { type: Number, default: 0 },
      tokensOut: { type: Number, default: 0 },
      searchFees: { type: Number, default: 0 },
      costUsd: { type: Number, default: 0 },
    },
    engineCosts: {
      type: [
        new Schema(
          {
            engine: { type: String, required: true },
            calls: { type: Number, default: 0 },
            tokensIn: { type: Number, default: 0 },
            tokensOut: { type: Number, default: 0 },
            searchFees: { type: Number, default: 0 },
            costUsd: { type: Number, default: 0 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    pausedReason: { type: String, enum: ["budget", null], default: null },
    error: { type: String },
  },
  { timestamps: true },
);

scanSchema.index({ brandId: 1, createdAt: -1 });

export const Scan = mongoose.model<ScanDoc>("Scan", scanSchema);
