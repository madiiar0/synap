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
   added (default `admin@synapai.app`).
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
9. **OpenAI web search tool id.** The installed SDK's Responses API expects
   `web_search_preview` (the spec says "web_search" generically); revisit when
   real keys are added.
10. **`pnpm seed` against the in-memory fallback is throwaway** (separate
   process = separate in-memory DB). The dev server auto-seeds its own
   in-memory DB on startup instead; `pnpm seed` is for real-Mongo setups.
11. **Public scans are shared, not owned.** The 7-day cache means several
    visitors can reach the same scan. Every visitor who unlocks with an email
    gets dashboard access (`Brand.claimedBy` array); the first one is also
    the nominal `userId` owner. Anyone with the same public brand info could
    always trigger the same scan, so shared read access leaks nothing new.
12. **Fuzzy matching is stricter than the literal spec.** The spec says
    "Levenshtein ≤2/word", but that misattributes 1-edit rival names
    ("Mega Clinics" → "Vega Clinic", "Alga Bank" → "Alfa Bank"). Implemented:
    fuzzy only for multi-word aliases, the first (distinctive) word must
    match exactly, later words keep the ≤1/≤2 tolerance; one text span
    credits only one brand. Regression-tested.
13. **Production refuses the default JWT secret** (`change_me` or <16 chars)
    at startup — forged admin sessions otherwise.
14. **DeepSeek/Grok pricing are estimates with source comments**
    (`deepseek-chat` cache-miss rate; `grok-3-mini` — xAI Live Search is
    billed extra per source and is NOT in the token cost table). Re-verify
    when keys are added.
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
18. **Cost table is estimates.** Per-1M-token USD prices for sonar /
   gpt-4o-mini / claude-haiku-4-5 / gemini-2.5-flash are constants marked as
   estimates to be re-verified when real keys are added (MANUAL_SETUP step).
