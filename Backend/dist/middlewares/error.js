"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
function notFound(_req, res) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
}
function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    res.status(status).json({
        error: {
            code: err.code || "INTERNAL",
            message: err.message || "Server error",
            details: err.details || undefined
        }
    });
}
