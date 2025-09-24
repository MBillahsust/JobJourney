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
exports.Job = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const JobSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    company: {
        name: { type: String, required: true, index: true },
        site: String
    },
    location: String,
    remote: { type: String, enum: ["on_site", "remote", "hybrid"] },
    employmentType: { type: String, enum: ["full_time", "part_time", "contract", "internship"] },
    seniority: { type: String, enum: ["intern", "junior", "mid", "senior", "lead"] },
    postedAt: Date,
    salary: { currency: String, min: Number, max: Number },
    skillsRequired: [String],
    descriptionHtml: String,
    source: { provider: String, url: String }
}, { timestamps: true });
// Text search across title, company.name, and location
JobSchema.index({ title: "text", "company.name": "text", location: "text" });
// Useful secondary indexes
JobSchema.index({ postedAt: -1, _id: -1 });
JobSchema.index({ skillsRequired: 1 });
exports.Job = mongoose_1.default.model("Job", JobSchema);
