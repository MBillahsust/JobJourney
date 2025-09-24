"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TimelineSchema = new mongoose_1.Schema({
    at: { type: Date, default: Date.now },
    type: { type: String, enum: ["created", "status", "note"], required: true },
    text: String,
    fromStatus: { type: String, enum: ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn", "accepted"] },
    toStatus: { type: String, enum: ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn", "accepted"] }
}, { _id: true });
const NoteSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });
const TaskSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    dueAt: Date,
    done: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });
const ContactSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: String,
    phone: String,
    role: String
}, { _id: true });
const ApplicationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    jobSnapshot: {
        title: String,
        company: { name: String },
        location: String
    },
    status: {
        type: String,
        enum: ["wishlist", "applied", "phone_screen", "interview", "offer", "rejected", "withdrawn", "accepted"],
        default: "applied",
        index: true
    },
    appliedAt: Date,
    appliedVia: String,
    resumeFileId: { type: mongoose_1.Schema.Types.ObjectId, ref: "File" },
    coverLetterText: String,
    timeline: { type: [TimelineSchema], default: [] },
    notes: { type: [NoteSchema], default: [] },
    tasks: { type: [TaskSchema], default: [] },
    contacts: { type: [ContactSchema], default: [] }
}, { timestamps: true });
ApplicationSchema.index({ userId: 1, status: 1, createdAt: -1 });
exports.Application = mongoose_1.default.model("Application", ApplicationSchema);
