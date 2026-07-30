import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { EngineId, ScanStatus, ScanTier } from "@synapai/shared";

export interface ScanTotals {
  prompts: number;
  calls: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}

export interface ScanDoc extends Document {
  _id: Types.ObjectId;
  brandId: Types.ObjectId;
  tier: ScanTier;
  status: ScanStatus;
  progress: { done: number; total: number; currentPrompt: string | null };
  engines: EngineId[];
  trigger: "public" | "user" | "admin";
  startedAt?: Date;
  finishedAt?: Date;
  totals: ScanTotals;
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
    },
    engines: { type: [String], default: [] },
    trigger: { type: String, enum: ["public", "user", "admin"], default: "public" },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    totals: {
      prompts: { type: Number, default: 0 },
      calls: { type: Number, default: 0 },
      tokensIn: { type: Number, default: 0 },
      tokensOut: { type: Number, default: 0 },
      costUsd: { type: Number, default: 0 },
    },
    pausedReason: { type: String, enum: ["budget", null], default: null },
    error: { type: String },
  },
  { timestamps: true },
);

scanSchema.index({ brandId: 1, createdAt: -1 });

export const Scan = mongoose.model<ScanDoc>("Scan", scanSchema);
