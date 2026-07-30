import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { PromptIntent, PromptLanguage } from "@synapai/shared";

export interface GeneratedPromptDoc extends Document {
  _id: Types.ObjectId;
  scanId: Types.ObjectId;
  text: string;
  language: PromptLanguage;
  intent: PromptIntent;
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
  },
  { timestamps: true },
);

export const GeneratedPrompt = mongoose.model<GeneratedPromptDoc>(
  "GeneratedPrompt",
  generatedPromptSchema,
);
