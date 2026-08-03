import mongoose, { Schema, type Document } from "mongoose";

export type PublicMetricEvent = "page_view" | "signup_intent" | "contact_intent";
export type PublicMetricSource =
  | "direct"
  | "internal"
  | "search"
  | "chatgpt"
  | "perplexity"
  | "claude"
  | "copilot"
  | "other";

export interface PublicMetricDoc extends Document {
  date: string;
  path: string;
  locale: "ru" | "en";
  event: PublicMetricEvent;
  source: PublicMetricSource;
  count: number;
}

const publicMetricSchema = new Schema<PublicMetricDoc>(
  {
    date: { type: String, required: true },
    path: { type: String, required: true },
    locale: { type: String, enum: ["ru", "en"], required: true },
    event: {
      type: String,
      enum: ["page_view", "signup_intent", "contact_intent"],
      required: true,
    },
    source: {
      type: String,
      enum: ["direct", "internal", "search", "chatgpt", "perplexity", "claude", "copilot", "other"],
      required: true,
    },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

publicMetricSchema.index(
  { date: 1, path: 1, locale: 1, event: 1, source: 1 },
  { unique: true },
);

export const PublicMetric = mongoose.model<PublicMetricDoc>("PublicMetric", publicMetricSchema);
