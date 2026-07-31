import mongoose, { Schema, type Document } from "mongoose";

export interface ApiUsageDoc extends Document {
  date: string; // YYYY-MM-DD (UTC)
  provider: string;
  calls: number;
  tokens: number;
  costUsd: number;
  searchFees: number;
}

const apiUsageSchema = new Schema<ApiUsageDoc>(
  {
    date: { type: String, required: true },
    provider: { type: String, required: true },
    calls: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 },
    costUsd: { type: Number, default: 0 },
    searchFees: { type: Number, default: 0 },
  },
  { timestamps: true },
);

apiUsageSchema.index({ date: 1, provider: 1 }, { unique: true });

export const ApiUsage = mongoose.model<ApiUsageDoc>("ApiUsage", apiUsageSchema);
