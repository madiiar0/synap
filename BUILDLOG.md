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
