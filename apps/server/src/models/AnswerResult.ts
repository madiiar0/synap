import mongoose, { Schema, type HydratedDocument, type Types } from "mongoose";
import { ENGINE_IDS, type Citation, type EngineId, type Extracted } from "@synapai/shared";

// Plain data interface (not extending Document): the `model` field would
// otherwise collide with Document#model().
export interface AnswerResultData {
  scanId: Types.ObjectId;
  promptId: Types.ObjectId;
  engine: EngineId;
  model: string;
  rawAnswer: string;
  citations: Citation[];
  extracted: Extracted;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  failed: boolean;
  errorCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AnswerResultDoc = HydratedDocument<AnswerResultData>;

const citationSchema = new Schema<Citation>(
  {
    url: { type: String, required: true },
    domain: { type: String, required: true },
    title: { type: String },
  },
  { _id: false },
);

const answerResultSchema = new Schema<AnswerResultData>(
  {
    scanId: { type: Schema.Types.ObjectId, ref: "Scan", required: true, index: true },
    promptId: { type: Schema.Types.ObjectId, ref: "GeneratedPrompt", required: true },
    engine: { type: String, enum: [...ENGINE_IDS], required: true },
    model: { type: String, default: "" },
    rawAnswer: { type: String, default: "" },
    citations: { type: [citationSchema], default: [] },
    extracted: {
      mentioned: { type: Boolean, default: false },
      matchedAlias: { type: String },
      position: { type: Number },
      sentiment: { type: String, enum: ["pos", "neu", "neg", "na"], default: "na" },
      brands: {
        type: [
          new Schema(
            { name: { type: String, required: true }, position: { type: Number } },
            { _id: false },
          ),
        ],
        default: [],
      },
    },
    latencyMs: { type: Number, default: 0 },
    tokensIn: { type: Number, default: 0 },
    tokensOut: { type: Number, default: 0 },
    costUsd: { type: Number, default: 0 },
    failed: { type: Boolean, default: false },
    errorCode: { type: String },
  },
  { timestamps: true },
);

answerResultSchema.index({ scanId: 1, promptId: 1, engine: 1 }, { unique: true });

export const AnswerResult = mongoose.model<AnswerResultData>("AnswerResult", answerResultSchema);
