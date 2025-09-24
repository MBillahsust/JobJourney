import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  // Provide a clear, early error so it's obvious why mongoose fails to connect
  const msg = '[db] MONGODB_URI is not set. Create a Backend/.env file or set the environment variable MONGODB_URI (e.g. mongodb://localhost:27017)';
  console.error(msg);
  throw new Error(msg);
}
const dbName = process.env.DB_NAME || "jobjourney";

/** Reuse connection in dev/serverless */
let cached = (global as any)._mongoose as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} | undefined;

if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(uri as string, { dbName, maxPoolSize: 10 })
      .then((m) => {
        console.log("[db] connected to", m.connection.db?.databaseName || "unknown database");
        return m;
      });
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
