"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const uri = process.env.MONGODB_URI;
if (!uri) {
    // Provide a clear, early error so it's obvious why mongoose fails to connect
    const msg = '[db] MONGODB_URI is not set. Create a Backend/.env file or set the environment variable MONGODB_URI (e.g. mongodb://localhost:27017)';
    console.error(msg);
    throw new Error(msg);
}
const dbName = process.env.DB_NAME || "jobjourney";
/** Reuse connection in dev/serverless */
let cached = global._mongoose;
if (!cached)
    cached = global._mongoose = { conn: null, promise: null };
async function connectDB() {
    if (cached.conn)
        return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose_1.default
            .connect(uri, { dbName, maxPoolSize: 10 })
            .then((m) => {
            console.log("[db] connected to", m.connection.db?.databaseName || "unknown database");
            return m;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
