import { LOCALES, PUBLIC_PATHS } from "@synapai/shared";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { PublicMetric } from "../../models/PublicMetric.js";

export const publicAnalyticsRouter = Router();

const metricSchema = z.object({
  path: z.enum(PUBLIC_PATHS),
  locale: z.enum(LOCALES),
  event: z.enum(["page_view", "signup_intent", "contact_intent"]),
  source: z.enum(["direct", "internal", "search", "chatgpt", "perplexity", "claude", "copilot", "other"]),
}).strict();

publicAnalyticsRouter.post("/public", async (req, res, next) => {
  try {
    if (!env.PUBLIC_ANALYTICS_ENABLED) {
      res.status(204).end();
      return;
    }
    const metric = metricSchema.parse(req.body);
    const date = new Date().toISOString().slice(0, 10);
    await PublicMetric.updateOne(
      { date, ...metric },
      { $inc: { count: 1 } },
      { upsert: true },
    );
    // No visitor identifier, referrer URL, query, IP address or user agent is
    // persisted. The browser classifies the referrer into a coarse source.
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
