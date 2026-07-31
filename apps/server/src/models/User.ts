import mongoose, { Schema, type Document } from "mongoose";
import type { Locale, UserRole } from "@synapai/shared";

export interface UserDoc extends Document {
  email: string;
  name?: string;
  locale: Locale;
  role: UserRole;
  firebaseUid?: string;
  photoUrl?: string;
  emailVerified: boolean;
  /** §6 quota: server-side authority, incremented on scan start. */
  freeScansUsed: number;
  freeScanLimit: number;
  unlimitedScans: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String },
    locale: { type: String, enum: ["ru", "en"], default: "ru" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    firebaseUid: { type: String, unique: true, sparse: true },
    photoUrl: { type: String },
    emailVerified: { type: Boolean, default: false },
    freeScansUsed: { type: Number, default: 0 },
    freeScanLimit: { type: Number, default: 3 },
    unlimitedScans: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = mongoose.model<UserDoc>("User", userSchema);
