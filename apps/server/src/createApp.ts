import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import {
  contentSecurityPolicy,
  crossOriginOpenerPolicy,
  crossOriginResourcePolicy,
  originAgentCluster,
  referrerPolicy,
  strictTransportSecurity,
  xContentTypeOptions,
  xDnsPrefetchControl,
  xDownloadOptions,
  xFrameOptions,
  xPermittedCrossDomainPolicies,
  xPoweredBy,
  xXssProtection,
} from "helmet";
import { pinoHttp } from "pino-http";
import { authMode, env, isProd, repoRoot } from "./config/env.js";
import { isMemoryDb } from "./db/connect.js";
import { logger } from "./lib/logger.js";
import { adminRouter } from "./http/routes/admin.js";
import { authRouter } from "./http/routes/auth.js";
import { dashboardRouter } from "./http/routes/dashboard.js";
import { leadsRouter } from "./http/routes/leads.js";
import { publicAnalyticsRouter } from "./http/routes/publicAnalytics.js";
import { scanRouter } from "./http/routes/scan.js";
import { attachUser } from "./http/middleware/auth.js";
import { errorHandler, notFoundHandler } from "./http/middleware/errors.js";
import { apiLimiter } from "./http/middleware/rateLimits.js";
import { mountSeo } from "./http/seo.js";

export function createApp(): Express {
  const app = express();
  // §3.1: Express sends an ETag for every JSON body, so two users (or the same
  // user before and after a scan) hitting an identical-looking payload get a
  // 304 with a stale body. The client then keeps rendering "no businesses" and
  // bounces to onboarding. User-scoped data must never be conditionally cached.
  app.set("etag", false);
  app.set("trust proxy", 1);
  const canonicalOrigin = new URL(env.APP_BASE_URL).origin;
  // §2.1: helmet's default CSP is `script-src 'self'` / `frame-src 'self'`,
  // which silently breaks the Firebase sign-in popup once the server serves
  // the built client. Widen exactly the origins Firebase Auth needs and no
  // more, rather than turning the header off.
  const FIREBASE_FRAME = [
    "https://*.firebaseapp.com",
    "https://accounts.google.com",
    "https://*.google.com",
  ];
  // Use Helmet's named middleware exports instead of its dual ESM/CJS default
  // export. These are the same defaults Helmet composes internally, with the
  // existing Firebase CSP and opener-policy exceptions preserved.
  app.use(
    contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://apis.google.com", "https://www.gstatic.com"],
        "connect-src": [
          "'self'",
          "https://*.googleapis.com",
          "https://*.firebaseapp.com",
          "https://accounts.google.com",
          "https://securetoken.googleapis.com",
        ],
        "frame-src": ["'self'", ...FIREBASE_FRAME],
        "form-action": ["'self'", ...FIREBASE_FRAME],
        // Google account avatars.
        "img-src": ["'self'", "data:", "https://lh3.googleusercontent.com"],
      },
    }),
    // Firebase's popup needs to be able to talk to its opener.
    crossOriginOpenerPolicy({ policy: "same-origin-allow-popups" }),
    crossOriginResourcePolicy(),
    originAgentCluster(),
    referrerPolicy(),
    strictTransportSecurity(),
    xContentTypeOptions(),
    xDnsPrefetchControl(),
    xDownloadOptions(),
    xFrameOptions(),
    xPermittedCrossDomainPolicies(),
    xPoweredBy(),
    xXssProtection(),
  );

  // One origin and one trailing-slash policy for public HTML. In production,
  // preview hosts and HTTP requests consolidate to APP_BASE_URL with a 308.
  app.use((req, res, next) => {
    const apiRequest = req.path === "/api" || req.path.startsWith("/api/");
    if ((req.method === "GET" || req.method === "HEAD") && !apiRequest) {
      if (isProd && `${req.protocol}://${req.get("host")}` !== canonicalOrigin) {
        res.redirect(308, `${canonicalOrigin}${req.originalUrl}`);
        return;
      }
      if (req.path.length > 1 && req.path.endsWith("/")) {
        const queryIndex = req.originalUrl.indexOf("?");
        const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
        res.redirect(308, `${req.path.replace(/\/+$/, "")}${query}`);
        return;
      }
    }
    next();
  });
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

  // §3.1: belt and braces — mark every API response uncacheable.
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, demo: env.DEMO_MODE });
  });

  // Public, non-secret client configuration.
  app.get("/api/config", (_req, res) => {
    res.json({
      brandName: env.BRAND_NAME,
      demo: env.DEMO_MODE,
      authMode,
      publicAnalyticsEnabled: env.PUBLIC_ANALYTICS_ENABLED,
      // §0.1/§0.2: the UI warns when data is not persisted or auth is mocked.
      memoryDb: isMemoryDb(),
      isDev: !isProd,
    });
  });

  app.use("/api/scan", apiLimiter, scanRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/leads", apiLimiter, leadsRouter);
  app.use("/api/analytics", apiLimiter, publicAnalyticsRouter);
  app.use("/api/admin", apiLimiter, adminRouter);
  app.use("/api", apiLimiter, dashboardRouter);

  // SEO: server-injected meta for public routes + robots/sitemap/llms (§1).
  mountSeo(app);

  // Serve the built client when it exists (single-origin production setup).
  const clientDist = path.join(repoRoot, "apps/client/dist");
  if (fs.existsSync(clientDist)) {
    const spaShell = path.join(clientDist, "spa.html");
    const fallbackShell = fs.existsSync(spaShell) ? spaShell : path.join(clientDist, "index.html");
    app.use(
      express.static(clientDist, {
        setHeaders: (res, filePath) => {
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        },
      }),
    );
    app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => {
      const privateClientRoute = ["/app", "/admin", "/scan", "/verify-email"].some(
        (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
      );
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      res.setHeader("Cache-Control", privateClientRoute ? "private, no-store" : "no-store");
      res.status(privateClientRoute ? 200 : 404).sendFile(fallbackShell);
    });
  }

  app.use("/api", notFoundHandler);
  app.use(errorHandler);
  return app;
}
