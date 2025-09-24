"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({ body: req.body, query: req.query, params: req.params });
        next();
    }
    catch (e) {
        return res.status(400).json({
            error: { code: "VALIDATION_ERROR", message: "Invalid request", details: e.errors }
        });
    }
};
exports.validate = validate;
