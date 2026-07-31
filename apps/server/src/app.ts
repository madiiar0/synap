import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { authMode, env, repoRoot } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { adminRouter } from "./http/routes/admin.js";
import { authRouter } from "./http/routes/auth.js";
import { dashboardRouter } from "./http/routes/dashboard.js";
import { leadsRouter } from "./http/routes/leads.js";
import { publicRouter } from "./http/routes/public.js";
import { attachUser } from "./http/middleware/auth.js";
import { errorHandler, notFoundHandler } from "./http/middleware/errors.js";
import { apiLimiter } from "./http/middleware/rateLimits.js";
import { mountSeo } from "./http/seo.js";

export function createApp(): Express {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "200kb" }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      genReqId: () => crypto.randomUUID(),
      autoLogging: env.NODE_ENV !== "test",
    }),
  );
  app.use(attachUser);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, demo: env.DEMO_MODE });
  });

  // Public, non-secret client configuration.
  app.get("/api/config", (_req, res) => {
    res.json({
      brandName: env.BRAND_NAME,
      demo: env.DEMO_MODE,
      calendlyUrl: env.CALENDLY_URL || null,
      whatsappUrl: env.WHATSAPP_URL || null,
      authMode,
    });
  });

  app.use("/api/public", apiLimiter, publicRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/leads", apiLimiter, leadsRouter);
  app.use("/api/admin", apiLimiter, adminRouter);
  app.use("/api", apiLimiter, dashboardRouter);

  // SEO: server-injected meta for public routes + robots/sitemap/llms (§1).
  mountSeo(app);

  // Serve the built client when it exists (single-origin production setup).
  const clientDist = path.join(repoRoot, "apps/client/dist");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use("/api", notFoundHandler);
  app.use(errorHandler);
  return app;
}
