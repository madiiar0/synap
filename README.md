# Synap v2 — AI Visibility Scanner

Synap answers one question for a business: **"How visible are you in AI
assistants' answers — from 0 to 100 — and who wins instead of you?"**

A business owner signs up → enters their company → the system generates
25 customer-style prompts → fires them **live** across AI engines (ChatGPT,
Gemini and Perplexity in the free scan; Claude and Grok join the full,
admin-triggered tier) → extracts mentions, competitors, sentiment, positions
and cited sources → renders a **Visibility Score 0–100** with a detailed
dashboard. The only conversion action is **Book a call**.

Two rules override everything (see `BUILDLOG.md`, iteration 4):

1. **No cross-scan caching of answers, ever.** Every scan issues a complete,
   fresh set of provider calls (enforced by `apps/server/test/freshness.test.ts`).
2. **Never present data that was not measured.** Only engines that were
   actually queried appear in results; the rest are shown as "not checked".

Full UI, emails and generated prompts are bilingual: **RU (default) + EN**.

## Quick start (zero setup, fully offline)

```bash
pnpm install
pnpm dev          # server :4000 + client :5173
```

With the default `DEMO_MODE=true` and no `.env` at all this runs completely
offline: an **in-memory MongoDB** starts automatically, engine answers come
from labeled deterministic fixtures (zero API cost), auth runs in
`AUTH_MODE=mock` (email-only dev sign-in, refused in production), emails are
written to `apps/server/.mail-outbox/*.html`, and the DB is auto-seeded with
the demo brand **«Astra Dental»**. Admin credentials are printed in the
server log on startup.

Open http://localhost:5173 — the entire funnel (scan form → sign-in →
live progress → dashboard) works end-to-end. The dashboard shows a
"Demo data" badge.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Server (tsx watch) + client (Vite) in parallel |
| `pnpm typecheck` | Strict TS across all workspaces |
| `pnpm lint` | ESLint (flat config) across the repo |
| `pnpm test` | Unit + component tests, i18n sweep and obsolete-brand check |
| `pnpm smoke` | Headless end-to-end funnel test, offline, non-zero exit on failure |
| `pnpm seed` | Seed admin/demo users + demo brand (use with a real `MONGODB_URI`) |
| `pnpm build` | Typecheck server + build client bundle (incl. prerender) |
| `pnpm seo:audit` | Audit built HTML, metadata, schema, links, crawl files, statuses and noindex boundaries |
| `pnpm check-brand` | Reject visible references to the former product name |
| `pnpm cost:report` | Per-scan and per-day API spend from the database |

## Repository layout

```
apps/server        Express + Mongoose API, scan pipeline, job queue, emails
apps/client        React 18 + Vite + Tailwind (landing, funnel, dashboard, admin)
packages/shared    zod schemas, types, engine registry, scan config, i18n JSON
scripts/           i18n, brand and generated-asset quality checks
docker-compose.yml mongo + redis for real deployments
```

## How a scan works

1. `POST /api/scan` — **account required** (Firebase; email must be verified).
   Quota: 3 free scans per account; abuse controls per IP; global
   `DAILY_SCAN_CAP`. When the quota is spent the API returns 402
   `QUOTA_EXCEEDED` and the client shows the book-a-call modal.
2. Prompt generation — 25 prompts, intent mix (branded 3 / comparison 3 /
   category 5 / best-of 5 / purchase 5 / informational 4), RU/EN ratio driven
   by the market; LLM generation with a hard-coded template fallback.
3. Fan-out per the scan plan: 9 core prompts go to ChatGPT, Gemini and
   Perplexity model families; the 16 tail prompts are split between ChatGPT and
   Gemini → **43 live calls** per free scan. All engines are reached through **one provider** —
   Perplexity's Agent API (`PERPLEXITY_API_KEY` is the only AI credential);
   per-call token+search-fee cost accounting and a **daily budget hard-stop**
   (`DAILY_LLM_BUDGET_USD` — scans pause, admin gets an email, resume button
   in the admin panel).
4. Two-stage extraction: deterministic alias matcher (RU↔EN transliteration +
   Levenshtein) that always wins on `mentioned=true`, then a **batched** LLM
   pass (≤10 answers per call) for sentiment + unknown-brand discovery
   (auto-detected competitors join Share of Voice at ≥3 mentions).
5. Scoring → `ScoreSnapshot`: the primary score combines successful unbranded
   category-group answers (×0.60) and unbranded comparison answers (×0.40),
   with engine weights renormalized over enabled engines and a limited +15%
   position bonus when average position is ≤2. Branded recognition is reported
   separately. Per-engine comparison metrics use only the shared core prompt set.
   Constants live in `packages/shared/src/{constants,engines,scanConfig}.ts`.

## Going live

See **MANUAL_SETUP.md** — a step-by-step checklist (Perplexity API key,
Firebase, SMTP, Calendly, Mongo Atlas, deploy, go-live verification) written
for a non-DevOps founder. Design decisions and spec interpretations are
recorded in **ASSUMPTIONS.md**; the build history in **BUILDLOG.md**.

The public site is prerendered in Russian and English. One shared route
registry drives routing, localized metadata, canonical and hreflang links,
JSON-LD, the sitemap, `robots.txt`, `llms.txt` and the deployed-style audit.
Account pages, APIs, private scans and dashboard routes are excluded from
indexing.

---

ChatGPT, Claude, Gemini, Perplexity, Grok — all product names are trademarks
of their respective owners.
