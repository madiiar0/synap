# BUILDLOG

Chronological log of the SynapAI v2 build. Newest entries last.

## 2026-07-31 — Session start

- Environment: macOS, Node v22.14.0, pnpm 9.15.9 via corepack shim (global
  `corepack enable` needs sudo on this machine — use `corepack pnpm <cmd>`),
  git 2.49.0. No Docker on this machine — dev/demo runs use the in-memory
  MongoDB fallback; `docker-compose.yml` is provided for real deployments.
- Found that `~/synapai` previously contained the v1 build; the owner removed
  it right before this session. v2 is a clean rebuild from the v2 spec in a
  fresh repo.
- Scaffolded pnpm monorepo: `apps/server`, `apps/client`, `packages/shared`,
  strict TS, flat ESLint config, vitest.

## P1 — Core + funnel ✅

- Shared package: scoring/engine constants, zod schemas, RU↔EN transliteration,
  deterministic brand matcher (fuzzy Levenshtein restricted to multi-word
  aliases after a false-positive test caught "Astra"→"astral").
- Server: 8 Mongoose models + Settings; engine adapters (Perplexity fetch,
  ChatGPT Responses+web_search_preview, Gemini+Google Search grounding, Claude)
  behind an instrument wrapper (60s timeout, 2 retries, concurrency 2/provider,
  ApiUsage upsert, daily budget guard with admin email); deterministic demo
  fixture engine; two-stage extraction; template+LLM prompt generation; scan
  pipeline with resume support; pure scoring; magic-link auth; file-outbox
  mailer; inline/BullMQ queue; public + auth + dashboard + leads + admin APIs.
- Client: minimal landing + scan form, progress screen (polling), teaser with
  score ring + engine bars + blurred sample + email unlock, login, BookCall
  modal (Calendly embed or fallback form; every open logged as a lead).
- Auto-seed on in-memory Mongo boot so `pnpm dev` is demoable with zero setup.
- Verification: typecheck ✅ lint ✅ 48 unit tests ✅ client build ✅
  smoke ✅ (scan 25/25 → teaser → unlock → magic-link email file → verify →
  dashboard score+SoV+sources → book_call lead → admin listing, fully offline).
- Seed: admin creds printed at runtime (regenerated each seed; not recorded
  here on purpose), demo brand «Astra Dental» — old snapshot 21, fresh FULL
  fixture scan scored 39.

## P2 — Dashboard ✅

- App shell: sidebar (six sections), topbar with brand switcher, locale
  toggle, re-scan button honoring the weekly quota (disabled + tooltip when
  used), demo badge, logout; unauthenticated → /login redirect.
- Pages: Overview (animated score ring + delta vs previous scan, four engine
  cards with trend arrows, Share-of-Voice bars with "вы"/"замечен" tags,
  "Where you lose" expandable prompts with brand-highlighted answers,
  persistent Book-a-call banner), Answers explorer (4 filters, expandable rows
  with highlight + sentiment + citations), Competitors leaderboard (rankings
  table w/ visibility bars, sentiment, avg position, trend), Sources (+insight
  line), Prompts (engine result dots + disable toggles), Settings (brand,
  aliases, competitors editor, market, locale).
- Error toasts via a QueryCache hook (401s excluded); skeletons + empty states
  throughout.
- Fixes along the way: /g-regex lastIndex bug in the highlighter, toggle knob
  positioning, prompt template/modifier word doubling («отзывы — отзывы»).
- Verified in a real browser against the auto-seeded demo brand: all six pages
  render every widget (magic-link login → /app). typecheck/lint/tests/build/
  smoke all green.

## P3 — Landing design (§12) ✅

- Design system: light `#FAFAFA` / dark `#0A0A0A` sections, dashed hairline
  separators, vertical blueprint guides at container edges (≥1280px), Inter
  variable (self-hosted, Cyrillic subsets), pill buttons, monochrome engine
  glyphs (deliberately not official logos + trademark note in the footer).
- Motion: `Reveal` (IntersectionObserver .25 once → 600ms cubic-bezier
  blur/translate clear, 70ms stagger, reduced-motion = fade only); hero engine
  line cycling ChatGPT→Claude→Gemini→Perplexity every 2.2s with a 500ms blur
  swap in a fixed-height line (no layout shift); CSS marquee (two rows,
  opposite directions, hover pause, duplicated track).
- Sections built per spec order: dark hero + hairline scan form card, fear
  line (last two words unblur on scroll), chat-style mock answer (Astra/
  Nurly/Vega), prompt marquee, 3-column how-it-works, oversized Gartner quote
  (the only statistic), angled product-preview div, 6-item FAQ accordion,
  final dark CTA with preview peeking, minimal footer.
- Progress screen §12.10: radar (3 hairline rings, conic sweep 3s, pulsing
  ring dots, brand initial), blur-swapped currentPrompt, 5 progress dots +
  counter, blur-out transition into the teaser. Fixed a React effect-cleanup
  bug that cancelled the teaser navigation; progress DTO now carries
  brandName for the radar initial.
- 6 client component tests (Reveal, hero fixed-height cycle, FAQ toggle).
- Browser-verified at 1440 / 768 / 375 px — no horizontal overflow; radar and
  full reveal flow captured live.

## P4 — Admin, i18n sweep, docs, adversarial review ✅

- Admin panel (`/admin`, admin role): Leads (type filter + CSV export), Scans
  (status/cost/score, re-run, trigger FULL scan per brand), Usage (per-day
  per-provider cost chart, budget state + resume), Engines (global flags).
  All four pages browser-verified.
- i18n: `scripts/check-i18n.mjs` wired into `pnpm test` — zero hard-coded
  Cyrillic in `apps/client/src`, 241 keys mirrored across ru/en.
- Docs: README (quickstart, architecture, scoring), MANUAL_SETUP (9-step
  founder checklist: keys → Calendly → SMTP → Atlas → deploy → go-live).
- **Adversarial review** (26-agent workflow: 5 dimension reviewers, then a
  skeptic verifying every finding): 18 confirmed findings, all fixed —
  - scan pipeline: atomic queued→running claim (duplicate enqueues are
    no-ops), stale-`running` rescue in the sweeper, failed answers now retried
    on re-run (were permanently skipped), admin rerun of a live scan → 409;
  - security: production refuses default JWT secret; rate limiter on all
    public endpoints + strict limiter on the email-sending unlock endpoint;
    CSV formula-injection escaping; per-IP scan quota no longer burned by
    validation failures or cache hits; cache lookup no longer degrades after
    10 same-key brands;
  - product: unlockers of a cached scan get shared dashboard access
    (claimedBy) instead of a dead-end; BookCall no longer fakes success on
    failure (and blank optional fields no longer 400); teaser unlock shows
    errors; progress screen stops polling dead scans and shows a failure
    state;
  - matcher: first-word-exact fuzzy anchoring (kills 1-edit rival false
    positives), hyphen≡space name variants, one-span-one-brand dedupe,
    Kazakh Cyrillic transliteration (ә ғ қ ң ө ұ ү һ і).
- Final green board: typecheck ✅ lint ✅ 58 tests ✅ i18n sweep ✅ client
  build ✅ offline smoke ✅.

## Iteration 2 — Landing redesign & fixes (2026-07-31)

**Global:** brand→business sweep in both locales (RU «бизнес»/«компания» by
grammar); dentistry→coffee examples everywhere (placeholders "Coffee Boom" /
«кофейня» / Алматы); theme inverted to light across the whole site — hero,
navbar and the scan progress screen included; dark reserved for CTA cards
(gradient) and black pill buttons.

**What changed:**
- **Logos & registry:** owner PNGs copied from ~/Desktop/logo_AI to
  `apps/client/src/assets/ai-logos/` (7: chatgpt, claude, gemini, perplexity,
  deepseek, grok, copilot); `AI_PLATFORMS` registry in shared with
  `scannable` flags (Copilot display-only — never in scan results);
  EngineMark now renders the real images; footer note extended to
  «…названия и логотипы…».
- **Two new real engines:** DeepSeek (`deepseek-chat`, OpenAI-compatible) and
  Grok (xAI, Live Search `mode:auto`, citations mapped) behind
  `DEEPSEEK_API_KEY` / `XAI_API_KEY`; cost-table entries with source
  comments; `ENGINES_FULL` = six engines; new weights chatgpt .25 /
  perplexity .20 / gemini .15 / deepseek .15 / grok .15 / claude .10; demo
  fixtures cover both (hash-varied per engine); FAQ lists exactly the six.
- **Navbar:** fixed liquid-glass wrapper; island morph at scrollY≥32
  (max-w 1200→880, pill radius, hairline, soft shadow, 350ms
  cubic-bezier(.2,.8,.2,1)), rAF-throttled, no content jump.
- **Hero:** exactly two lines in both locales; cycles ALL registry platforms
  (3.5s hold, 900ms overlapping blur crossfade, stacked-grid slot so the
  widest name reserves width → zero layout shift); form removed from the
  hero — new light `/scan` page hosts it; every "check" CTA routes there.
- **Fear line:** RU/EN exactly 3 lines; scroll-linked per-word unblur
  (p: 85%→35% viewport, rAF), «вашего конкурента.» resolves last;
  reduced-motion falls back to a single fade.
- **Mock answer:** one narrative block with the fear line (`#product`,
  tight pb-8/pt-0); real ChatGPT logo avatar; coffee content per spec
  (Global Coffee / Master Coffee / Coffee Boom, neutral blurbs with mild
  trade-offs, initial squares, no invented logos); reference density.
- **Marquee:** three rows (right/left/right at 42s/50s/46s), bigger chips
  (text-base/lg, py-3 px-5, h-6 logos), 24 RU + 24 EN prompt sets that swap
  entirely with the language, logos from the full registry incl. Copilot.
- **How it works:** new copy (Спрашиваем ИИ / Полная картина / Исправляем за
  вас + EN), ghost lucide icons (ScanSearch/Gauge/Handshake, 120px,
  opacity .06, cropped bottom-right), hover/focus lift + icon
  brighten/scale.
- **Quote:** localized RU quote, Gartner credibility caption, bigger
  «Ваш бизнес готов?» + two CTAs.
- **Removed** the standalone Rankings preview section; nav «Продукт» →
  `#product`.
- **Final CTA:** gradient #0A0A0A→#474747, elevated preview (shadow-lg,
  −1°), localized table («Компания/Видимость/Тональность»), fictional names.
- **Logo:** black synapse mark (3 nodes, 2 strokes) in one `Logo.tsx`;
  wordmark black; used in nav, footer, login, dashboard sidebar.
- **i18n:** fixed terms enforced (Индекс видимости, Тональность, Доля
  упоминаний, Компания…); new purity tests — RU bundle bans known-English UI
  terms, EN bundle bans Cyrillic (langRu exempt), key parity; 246 mirrored
  keys.
- **Seed:** fictional «Aroma Coffee» (кофейня, Алматы) with fictional
  competitors Nurly Coffee / Vega Roasters / Orion; detected pool
  Astra/Polaris; old snapshot covers 6 engines.
- **Dashboard:** engine cards grid 3×2 desktop / 2×3 tablet / stacked
  mobile.

**QA (recorded per §15):** typecheck ✅ lint ✅ tests 61 ✅ (incl. new i18n
purity + hero-cycle tests) i18n sweep ✅ (246 keys) build ✅ smoke ✅ (full
funnel, Coffee Boom). Browser pass: hero 2 lines RU+EN, cycle without layout
shift; navbar island morph smooth; /scan → progress (light radar) → teaser →
dashboard end-to-end; fear-line word unblur verified at 3 lines; mock answer
density + #product anchor; 3-row marquee localized; ghost-icon hover; quote
block; rankings section gone; gradient CTA localized; dashboard shows six
engine cards with real logos («Индекс видимости» 40, +19). Widths 375/768/
1440: no horizontal overflow (fixed a hero-slot overflow at 375 by lowering
the clamp minimum, and a 4-line fear wrap at 1440 by widening to max-w-5xl).

## Iteration 3 — SEO, Firebase auth, hero and landing polish (2026-07-31)

- **Dash purge (§0.1):** both i18n bundles, all client source, quotes,
  fixtures and prompt templates rewritten without em/en dashes (hyphen only
  where a connector is unavoidable); enforced by a new vitest
  (`dashPurge.test.ts`) scanning JSON + every client .ts/.tsx + quotes.ts.
- **SEO (§1):** Express middleware injects per-route, per-language title,
  description, canonical, hreflang (ru/en/x-default), OG/Twitter tags and
  JSON-LD (Organization, SoftwareApplication, WebSite, FAQPage on /) for
  `/`, `/scan`, `/login` and the `/en` variants; a build-time prerender
  (react-dom/server via a Vite SSR entry, no puppeteer) writes real-body
  HTML for all six route×locale pages; language now lives in the URL
  (`/en` prefix) and the toggle rewrites it; robots.txt (10 crawlers/AI bots
  explicitly), sitemap.xml with hreflang alternates, llms.txt; favicon
  set + apple-touch + webmanifest + og-image generated from the synapse mark
  via sharp (`scripts/generate-icons.mjs`); per-route tab titles fixed.
  Verified by curl: real HTML body («Станьте ответом» ≥1), localized titles,
  hreflang, 4 JSON-LD blocks, robots/sitemap/llms served, icons 200.
- **Auth (§2):** magic-link and password auth fully removed (UI + endpoints +
  schemas). Firebase Auth: client email+password и Google (popup, redirect
  fallback), server verifies ID tokens via firebase-admin and upserts by
  firebaseUid with email fallback, so scan-unlock pre-created accounts link
  automatically; `AUTH_MODE=mock` (email-only) keeps dev/demo/smoke fully
  offline and is refused in production; admin has no public entry point
  (role via Mongo, documented in MANUAL_SETUP). Localized error mapping for
  wrong password / email-in-use / weak password / popup closed / blocked /
  network.
- **Auth page (§2.3-2.5):** two-column light layout; left card (logo, single
  h1, Google button with the official mark, divider, email+password,
  black-pill submit, sign-in/up toggle, book-a-call link, focus rings,
  autocomplete attrs); right #F4F4F4 dot-grid panel with the quote carousel:
  **five web-verified quotes** (Pichai, Nadella, Srinivas, Huang, Schmidt) —
  each verified against a public source by an adversarial two-pass search
  workflow (15 agents), stored with sourceUrl + dated company figures;
  Altman (weak fragment) and Jassy (>20 words, contains a dash) dropped.
  8s auto-advance, pause on hover/focus, dots + arrows, arrow keys,
  aria-live polite, 500ms blur fade, reduced-motion instant swap.
- **Hero (§3):** «Станьте ответом в» / "Be the answer in" + the platform as
  its own centered cycling line; hero fills 100svh minus the fixed navbar
  (--nav-h) and centers vertically; same 3.5s/900ms crossfade.
- **Fear line (§4):** rebuilt as a continuous feathered gradient — one rAF
  loop writes blur/opacity/color per word every frame (FEATHER=4.5, ease-out
  cubic, #B4B4B4→#111), no CSS transitions. Verified in a frozen frame:
  blur levels 0.07 / 0.84 / 3.2 / 8.2 / 14 px simultaneously (≥3 required).
- **Landing polish:** real coffee logos in the mock answer (h-8, alt, initial
  square fallback) and in the final-CTA rankings panel (h-5) with a visible
  «Пример данных» / "Sample data" tag; marquee heading rewritten (RU 3 lines
  / EN 2 lines via locale-conditional max-width); how-it-works copy dash-free;
  RU quote in guillemets, two lines, one-sentence hyphen source line; navbar
  three levels (ghost lang / secondary «Войти» pill / primary black pill);
  footer trademark line replaced with © 2026 SynapAI; /scan select fixed
  (appearance-none, chevron right-4, h-12 uniform), subtitle rewritten, no
  duplicated footer nav.
- **QA (§13):** typecheck ✅ lint ✅ 70 tests ✅ (dash purge, SEO/JSON-LD,
  i18n purity, hero cycle) i18n sweep ✅ (254 keys) build+prerender ✅ (6
  pages, login body included) smoke ✅ (mock-auth flow, report email links
  to /login). Browser: mock sign-in → /app works; hero centered, 2 lines,
  no layout shift; feathered fear verified numerically; quote guillemets;
  CTA coffee logos + sample tag; scan select inset chevron; EN at /en fully
  localized (lang=en, EN marquee set); no horizontal overflow at minimum
  width in either locale.

## Iteration 4 — Functionality rebuild: one provider, live-only scans, quotas (2026-08-01)

Two overriding rules implemented end-to-end: **(1) no cross-scan caching of
answers, ever** — every scan issues a complete fresh set of provider calls;
**(2) never present data we did not measure** — only queried engines render.

- **Provider catalogue verified live (2026-08-01, docs.perplexity.ai):**
  Perplexity **Agent API** (`POST https://api.perplexity.ai/v1/agent`) exposes
  third-party models under one key with provider-reported cost
  (`usage.cost.total_cost` incl. `tool_calls_cost`) and a `web_search` tool at
  a **flat $2.50 per 1000 requests**. Cheapest tier per provider chosen
  (rates $/MTok in/out):
  - chatgpt → `openai/gpt-5.4-nano` ($0.20 / $1.25), weight .30
  - gemini → `google/gemini-3.1-flash-lite` ($0.25 / $1.50), weight .25
  - perplexity → `perplexity/sonar` ($0.25 / $2.50), weight .20
  - claude → `anthropic/claude-haiku-4-5` ($1.00 / $5.00), weight .15
  - grok → `xai/grok-4.3` ($1.25 / $2.50), weight .10
  - extraction/prompt-gen model: `openai/gpt-5.4-nano` (no web_search).
  **DeepSeek is NOT offered** through the Agent API → removed from scannable
  platforms (logo remains display-only) and from FAQ copy.
  Registry + rates live in `packages/shared/src/engines.ts`; fallback local
  rate math only applies if the API omits `usage.cost`.
- **Why plain fetch, not the SDK:** the existing instrumented wrapper already
  handles timeout (60s), 2 retries with backoff and per-call accounting; the
  Agent API is one POST with a documented JSON schema, so the SDK would add a
  dependency without removing any code.
- **Scan plan (§2):** free scan = 25 prompts; core 8 (all 6 branded + 2
  comparison) × core engines (chatgpt, gemini, perplexity) + 17 tail prompts
  on perplexity = **41 live calls**. Full tier (admin-only) = 25 × 5 = 125.
  Fair comparison: per-engine display metrics computed over the shared core
  set only; the overall score uses every measured answer. Unqueried engines
  render as «не проверялся» / "not checked" — never a number.
- **Freshness (§2.4):** answer-reuse/normalized-key cache deleted; within-scan
  dedup only. Enforced by `test/freshness.test.ts` (two sequential scans of
  the same business = two full 41-call sets, zero shared documents) and the
  §4 call-budget test (41 + ceil(41/10) max provider calls; extraction is
  batched ≤10 answers per call → 5 extra calls).
- **Auth & quotas (§5-6):** scanning requires a signed-in account —
  anonymous scan, teaser page and email-unlock removed entirely; the landing
  form stashes its data in sessionStorage, survives the login redirect and
  auto-starts the scan once authenticated. Firebase email verification gates
  the first scan (mock mode exempt). Quotas server-side: 3 free scans per
  account (`freeScansUsed`/`freeScanLimit`/`unlimitedScans`), 4th attempt →
  402 `QUOTA_EXCEEDED` → end-of-trial modal (book-a-call + WhatsApp, no
  prices anywhere). Abuse controls: disposable-email blocklist, 5 scan
  starts/IP/day, 3 new accounts/IP/day, global `DAILY_SCAN_CAP=200` (admin
  emailed once/day at the cap). Idempotency keys (60s window) make double
  submits return the same scan.
- **Admin (§7):** `ADMIN_EMAIL` auto-promoted on boot (role + unlimited +
  verified). New Users tab (search, grant/revoke unlimited, reset counter,
  edit limit) and Costs tab (per-scan calls/tokens/search-fees/cost, spend
  today + 30 days, budget state). `pnpm cost:report` prints the same offline.
- **Cost instrumentation (§8):** per-answer tokens + `searchFeeUsd` +
  provider-reported cost persisted; per-engine breakdown and totals on each
  scan; one-line cost summary logged at scan end.
- **Measured cost of one real scan: PENDING** — `PERPLEXITY_API_KEY` is empty
  in the owner's `.env`, so no live call was possible this session. Computed
  estimate from verified rates: 41 answers (~250 in / ~350 out tok) with 41
  search fees ($0.1025) + 5 batched extraction calls ≈ **$0.16–0.25**, under
  the $0.35 acceptance bar. TODO(owner): paste the key, run one scan, read
  the exact figure from Admin → Costs or `pnpm cost:report`, record it here.
- **Cleanup (§9):** per-provider adapters (openai/anthropic/genai/deepseek/
  grok/perplexity direct), their env keys, deps (`openai`,
  `@anthropic-ai/sdk`, `@google/genai`, `bcryptjs`), the public scan route,
  teaser page and rescan-cooldown logic all deleted. `.env.example`, README,
  MANUAL_SETUP rewritten around the four remaining credentials (Perplexity,
  Firebase, MongoDB, SMTP).
- **Progress UI:** percentage + radar + current question only; counts of
  prompts/engines never shown.
