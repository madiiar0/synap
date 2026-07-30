import mongoose, { Schema, type Document } from "mongoose";
import type { Locale, UserRole } from "@synapai/shared";

export interface UserDoc extends Document {
  email: string;
  name?: string;
  locale: Locale;
  role: UserRole;
  passwordHash?: string;
  magicTokenHash?: string;
  magicExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String },
    locale: { type: String, enum: ["ru", "en"], default: "ru" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    passwordHash: { type: String },
    magicTokenHash: { type: String },
    magicExpiresAt: { type: Date },
  },
  { timestamps: true },
);

export const User = mongoose.model<UserDoc>("User", userSchema);
