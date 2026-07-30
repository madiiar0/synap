import mongoose, { Schema, type Document, type Types } from "mongoose";
import type { LeadSource, LeadType } from "@synapai/shared";

export interface LeadDoc extends Document {
  _id: Types.ObjectId;
  type: LeadType;
  email?: string;
  phone?: string;
  name?: string;
  brandName: string;
  scanId?: Types.ObjectId;
  message?: string;
  source: LeadSource;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<LeadDoc>(
  {
    type: { type: String, enum: ["scan_email", "book_call"], required: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },
    name: { type: String },
    brandName: { type: String, default: "" },
    scanId: { type: Schema.Types.ObjectId, ref: "Scan" },
    message: { type: String },
    source: { type: String, enum: ["landing", "dashboard", "report"], default: "landing" },
  },
  { timestamps: true },
);

leadSchema.index({ createdAt: -1 });

export const Lead = mongoose.model<LeadDoc>("Lead", leadSchema);
