# SynapAI v2 — AI Visibility Scanner

SynapAI answers one question for a business: **"How visible are you in AI
assistants' answers — from 0 to 100 — and who wins instead of you?"**

A visitor enters their brand → the system generates dozens of customer-style
prompts → fires them across AI engines (Perplexity always; ChatGPT / Gemini /
Claude on the full tier) → extracts mentions, competitors, sentiment,
positions and cited sources → renders a **Visibility Score 0–100** with a
detailed dashboard. The only conversion action is **Book a call**.

Full UI, emails and generated prompts are bilingual: **RU (default) + EN**.

## Quick start (zero setup, fully offline)

```bash
pnpm install
pnpm dev          # server :4000 + client :5173
```

With the default `DEMO_MODE=true` and no `.env` at all this runs completely
offline: an **in-memory MongoDB** starts automatically, engine answers come
from labeled deterministic fixtures (zero API cost), emails are written to
`apps/server/.mail-outbox/*.html`, and the DB is auto-seeded with the demo
brand **«Astra Dental»** (two scans, so trends render). Admin credentials are
printed in the server log on startup.

Open http://localhost:5173 — the entire funnel (scan → radar → teaser → email
unlock → dashboard) works end-to-end. The dashboard shows a "Demo data" badge.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Server (tsx watch) + client (Vite) in parallel |
| `pnpm typecheck` | Strict TS across all workspaces |
| `pnpm lint` | ESLint (flat config) across the repo |
| `pnpm test` | Unit + component tests, then the i18n sweep |
| `pnpm smoke` | Headless end-to-end funnel test, offline, non-zero exit on failure |
| `pnpm seed` | Seed admin/demo users + demo brand (use with a real `MONGODB_URI`) |
| `pnpm build` | Typecheck server + build client bundle |

## Repository layout

```
apps/server        Express + Mongoose API, scan pipeline, job queue, emails
apps/client        React 18 + Vite + Tailwind (landing, funnel, dashboard, admin)
packages/shared    zod schemas, types, scoring constants, translit/matcher, i18n JSON
scripts/           check-i18n.mjs (Cyrillic + locale-parity sweep)
docker-compose.yml mongo + redis for real deployments
```

## How a scan works

1. `POST /api/public/scan` (rate-limited: 3/IP/day, 30/day global; identical
   brand+category+city within 7 days returns the cached scan).
2. Prompt generation — intent mix (branded / category / best-of / comparison /
   informational / purchase) and RU/EN ratio driven by the market; cheap-LLM
   generation with a hard-coded template fallback (always used in demo).
3. Fan-out prompts × engines through instrumented adapters: 60s timeout,
   2 retries with backoff, concurrency 2 per provider, per-call cost
   accounting, **daily budget hard-stop** (`DAILY_LLM_BUDGET_USD` — scans
   pause, admin gets an email, resume button in the admin panel).
4. Two-stage extraction per answer: deterministic alias matcher (RU↔EN
   transliteration + Levenshtein) that always wins on `mentioned=true`, then
   an LLM pass for sentiment + unknown-brand discovery (auto-detected
   competitors join Share of Voice at ≥3 mentions).
5. Scoring → `ScoreSnapshot`: subscores (branded ×0.35, category ×0.45,
   comparison ×0.20), engine weights renormalized over enabled engines,
   +15% position bonus when avg position ≤ 2. Constants live in
   `packages/shared/src/constants.ts`.

## Going live

See **MANUAL_SETUP.md** — a step-by-step checklist (API keys, SMTP, Calendly,
Mongo Atlas, deploy, go-live verification) written for a non-DevOps founder.
Design decisions and spec interpretations are recorded in **ASSUMPTIONS.md**;
the build history in **BUILDLOG.md**.

---

ChatGPT, Claude, Gemini, Perplexity — all product names are trademarks of
their respective owners.
