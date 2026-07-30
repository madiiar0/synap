import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, BudgetExceededError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
}

/** Central error handler: everything leaves as {error:{code,message}}. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const message = err.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join("; ");
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message } });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }
  if (err instanceof BudgetExceededError) {
    res.status(503).json({
      error: { code: "SCANS_PAUSED", message: "Scanning is temporarily paused" },
    });
    return;
  }
  // Unknown error: log details server-side, never leak them (provider errors, keys).
  logger.error({ err }, "unhandled error");
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal error" } });
}
