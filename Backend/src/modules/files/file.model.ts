import mongoose, { Schema, Document, Types } from "mongoose";

export type FileKind = "resume" | "attachment" | "avatar";
export type FileStatus = "ready" | "deleted";

export interface FileDoc extends Document {
  userId: Types.ObjectId;
  kind: FileKind;
  status: FileStatus;

  originalFilename: string;
  storedFilename: string;             // name on disk
  mime: string;
  size: number;

  provider: "local";                  // future: "cloudinary" | "s3"
  local: {
    absPath: string;                  // absolute path on disk
    relPath: string;                  // relative to base upload dir
  };

  url: string;                        // app-facing download URL: /v1/files/:id/download
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<FileDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["resume", "attachment", "avatar"], required: true, index: true },
    status: { type: String, enum: ["ready", "deleted"], default: "ready", index: true },

    originalFilename: { type: String, required: true },
    storedFilename: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },

    provider: { type: String, default: "local" },
    local: {
      absPath: { type: String, required: true },
      relPath: { type: String, required: true }
    },

    url: { type: String, required: true }
  },
  { timestamps: true }
);

export const FileModel = mongoose.model<FileDoc>("File", FileSchema);
