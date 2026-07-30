import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { PerEngineScore, ShareOfVoiceEntry, TopSource } from "@synapai/shared";

export interface ScoreSnapshotDoc extends Document {
  _id: Types.ObjectId;
  brandId: Types.ObjectId;
  scanId: Types.ObjectId;
  date: Date;
  overall: number;
  subscores: { branded: number; category: number; comparison: number };
  perEngine: PerEngineScore[];
  shareOfVoice: ShareOfVoiceEntry[];
  topSources: TopSource[];
  avgPosition: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const scoreSnapshotSchema = new Schema<ScoreSnapshotDoc>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    scanId: { type: Schema.Types.ObjectId, ref: "Scan", required: true, unique: true },
    date: { type: Date, required: true },
    overall: { type: Number, required: true },
    subscores: {
      branded: { type: Number, required: true },
      category: { type: Number, required: true },
      comparison: { type: Number, required: true },
    },
    perEngine: {
      type: [
        new Schema(
          {
            engine: { type: String, required: true },
            mentionRate: { type: Number, required: true },
            score: { type: Number, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    shareOfVoice: {
      type: [
        new Schema(
          {
            name: { type: String, required: true },
            mentions: { type: Number, required: true },
            pct: { type: Number, required: true },
            isUs: { type: Boolean, default: false },
            detected: { type: Boolean, default: false },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    topSources: {
      type: [
        new Schema(
          {
            domain: { type: String, required: true },
            citations: { type: Number, required: true },
            mentionsUs: { type: Boolean, default: false },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    avgPosition: { type: Number, default: null },
  },
  { timestamps: true },
);

scoreSnapshotSchema.index({ brandId: 1, date: -1 });

export const ScoreSnapshot = mongoose.model<ScoreSnapshotDoc>("ScoreSnapshot", scoreSnapshotSchema);
