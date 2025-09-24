"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15);
const max = Number(process.env.RATE_LIMIT_MAX || 100);
const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 30);
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: windowMinutes * 60 * 1000,
    max: authMax,
    standardHeaders: true,
    legacyHeaders: false
});
