# BUILDLOG

Chronological log of the Akrux v2 build. Newest entries last. Dated entries
keep the product name that was in force when they were written, so entries
before 2026-08-16 name the former brand.

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
  footer trademark line replaced with © 2026 Synap; /scan select fixed
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

## Iteration 5 — Auth completion, funnel fix, first-run experience (2026-08-01)

- **Atlas diagnosed (§0.1).** The real driver error was
  `MongooseServerSelectionError / ReplicaSetNoPrimary` with Atlas's own
  "IP that isn't whitelisted" message: **the current IP is not in Network
  Access**. Credentials and host are correct; the password needs no encoding.
  A second defect was found in the same URI: no database name
  (`...mongodb.net/?appName=Synap`), so writes would land in `test`.
  Both are console/env fixes for the owner, documented in MANUAL_SETUP.
  Code side: the failure now logs at **error** level with name, code, message
  and per-cause hints (was a one-line warning); a new `db/diagnose.ts`
  classifies allowlist / auth / DNS / missing-db-name; `pnpm db:check`
  connects and prints version, database and collection count or the precise
  error and remedy, exit 1 on failure; the server-selection timeout went from
  4s to 10s (too short for SRV plus replica-set discovery); production now
  refuses to start rather than falling back; and while the in-memory
  fallback is active the UI shows a persistent amber banner
  («Локальная база в памяти. Данные не сохраняются.»).
- **Auth mode is now explicit (§0.2).** Every boot logs the active mode
  (`AUTH MODE: firebase` / `AUTH MODE: mock` with a warning). `AUTH_MODE=firebase`
  with no credentials exits with the missing variable names instead of
  silently degrading. A dev-only **MOCK AUTH** badge sits next to the database
  banner. The owner completed the Firebase setup during this iteration, so the
  server now boots in firebase mode and `firebase-admin` verifies every ID
  token; mock remains impossible in production.
- **Funnel is authentication first (§1).** `/scan` (page, routes, prerender
  entry, sitemap, llms.txt, i18n path table, SEO meta) is deleted and now
  404s; a regression test asserts it never returns to `PUBLIC_PATHS`. All five
  landing CTAs route through a single `StartCta`: sign-in when signed out,
  `/app` when signed in, and a same-size neutral placeholder while the session
  resolves, so the signed-out label cannot flash. The navbar gains
  «Личный кабинет» plus an avatar menu (email, dashboard, sign out). Typed
  business details survive the redirect via `synapai:pendingBusiness`.
- **Auth page completed (§2).** Google sign-in: popup with redirect fallback
  (`auth/popup-blocked`, unsupported environment, no web storage) plus
  `getRedirectResult` on mount, `prompt: select_account`, and localized errors
  for blocked/closed popups, different-credential, unauthorized-domain and
  rate limiting. **Root cause of a silent production failure found and fixed:**
  `helmet()` defaults emit `script-src 'self'` / `frame-src 'self'` /
  `connect-src 'self'`, which blocks the Firebase auth frames once the server
  serves the built client. The CSP now allows exactly `*.firebaseapp.com`,
  `*.googleapis.com`, `accounts.google.com`, `apis.google.com`, `gstatic.com`
  plus Google avatars, with `same-origin-allow-popups`; helmet stays on.
  Sign-up adds a confirm-password field (validated on blur and submit,
  «Пароли не совпадают»), an 8-character minimum with an inline hint, correct
  `autocomplete` values, and both fields clear on mode switch. Verification is
  a real screen at `/verify-email` (resend rate limited to 60s with a visible
  countdown, "I have confirmed" reloads the Firebase user and mints a fresh ID
  token so the claim reaches the server, "change email" signs out back to
  sign-up); server-side `requireVerifiedEmail` middleware guards the scan
  endpoint. Quote arrows moved to the vertical centre of the panel's left and
  right edges as 40px circles, dots stay below, no overflow at `lg`.
- **Onboarding (§3).** `/app/onboarding` renders the business form outside the
  dashboard chrome, prefilled from the stash, with remaining free checks
  (hidden for admin/unlimited) and an "I'll do this later" link. The shell
  redirects a signed-in user with no business into it; the skip choice is
  remembered for the session so the link cannot bounce back (found in QA).
- **Dashboard states (§4).** The infinite loading shell had a specific cause: a
  React Query with `enabled: false` stays `isPending` forever, so a user with
  no business saw a permanent skeleton. `resolvePageStatus` now treats a
  disabled query as empty, an unresolved query as loading, a 10s stall as an
  error, and errors above all; five unit tests lock this down. All five pages
  (Overview, Answers, Competitors, Sources, Prompts) use content-shaped
  skeletons, per-page empty states with a CTA into onboarding, and a retry-able
  error panel that logs the raw error to the console but never shows it.
  Answers distinguishes "filters match nothing" from "no scan yet".
- **Copy fix.** How-it-works still claimed "до 100 вопросов"; a scan is 25
  prompts, so both locales were corrected (standing anti-fabrication rule).
- **QA (§5):** typecheck ✅ lint ✅ **86 tests** ✅ i18n sweep ✅ (301 keys)
  prerender build ✅ (4 pages, /scan gone) smoke ✅. Browser at 375/768/1440 in
  RU and EN: all CTAs to `/login` signed out and `/app` signed in; navbar
  «Личный кабинет» with no signed-out flash; `/scan` 404 and absent from
  sitemap and llms.txt; login → onboarding → progress → dashboard completes
  with real results and «Осталось проверок: 2»; skip reaches the empty state
  with a working CTA; all five pages show correct empty states; the error
  panel appears on a failed first load and Retry issues a fresh request;
  confirm-password mismatch blocks submit; carousel arrows sit on the panel
  sides with no overflow at the `lg` breakpoint; both dev banners render; no
  horizontal overflow at any breakpoint in either locale.
- **Not verified here:** live Google sign-in and the real verification email
  require signing into the owner's Google account, so §5's "Google sign-in
  works in Chrome and Safari" is left for the owner; the code path, CSP and
  console steps are in FIREBASE_SETUP.md. Atlas persistence across restarts
  cannot be confirmed until the IP is allowlisted.

## Iteration 6 — Real scans, research-first pipeline, redirect fixes, mobile (2026-08-02)

- **Engine catalogue verified by LIVE call, not by docs (§1.3).** New
  `pnpm engines:check` makes one minimal real call per model. First run
  exposed a defect the documentation review had missed: **`perplexity/sonar`
  returned HTTP 400 `{"message":"invalid request"}`** on every scan, so the
  Perplexity engine had never produced a single real answer. Body-shape
  bisection found the cause: **Sonar rejects the `reasoning` parameter**
  (identical requests succeed with the field omitted; unknown models return a
  distinguishable "model X is not supported" instead). Fixed with
  `supportsReasoning(model)` in `packages/shared/engines.ts`. Verified
  2026-08-02, all six models 200:
  | engine | model | latency | cost |
  | --- | --- | --- | --- |
  | chatgpt | openai/gpt-5.4-nano | 1576ms | $0.00011 |
  | gemini | google/gemini-3.1-flash-lite | 925ms | $0.00012 |
  | perplexity | perplexity/sonar | 865ms | $0.00017 |
  | claude | anthropic/claude-haiku-4-5 | 1740ms | $0.00154 |
  | grok | xai/grok-4.3 | 2570ms | $0.00131 |
  | extraction | openai/gpt-5.4-nano | 1401ms | $0.00003 |
  Rate card unchanged (see iteration 4); web_search stays $2.50/1000 flat.
- **Cost truth (§1.4), measured on a real scan of Coffee BOOM (Almaty):**
  43 engine calls, 93 763 in / 18 492 out tokens, $0.105 search fees,
  **$0.15504 total** plus $0.00503 for research = **$0.160**. That is inside
  the $0.16-0.25 estimate, so no scan-plan constants were changed. Score 77,
  wall clock ~170s.
- **Demo mode is now impossible to miss (§1.1/§1.2).** Boot logs a `warn`
  line; `/api/config` exposes `demoMode`; an amber «Демо-режим: данные не
  настоящие» banner renders app-wide. With `DEMO_MODE=false` and no key,
  `resolveEngines` throws `NoProviderError` and the scan is marked
  `SCAN_FAILED` with a localized message instead of quietly serving fixtures
  (`test/noFixtureFallback.test.ts`).
- **Three-stage pipeline (§2).** Stage A researches the business with Sonar +
  `web_search` (+`fetch_url` when a site is known) and stores strict JSON on
  the Scan; unidentifiable businesses degrade to `confidence: "low"` and the
  scan continues on form fields, never inventing services. Aliases and found
  competitors merge into the business record without overwriting user input.
  Stage B feeds that JSON to the cheap non-search model, with near-duplicate
  rejection (80% significant-word overlap) and the template fallback intact.
  Stage C fans out 9 core prompts × [chatgpt, gemini, perplexity] plus 16 tail
  prompts dealt evenly to chatgpt and gemini = **43 calls**.
  Live verification on Coffee BOOM: research returned confidence `high` with
  real 2GIS/Wolt/TripAdvisor sources, 6 real services and 5 real Almaty
  competitors; the generated prompts referenced the *researched* services
  («доставка Wolt», «собственная обжарка», «завтраки в ТЦ») rather than the
  category word; execution split exactly chatgpt 17 (9 core + 8 tail),
  gemini 17 (9 core + 8 tail), perplexity 9 (9 core), so per-engine metrics
  rest on the 9 shared core prompts. Progress now shows stage labels.
- **Root cause of the onboarding bounce (§3.1): Express ETags.** Every JSON
  body carried an ETag, so `GET /api/brands` answered **304** and the client
  replayed the pre-scan empty `[]`, making the shell redirect a user who had
  just finished a scan back to the form. Fixed with `app.set("etag", false)`
  plus `Cache-Control: no-store` on `/api`, locked by `test/noCache.test.ts`.
  Post-scan routing is now deterministic: brands/overview/session are
  invalidated and awaited before navigating, the scanned business is
  preselected, and a failed scan shows retry rather than onboarding. The shell
  redirects to onboarding only when the brands query has *successfully*
  resolved empty; pending renders a skeleton and errors render a retry panel.
- **Google sign-in (§4): could not reproduce a failure.** Verified against the
  live project: `localhost` is an authorized domain, the Google provider is
  enabled and `accounts:createAuthUri` returns a valid OAuth URI, and the
  client config and service account both belong to `synapai-8cc87`. Driving
  `signInWithPopup` in Chrome opened the real Google account chooser with a
  correct `redirect_uri`; the only console output was two benign 404s
  (`favicon.ico`, `__/firebase/init.json`) on Firebase's handler page. The
  flow then waits for a human to pick an account, which is why it appears to
  "do nothing". Every Firebase error code is now shown to the user with the
  raw code beneath it and logged as `[Synap auth] <code>: <message>`, so the
  next real failure is diagnosable; new codes covered:
  operation-not-allowed, account-exists-with-different-credential,
  unauthorized-domain, too-many-requests, internal-error, timeout.
  **Owner action:** add the production domain to Authorized domains before
  launch, and report the on-screen code if it still fails.
- **Mobile (§5).** Landing navbar collapses to logo + 44px hamburger opening a
  full-screen sheet (links, language, Log in, Check your business), island
  morph disabled below md; hero and CTA buttons stack full width; fear line
  floor 20px; mock answer and final CTA padding reduced, the rankings panel
  moves below the text at full width with a vertical gradient; marquee chips
  shrink; footer links wrap. Dashboard sidebar becomes a 6-tab bottom bar
  (56px targets, safe-area inset), header switcher truncates, re-scan is an
  icon button, scans-left shows the bare number; score ring drops to 140px
  under 400px; engine cards single column; share-of-voice labels sit above the
  bars with no truncation; Competitors and Sources become labelled stacked
  cards below md; Answers/Prompts wrap and filters scroll horizontally; radar
  scales to `min(56vw, 14rem)`. Dev banners were repositioned above the tab
  bar after QA showed them covering navigation.
- **QA (§6):** typecheck ✅ lint ✅ **92 tests** ✅ i18n sweep ✅ (311 keys)
  prerender ✅ smoke ✅ (43-call plan). Browser at true 375 / 414 / 768 CSS px
  (the harness runs at dpr 0.9, so viewports were corrected) in RU and EN:
  **zero horizontal overflow** on landing, login, onboarding, and all six
  dashboard pages; hamburger sheet opens with all actions at ≥44px; bottom tab
  bar is one row of six, 56px targets, not covered by banners; competitors
  render as stacked cards.
- **Not verified here:** completing a Google sign-in needs the owner's Google
  account; Safari was unavailable in this environment, so cross-browser checks
  are Chrome-only. Both are called out for the owner.
- **Config note:** the owner's `.env` pinned `FREE_CORE_PROMPTS=8` and
  `FREE_TAIL_ENGINE=perplexity` from iteration 4, which would have silently
  kept the old 41-call plan. Updated to `9` / `FREE_TAIL_ENGINES=chatgpt,gemini`,
  and both the smoke and freshness tests now pin the plan so a local `.env`
  can never change what they assert.

## Iteration 7 — Post-launch defect fixes (2026-08-02)

- **#1 marquee invisible on desktop (root cause).** The Tailwind theme defines a
  COLOR named `base` (#FAFAFA), so `text-base` emits both a font-size and a
  text-colour utility and the colour wins. `sm:text-base` on the chips therefore
  set `color:#FAFAFA` on a white chip from the `sm` breakpoint up, overriding
  `text-ink` — readable on mobile, invisible on laptop/desktop. Measured
  `rgb(250,250,250)` on `rgb(255,255,255)` before, `rgb(23,23,23)` after, across
  all 48 duplicated chips. Replaced with `text-[1rem]`; a new client test fails
  the build if `text-base` reappears anywhere.
- **#1 hero / CTA.** Mobile hero `clamp(30px,6.2vw,84px)` → `clamp(38px,9.2vw,84px)`
  (38px at 375, still two lines, right edge 352/375). Sample-data badge removed
  from the rankings panel. On mobile the panel is now rotated -3deg and bleeds
  past the CTA card, clipped by the card's `overflow:hidden`; the bleed uses a
  negative margin rather than a transform offset so the document scroll width is
  unchanged (375/375, no page overflow).
- **#2 Sources tab removed** from nav, routes, mobile tab bar (6 → 5 columns),
  the `/api/brands/:id/sources` route, `useSources`, and both i18n bundles.
  `topSources` data continues to feed scoring, citations and research.
- **#3 Settings before the first audit.** `if (!brand) return <Skeleton/>` was an
  indefinite loading shell. Now renders the same `EmptyPanel` the other tabs use,
  verified on direct navigation to `/app/settings`: no skeleton, CTA present.
- **#4 post-audit redirect (root cause).** Iteration 6 called
  `refetchQueries({queryKey:["brands"], type:"active"})`, but the brands query is
  not mounted on the progress screen, so it was a no-op; the shell then read the
  pre-scan empty list from cache and bounced to onboarding. Replaced with
  `removeQueries` + `fetchQuery`, which bypasses the cache and RESOLVES before
  navigating, and the scanned business is preselected. Verified live: progress →
  `/app` with a populated dashboard, and a hard refresh stays there.
- **#5 form parity.** The first-audit form now collects website and alternative
  names alongside name/category/city/market/competitors, carried through the auth
  redirect in `synapai:pendingBusiness` and persisted on the brand; a rescan
  applies updated identity fields without clobbering detected data.
- **#6 identity resolution.** New `services/identity.ts` splits research output
  into "us" and "rivals" structurally, with no per-company exceptions: a
  candidate whose token sequence BEGINS with the business's full name is a
  sub-brand ("Kaspi" ⊃ "Kaspi Bank", "Kaspi Red", "Kaspi.kz"), anything else is a
  genuine competitor ("Halyk Bank", "Jusan Bank"); generic leading words cannot
  anchor a match ("Coffee" never swallows "Coffee House") and a competitor the
  owner typed is always respected. Research now also returns `subBrands`
  explicitly. 6 unit tests.
- **#7 audit allowance (root cause).** Two independent computations agreed
  numerically, so the 3-vs-2 mismatch was client caching (`useMe` had
  `staleTime: 30_000`), and "actually zero" was the per-IP gate, which no surface
  reported. New `services/allowance.ts` is the single source used by the session
  endpoint, the overview and the server gate; it reports the IP gate as
  `limitReason: "ip_limit"`. `useMe` is `staleTime: 0` and invalidated after
  every scan. 5 unit tests including an off-by-one sweep against the gate.
- **#8 limit wording.** "Today's free scans are used up. Try tomorrow." replaced
  in both locales with a permanent-limit message plus a book-a-call action; a
  separate message covers the network limit. No copy promises a daily reset.
- **#9 admin access.** `ADMIN_EMAIL` now accepts a comma-separated list and
  promotion happens on EVERY sign-in as well as at boot, so adding an address
  takes effect without a restart and an account created after boot is still
  recognised. Enforced entirely server-side from env; nothing client-settable.
- **#10 settings save (root cause).** Stage A research appends discovered
  competitors up to 12, but `brandSettingsSchema` caps the array at
  MAX_USER_COMPETITORS (5), so saving an enriched business returned 400 — and
  when it did succeed it replaced the whole array, silently deleting every
  detected competitor. Competitors now carry a `detected` flag, the DTO exposes
  `competitors` (editable, ≤5) and `detectedCompetitors` (read-only), and PATCH
  preserves detected entries.
- **#11 rescan (root cause, verified independently).** Same underlying data, a
  different code path: `useStartScan` resent every stored competitor name, so
  `scanRequestSchema.max(5)` rejected it with 400. It also dropped the website.
  Now sends only the owner's competitors plus the website.
- **#12 raw codes removed** from the auth UI; `authErrorKey` logs code and
  message to the console only under `import.meta.env.DEV`.
- **#13 Google sign-in.** Verified again against the live project: `localhost`
  authorized, provider enabled, valid OAuth URI, popup opens correctly. Fixed two
  real hazards found by inspection: `initializeApp` is now guarded with
  `getApps()`/`getApp()` (a duplicate init under Vite HMR throws
  `auth/duplicate-app` and breaks every subsequent sign-in), and persistence is
  set explicitly to `browserLocalPersistence`. Also confirmed the project has
  **Email Enumeration Protection enabled**, which is why a wrong password
  surfaces as `auth/invalid-credential`.
- **QA:** typecheck ✅ lint ✅ **113 tests** ✅ (was 92) i18n ✅ (305 keys)
  prerender ✅ smoke ✅. New: `firstAuditFlow.test.ts` (6 HTTP-level tests through
  the real endpoints), `brandCompetitors.test.ts`, `allowance.test.ts`,
  `identity.test.ts`, `tailwindTokens.test.ts`.
- **Not verified:** a real Google sign-in still requires the owner's Google
  account; Safari was unavailable in this environment.

## Iteration 8 — Synap brand migration and public discovery architecture (2026-08-02)

- Migrated the user-facing product name to **Synap** across UI, metadata,
  manifest, social image, email copy, logs and documentation. The former name
  remains only as structured-data `alternateName` for entity continuity;
  package scopes, database names, cookie/storage keys and configured email
  domains remain stable internal identifiers.
- Replaced the two-route SEO map with one authoritative registry covering 22
  indexable public paths plus noindex sign-in, each in Russian and English.
  Routing, prerendering, localized metadata, canonical/hreflang links,
  structured data, sitemap and automated checks consume the same registry.
- Added crawlable product, methodology, concept, use-case, about, contact,
  pricing, FAQ, documentation, guide, changelog, privacy and terms pages. Copy
  is derived from the actual prompt, extraction and scoring implementation and
  states model/provider and measurement limitations explicitly.
- Added Organization, WebSite, WebPage, AboutPage, ContactPage, Article,
  FAQPage, BreadcrumbList and SoftwareApplication/Product JSON-LD where each
  type matches visible page content. No ratings, reviews, customers, user
  counts or outcomes were invented.
- Public routes now return prerendered body content; private app bundles are
  lazy, Firebase auth is isolated from the public bundle, unknown public routes
  return 404, canonical-host/trailing-slash changes use 308, and app/login
  routes carry response-level noindex controls. `SITE_NOINDEX=true` protects
  standalone staging deployments.
- Added `robots.txt`, a 44-URL localized sitemap, `llms.txt`, maintained
  `llms-full.txt`, aggregate privacy-safe acquisition metrics, a public brand
  check and a deployed-style SEO audit. Customer scans, prompts, answers,
  reports, emails, billing data, APIs and admin routes remain private.
- Replaced unlabeled real-brand sample rankings with fictional, visibly labeled
  sample data. Corrected and linked the Gartner prediction on the landing page.
- **QA:** strict typecheck ✅ lint ✅ shared 36/36 ✅ client 24/24 ✅ server
  90/90 ✅ production build/prerender 46/46 ✅ deployed-style SEO audit 46/46
  ✅ desktop 1440px and mobile 375px browser checks with zero horizontal
  overflow ✅. The build still reports a 529 kB raw/169 kB gzip main public JS
  chunk; Firebase (35 kB gzip) and dashboard charts (115 kB gzip) are separate.

## Iteration 9 — Akrux rename and canonical origin (2026-08-16)

- Renamed the product and company from Synap to **Akrux** across every surface
  a user, crawler, AI retriever or structured-data consumer reads: page titles
  and descriptions, Open Graph and Twitter cards, `og:site_name`, image alt
  text, Organization/WebSite/Service/SoftwareApplication/WebPage/Breadcrumb/FAQ
  JSON-LD, `robots.txt`, the sitemap, `llms.txt`, `llms-full.txt`, the web
  manifest, all public page copy in RU and EN, email templates, `BRAND_NAME`,
  logo wordmark, nav/dashboard/auth `aria-label`s and console prefixes.
- Regenerated `og-image.png`: the wordmark was baked into the PNG. Geometry,
  typography, colours and layout are byte-for-byte the same recipe; only the
  five letters changed. The favicon/app icons carry no text and were untouched.
- Introduced `CANONICAL_SITE_URL = "https://akrux.app"` in `packages/shared`.
  A production frontend build now publishes that origin unconditionally and no
  longer falls back to `VERCEL_PROJECT_PRODUCTION_URL`, and the client-side
  metadata effect uses it instead of `window.location.origin`. A preview alias
  or a retired hostname can no longer advertise a second canonical identity.
- Renamed crawler-visible and DOM-visible markers: `akrux-seo` head sentinels,
  `#akrux-structured-data`, `data-akrux-managed`, `akrux-leads.csv`, and the
  internal `__akrux_path` proxy parameter (`vercel.json` + bridge together).
- `scripts/check-brand.mjs` now guards the retired `Synap`/`SynapAI` family and
  skips this log, which keeps dated entries historically accurate.
- **Deliberately unchanged** (state-bearing or externally coupled, invisible to
  users and crawlers): the `@synapai/*` workspace scope, the MongoDB database
  name, the `synapai-jobs` queue, the `synapai_session` cookie and the
  `synapai:*` / `synapai_locale` browser-storage keys. Renaming them would drop
  live data, sign every session out or break a deployment build command with no
  effect on the public entity. See `DEPLOYMENT.md` §6 for the dashboard-side
  items (domain, `MAIL_FROM`, `ADMIN_EMAIL`, Firebase `authDomain`).
- No layout, spacing, typography, colour, animation, component, imagery or
  responsiveness change: the diff touches identity strings, metadata and the
  one regenerated PNG only.
- **QA:** lint ✅ typecheck (shared/client/server) ✅ shared 61/61 ✅ client
  55/55 ✅ server 107/107 ✅ i18n sweep ✅ brand check ✅ icon check ✅
  production build + prerender of 42 localized routes ✅ deployed-style SEO
  audit 42/42 ✅.

### Logo assets (2026-08-16)

- Added the owner-supplied Akrux artwork as trimmed masters in
  `apps/client/src/assets/brand/`: `akrux-mark.png` (square symbol, 512x512)
  and `akrux-logo.png` (horizontal wordmark, 1612x305). Both are cropped to
  their ink on transparent backgrounds, so padding and size are decided in code
  instead of being baked into the files.
- `Logo.tsx` no longer draws the placeholder node/stroke SVG. The wordmark
  branch renders the horizontal logo as one image at `h-[1.4em] w-auto`, which
  keeps honoring the `text-lg`/`text-sm` class every caller already passed and
  lands within 3px of the previous lockup height. The icon-only branch renders
  the square symbol at `size`. Neither branch constrains both axes, so the
  aspect ratios stay exact (measured 5.285 rendered vs 5.2852 intrinsic).
- `icon-source.mjs` now owns the symbol master plus two builders: an SVG that
  keeps the white disc and transparent corners as vectors and embeds the
  symbol, and a matching rasterizer. `generate-icons.mjs` regenerated
  favicon.svg/.ico, 16/32/180/192/512px icons and the OG image, which now uses
  the real wordmark instead of drawn geometry and Helvetica text. It also
  merges into `site.webmanifest` rather than overwriting the curated copy.
- `check-icons.mjs` verifies the SVG and raster paths agree and that the symbol
  is centred without distortion, alongside the existing transparent-corner,
  white-disc and 12-88% padding assertions at every size down to 16px.
- **QA:** lint, typecheck, shared 61/61, client 55/55, server 107/107, i18n
  sweep, brand check, icon check, production build + prerender, SEO audit 42/42.
  Browser-verified at 1440px and 375px: navbar and footer show the wordmark,
  nav height stays 72px (the CTA, not the logo, drives the row), no horizontal
  overflow, and no asset request fails.

### Logo artwork refresh and rounded-square favicon (2026-08-18)

- Replaced both brand masters in place with the owner's newer artwork:
  `akrux-mark.png` (symbol, 512x512) and `akrux-logo.png` (wordmark,
  1737x453, aspect 3.8344 where the previous set was 5.2852). Same filenames,
  so nothing was orphaned and every reference kept resolving.
- The supplied symbol arrived as ink on an opaque near-white plate. It is
  re-keyed to ink-on-transparent using the two modes of its bimodal luminance
  histogram rather than min/max: outlier pixels had otherwise left solid ink at
  233/255 alpha, which rendered the symbol grey instead of white on the plate.
- Favicon container changed from a white circle to a **rounded square**:
  a flat `#0A0A0A` plate with `rx=5` of 24 and the symbol knocked out in white
  at 78% width. A dark plate makes the requested rounded corners actually
  visible, keeps the mark readable at 16px against light and dark browser
  chrome, and survives the opaque background iOS composites behind home-screen
  icons. Polarity and radius are single constants in `icon-source.mjs`.
- `markPng` now recolours the symbol by joining the master's alpha to a solid
  fill, so one master serves both the dark-on-light UI and the light-on-dark
  icons without a second asset.
- The OG image composition is derived from the artwork's height instead of
  hard-coded offsets, so a future logo with a different ratio stays centred.
- `check-icons.mjs` asserts a rounded-square plate and no circle, that the
  symbol is centred and aspect-preserving, and flips its coverage checks to the
  new polarity. Symbol detection uses a loose threshold because at 16px nearly
  every symbol pixel is antialiased against the plate.
- **QA:** lint, typecheck, shared 61/61, client 55/55, server 107/107, i18n
  sweep, brand check, icon check, production build + prerender, SEO audit
  42/42. Browser-verified at 1440px and 375px: rendered logo ratio 3.8344
  against 3.8344 intrinsic (no distortion), nav height still 72px with the CTA
  and not the logo driving the row, no horizontal overflow, no broken images
  among 65 on the page.
