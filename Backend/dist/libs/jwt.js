"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Access token: short-lived, bearer auth
 */
function signAccessToken(sub) {
    return jsonwebtoken_1.default.sign({}, process.env.JWT_SECRET, { subject: sub, expiresIn: "1h" });
}
/**
 * Refresh token: longer-lived, includes tokenVersion (tv) to allow revocation
 */
function signRefreshToken(sub, tokenVersion) {
    return jsonwebtoken_1.default.sign({ tv: tokenVersion }, process.env.JWT_SECRET, {
        subject: sub,
        expiresIn: "7d"
    });
}
/**
 * Generic verify helper
 */
function verifyJwt(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
}
