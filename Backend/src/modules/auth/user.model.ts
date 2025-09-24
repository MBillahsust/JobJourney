import mongoose, { Schema, Document } from "mongoose";

export type Seniority = "intern" | "junior" | "mid" | "senior" | "lead";

export interface Profile {
  phone?: string;
  location?: string;
  targets?: {
    roles?: string[];            // targetRoles
    seniority?: Seniority;       // seniorityLevel
  };
  preferredLocations?: string[];
}

export interface UserDoc extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  tokenVersion: number;          // << used to invalidate existing refresh tokens
  profile?: Profile;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<Profile>(
  {
    phone: String,
    location: String,
    targets: {
      roles: [String],
      seniority: { type: String, enum: ["intern", "junior", "mid", "senior", "lead"] }
    },
    preferredLocations: [String]
  },
  { _id: false }
);

const UserSchema = new Schema<UserDoc>(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 },     // << NEW
    profile:   { type: ProfileSchema, default: {} }
  },
  { timestamps: true }
);

// Ensure emails are stored lowercase and trimmed
UserSchema.pre("save", function (next) {
  const doc = this as UserDoc;
  if (doc.email) doc.email = doc.email.toLowerCase().trim();
  next();
});

export const User = mongoose.model<UserDoc>("User", UserSchema);
