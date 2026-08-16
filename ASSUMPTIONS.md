# ASSUMPTIONS

Decisions taken where the spec was ambiguous or silent, with reasoning.

1. **In-memory MongoDB fallback (dev/demo only).** The smoke test must run
   with "zero external services", and this build machine has no Docker/Mongo.
   When `MONGODB_URI` is empty or unreachable and `NODE_ENV !== 'production'`,
   the server starts `mongodb-memory-server` and connects to it (clearly
   logged). Production requires a real `MONGODB_URI`.
2. **Server runs via `tsx` in production.** The server's build step is a
   typecheck; runtime uses `tsx` (fast TS execution). This keeps the shared
   package consumable as TS source without a publish/build pipeline —
   appropriate for an MVP. Documented in MANUAL_SETUP.
3. **Position bonus interpretation.** Spec: "+0.15 weight when avg position
   ≤ 2". Implemented as: when the brand's average mention position across
   answers where it is mentioned is ≤ 2, the overall score is multiplied by
   1.15 (capped at 100). Constants live in `packages/shared/src/constants.ts`.
4. **ADMIN_EMAIL env var added.** The spec requires admin emails (budget
   pause, lead notifications) but defines no recipient; `ADMIN_EMAIL` was
   added (default `admin@akrux.app`).
5. **"Disable prompts for next scan"** is stored on the Brand as a list of
   normalized prompt texts (`disabledPrompts`); prompt generation filters
   them out. Prompts are per-scan documents, so disabling must outlive scans.
6. **Global daily scan limit** is enforced by counting today's created scans
   in Mongo (simple + restart-safe); per-IP limit is in-memory per day.
7. **Demo scan pacing.** `DEMO_SCAN_TOTAL_MS` (default 18000) spreads fixture
   engine calls so the radar screen shows a believable staged run; smoke sets
   it low to keep CI fast.
8. **Demo FULL scan scores ~39, not exactly 34.** The seeded scan runs through
   the real pipeline over deterministic fixtures tuned to land in the
   mid/high-30s (vs the older fixture snapshot's 21, so trends render). The
   spec's "overall 34" was treated as a target band, not an exact constant —
   forcing an exact number would mean fabricating the snapshot instead of
   exercising the pipeline.
9. *(superseded in iteration 4)* ~~OpenAI web search tool id~~ — direct
   provider SDKs were removed; everything routes through Perplexity's Agent
   API, whose `web_search` tool id is verified against live docs.
10. **`pnpm seed` against the in-memory fallback is throwaway** (separate
   process = separate in-memory DB). The dev server auto-seeds its own
   in-memory DB on startup instead; `pnpm seed` is for real-Mongo setups.
11. *(superseded in iteration 4)* ~~Public scans are shared~~ — anonymous
    scanning and the 7-day scan cache were removed entirely. Scans belong to
    the signed-in account that started them; `Brand.normKey` now only dedupes
    a user's own Brand document (answers are never reused).
12. **Fuzzy matching is stricter than the literal spec.** The spec says
    "Levenshtein ≤2/word", but that misattributes 1-edit rival names
    ("Mega Clinics" → "Vega Clinic", "Alga Bank" → "Alfa Bank"). Implemented:
    fuzzy only for multi-word aliases, the first (distinctive) word must
    match exactly, later words keep the ≤1/≤2 tolerance; one text span
    credits only one brand. Regression-tested.
13. **Production refuses the default JWT secret** (`change_me` or <16 chars)
    at startup — forged admin sessions otherwise.
14. *(superseded in iteration 4)* ~~DeepSeek/Grok pricing estimates~~ — all
    rates now come from Perplexity's Agent API catalogue (verified
    2026-08-01); DeepSeek is not offered there and was removed from
    scannable platforms.
15. **Copilot is display-only** (`scannable:false` — no public API): it
    appears in the hero cycle and marquee but never in scan results,
    weights, or engine cards.
16. **Real coffee-chain names (Global Coffee, Master Coffee, Coffee Boom)
    appear ONLY in the mock ChatGPT answer** with neutral, trade-off-balanced
    descriptions, per the owner's explicit rule; every surface with numbers/
    rankings uses fictional names (Astra, Nurly, Vega, Orion, Aroma Coffee…).
17. **Hero minimum font size is 24px** on very small screens — the price of
    keeping "рекомендует + [longest platform name]" on a single fixed line
    with zero layout shift during the cycle.
18. **Gartner wording (verified).** The landing paraphrases and links the
    dated prediction instead of presenting it as a current measured fact.
    The verified original prediction is "By 2028, brands' organic search
    traffic will decrease by 50% or more as consumers embrace generative
    AI-powered search" — Gartner press release, Dec 14, 2023
    (gartner.com/en/newsroom/press-releases/2023-12-14-…). The often-cited
    Feb 2024 release covers the separate "25% by 2026" prediction.
19. **Quote carousel curation.** Seven candidates were researched; five
    verified with exact wording + public sources and shipped. Sam Altman's
    only on-topic verified line was a hedgy fragment; Andy Jassy's was over
    the 20-word limit and contains an em dash — both dropped per the spec's
    rules. RU texts are our translations of the verified EN originals
    (labeled as such in quotes.ts).
20. **Mock auth trusts the email** (no password) — dev/demo/smoke only; the
    server refuses to start with AUTH_MODE=mock in production, and mock
    sessions are additionally rejected at the endpoint when NODE_ENV=production.
21. **Prerender uses react-dom/server**, not puppeteer/vite-react-ssg: a
    Vite SSR entry renders every localized public route at build time. Hydration is
    a plain client render (brief replace on load) — acceptable for an MVP;
    crawlers get full HTML either way.
22. *(superseded in iteration 4)* ~~Cost table is estimates~~ — per-call cost
    is now **provider-reported** (`usage.cost.total_cost` from the Agent
    API); the local rate table in `packages/shared/src/engines.ts` (verified
    2026-08-01) is only a fallback when the field is absent.

## Iteration 4

23. **Batch extraction failure degrades per-item.** If a batched extraction
    call fails or returns unparsable JSON, the affected answers keep their
    deterministic extraction (mentions/positions are already correct; only
    LLM sentiment + unknown-brand discovery are lost). A scan never fails
    because of extraction.
24. **Scan quota is charged at start, not completion.** `freeScansUsed` is
    incremented when the scan is created — otherwise a user could burn API
    budget indefinitely by abandoning scans mid-run. Admins can reset the
    counter in the Users tab.
25. **Email verification is enforced only in firebase mode** and never for
    admins. Mock mode marks sessions verified so offline dev/demo/smoke run
    end-to-end.
26. **Per-IP abuse counters are in-memory per day** (like the earlier daily
    limits): restart-resistant enough for an MVP, simple, and the global
    `DAILY_SCAN_CAP` (Mongo-counted) backstops them.
27. **The idempotency window is 60s and in-memory.** It exists to absorb
    double-clicks and the auth-redirect auto-run, not to be a durable ledger;
    a replay after a restart simply starts a fresh scan, which is safe (and
    quota-checked).
28. **The full 125-call tier reuses `FREE_SCAN_PROMPTS`** (25 prompts × 5
    engines); the spec fixed the multiplier, not a separate prompt count.
29. **"Scans left" is `null` for admin/unlimited accounts** and the chip is
    hidden — showing a number there would present a limit that does not
    exist (rule 2).

## Iteration 8

30. **Canonical production domain is checked in.** `CANONICAL_SITE_URL`
    (`https://akrux.app`) is the single public origin for canonicals, hreflang,
    the sitemap, llms.txt and JSON-LD. A production frontend build ignores
    `PUBLIC_SITE_URL` and per-deployment Vercel hostnames so a stale dashboard
    value cannot publish a second origin for the same entity. The backend keeps
    using `APP_BASE_URL`; it refuses localhost/non-HTTPS values in production
    and should run with `SITE_NOINDEX=true` behind the frontend proxy.
31. **No entity continuity is claimed with the former name.** Structured data
    carries no `alternateName` for the retired brand: nothing in the repository
    substantiates a verified continuity claim, and asserting one invites the
    entity confusion the migration exists to prevent. Internal package scopes,
    the database and queue names, the session cookie and local-storage keys are
    deliberately unchanged because renaming them creates migration risk without
    improving the visible entity.
32. **Public content is implementation-backed.** The current 25-prompt mix,
    43-call free plan, model-family/provider distinction, metric version 2,
    unbranded score formula, failure handling and Share of Voice rules were
    taken from the running code. No customer outcomes or availability claims
    were inferred beyond it.
33. **Missing organization facts stay missing.** Legal entity name, founders,
    founding date, physical address, public support email, social profiles,
    security/status URLs, supported-country policy and privacy-scrubbed product
    screenshots require owner-supplied facts. Public pages explain the product
    and contact route without fabricating these fields.
