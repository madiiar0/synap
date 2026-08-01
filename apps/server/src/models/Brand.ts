import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { CompetitorRef, Locale, Market } from "@synapai/shared";

export interface BrandDoc extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  /** Everyone who unlocked a report for this brand (public scans are shared). */
  claimedBy: Types.ObjectId[];
  name: string;
  aliases: string[];
  website?: string;
  category: string;
  city?: string;
  country: string;
  market: Market;
  competitors: CompetitorRef[];
  locale: Locale;
  /** Normalized prompt texts the user disabled for future scans. */
  disabledPrompts: string[];
  /** normalizedKey(name, category, city) — used to reuse a user's own Brand doc across scans (answers are never reused, §2.4). */
  normKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const competitorSchema = new Schema<CompetitorRef>(
  {
    name: { type: String, required: true },
    aliases: { type: [String], default: [] },
    // §6: true when Stage A research found this competitor rather than the
    // owner typing it. Detected entries are shown read-only and are NOT
    // counted against the user-facing MAX_USER_COMPETITORS cap.
    detected: { type: Boolean, default: false },
  },
  { _id: false },
);

const brandSchema = new Schema<BrandDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    claimedBy: { type: [Schema.Types.ObjectId], ref: "User", default: [], index: true },
    name: { type: String, required: true },
    aliases: { type: [String], default: [] },
    website: { type: String },
    category: { type: String, required: true },
    city: { type: String },
    country: { type: String, default: "KZ" },
    market: { type: String, enum: ["kz", "ru", "global"], default: "kz" },
    competitors: { type: [competitorSchema], default: [] },
    locale: { type: String, enum: ["ru", "en"], default: "ru" },
    disabledPrompts: { type: [String], default: [] },
    normKey: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

export const Brand = mongoose.model<BrandDoc>("Brand", brandSchema);
