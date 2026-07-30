import mongoose, { Schema, type Document } from "mongoose";
import { ENGINE_IDS, type EngineId } from "@synapai/shared";

export interface SettingsDoc extends Document {
  key: "global";
  /** Admin on/off per engine; an engine also needs its API key to be usable. */
  engineFlags: Record<EngineId, boolean>;
  /** YYYY-MM-DD the budget-pause email was last sent (avoid spamming). */
  budgetNotifiedDate?: string;
  /** YYYY-MM-DD an admin explicitly resumed scans despite the cap. */
  budgetOverrideDate?: string;
}

const settingsSchema = new Schema<SettingsDoc>(
  {
    key: { type: String, default: "global", unique: true },
    engineFlags: {
      type: Object,
      default: () => Object.fromEntries(ENGINE_IDS.map((id) => [id, true])),
    },
    budgetNotifiedDate: { type: String },
    budgetOverrideDate: { type: String },
  },
  { timestamps: true, minimize: false },
);

export const Settings = mongoose.model<SettingsDoc>("Settings", settingsSchema);

export async function getSettings(): Promise<SettingsDoc> {
  const existing = await Settings.findOne({ key: "global" });
  if (existing) return existing;
  return Settings.create({ key: "global" });
}
