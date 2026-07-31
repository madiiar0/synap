import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { PromptIntent, PromptLanguage } from "@synapai/shared";

export interface GeneratedPromptDoc extends Document {
  _id: Types.ObjectId;
  scanId: Types.ObjectId;
  text: string;
  language: PromptLanguage;
  intent: PromptIntent;
  /** §2.3: core prompts run on every engine of the scan; per-engine metrics
   * are computed over this shared set only. */
  core: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const generatedPromptSchema = new Schema<GeneratedPromptDoc>(
  {
    scanId: { type: Schema.Types.ObjectId, ref: "Scan", required: true, index: true },
    text: { type: String, required: true },
    language: { type: String, enum: ["ru", "en"], required: true },
    intent: {
      type: String,
      enum: ["branded", "category", "best_of", "comparison", "informational", "purchase"],
      required: true,
    },
    core: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const GeneratedPrompt = mongoose.model<GeneratedPromptDoc>(
  "GeneratedPrompt",
  generatedPromptSchema,
);
