import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (e: any) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Invalid request", details: e.errors }
      });
    }
  };
