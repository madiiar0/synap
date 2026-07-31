# MANUAL_SETUP — turning the demo into a live product

Written for a founder without a DevOps background. Do the steps in order;
each has **why it matters → steps → which .env variable → how to verify**.
Everything is optional except step 1 — the app runs in demo mode without any
of it, but a live product needs at minimum steps 1, 2 (Perplexity) and 7.

---

## 1. Create your `.env` and secrets

**Why:** all keys and settings live in one file that is never committed.

- [ ] In the repo root: `cp .env.example .env`
- [ ] Generate a session secret: run `openssl rand -hex 32` in a terminal and
      paste the output into `JWT_SECRET=`
- [ ] Set `ADMIN_EMAIL=` to the inbox that should receive lead and budget
      alerts.

**Verify:** `pnpm dev` still starts and the log doesn't complain about env.

---

## 2. Perplexity API key (first priority — the core engine)

**Why:** Perplexity powers the free tier; without it a non-demo scan has no
engine at all.

- [ ] Sign up at https://www.perplexity.ai/settings/api
- [ ] Add a payment method, click **Generate API key**
- [ ] Paste into `PERPLEXITY_API_KEY=`

Model is `PERPLEXITY_MODEL=sonar` (cheap tier). Check current pricing at
https://docs.perplexity.ai/guides/pricing and update the estimates in
`packages/shared/src/constants.ts` (`COST_PER_MTOK`) if they moved.

**Verify:** with `DEMO_MODE=false`, run one scan from the landing and watch
Admin → Usage show a small cost for `perplexity`.

---

## 3. Optional engines — OpenAI / Google AI Studio / Anthropic

**Why:** the FULL tier fans out across 4 engines; any subset works — a
missing key simply switches that engine off (dash in the UI).

- [ ] **OpenAI**: https://platform.openai.com/api-keys → `OPENAI_API_KEY=`.
      Uses the Responses API with the web-search tool; verify the model name
      in `OPENAI_MODEL` is still the current cheap tier.
- [ ] **Google**: https://aistudio.google.com/apikey → `GEMINI_API_KEY=`.
      Search grounding is enabled automatically.
- [ ] **Anthropic**: https://console.anthropic.com/settings/keys →
      `ANTHROPIC_API_KEY=`. Verify the model id in `ANTHROPIC_MODEL` at
      https://docs.claude.com/en/docs/about-claude/models
- [ ] **DeepSeek**: https://platform.deepseek.com/api_keys →
      `DEEPSEEK_API_KEY=` (model `deepseek-chat`).
- [ ] **xAI (Grok)**: https://console.x.ai → `XAI_API_KEY=`. Live Search is
      requested automatically (`mode: auto`) and billed per source — check
      https://docs.x.ai for current pricing and the `GROK_MODEL` id.
- [ ] Pick your extraction provider (the cheap model that parses answers):
      `EXTRACTION_PROVIDER=perplexity` is a fine default.

**Verify:** Admin → Engines shows the key present; trigger a FULL scan from
Admin → Scans and see all enabled engines report results.

---

## 4. Booking a call — Calendly + WhatsApp

**Why:** "Book a call" is the product's only conversion. With no Calendly URL
the button falls back to a lead form (works fine, but a calendar converts
better).

- [ ] Create an event type at https://calendly.com (20-minute call)
- [ ] Copy the event link (e.g. `https://calendly.com/you/20min`) into
      `CALENDLY_URL=`
- [ ] Put your WhatsApp link (`https://wa.me/7700…`) into `WHATSAPP_URL=`

**Verify:** click «Записаться на созвон» on the landing — the modal should
embed your calendar; every open is also logged in Admin → Leads.

---

## 5. Email (SMTP)

**Why:** magic-link sign-in and report emails. Without SMTP the app never
crashes — emails land in `apps/server/.mail-outbox/` as HTML files (good for
testing, useless for customers).

Concrete walkthrough with **Brevo** (free tier is enough to start):

- [ ] Sign up at https://www.brevo.com → SMTP & API → SMTP
- [ ] Copy the values into `.env`:
      `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`,
      `SMTP_USER=<your login>`, `SMTP_PASS=<your SMTP key>`
- [ ] Set `MAIL_FROM="SynapAI <no-reply@yourdomain.com>"` and verify that
      sender/domain inside Brevo (SPF/DKIM records they show you).

(Any other SMTP provider — Resend, Postmark, Mailgun — works the same way.)

**Verify:** request a sign-in link from `/login` and receive a real email.

---

## 6. Databases — MongoDB Atlas (+ optional Redis)

**Why:** the built-in in-memory MongoDB loses everything on restart. A real
database is required for production.

- [ ] Create a free cluster at https://www.mongodb.com/cloud/atlas
- [ ] Database Access → create a user; Network Access → allow your server IP
- [ ] Copy the connection string into
      `MONGODB_URI=mongodb+srv://user:pass@cluster…/synapai`
- [ ] (Optional) Redis makes the job queue survive restarts:
      https://upstash.com → create Redis → paste into `REDIS_URL=`.
      Leaving it empty is fine — the inline queue works and a sweeper
      re-runs scans stuck by a crash.

**Verify:** restart the server; the log says `mongo connected` (not
"in-memory"). Run `pnpm seed` once to create the admin user — the password is
printed in the terminal (it regenerates on every seed run).

---

## 7. Deploy

**Why:** customers need a URL. Two proven paths — pick one.

### Path A — a VPS with Docker (Hetzner/DO, ~$6/mo)

- [ ] Install Docker + Docker Compose on the server
- [ ] `git clone` the repo, copy your `.env` up
- [ ] `docker compose up -d` starts Mongo + Redis;
      set `MONGODB_URI=mongodb://localhost:27017/synapai` and
      `REDIS_URL=redis://localhost:6379`
- [ ] Build the client and start the server:
      `pnpm install && pnpm --filter @synapai/client build && pnpm --filter @synapai/server start`
      (keep it alive with `pm2` or a systemd unit). The server serves the
      built client itself — one port for everything.
- [ ] Put a reverse proxy with HTTPS in front (Caddy is the easiest:
      https://caddyserver.com — two lines of config).

### Path B — a PaaS (Railway / Render)

- [ ] Create a service from the repo; build command
      `pnpm install && pnpm --filter @synapai/client build`, start command
      `pnpm --filter @synapai/server start`
- [ ] Add all `.env` values in the dashboard; use Atlas from step 6.

For both paths set:

- [ ] `NODE_ENV=production`
- [ ] `APP_BASE_URL=https://yourdomain.com` and
      `CLIENT_URL=https://yourdomain.com` (single-origin setup)
- [ ] Point your domain's DNS at the server; confirm HTTPS works.

**Verify:** open `https://yourdomain.com/api/health` → `{"ok":true,…}`.

---

## 8. Go-live checklist

- [ ] `DEMO_MODE=false` in `.env`, restart
- [ ] Run one real **free** scan from the landing (your own brand)
- [ ] Check Admin → Usage: cost appeared, budget bar is sane; the daily
      hard-stop is `DAILY_LLM_BUDGET_USD` (default $10 — scans pause and you
      get an email at the cap; **Resume** button unpauses for the day)
- [ ] Check the report email arrived and the magic link signs you in
- [ ] Book-a-call: submit a test lead, confirm the notification email

---

## 9. Where leads land

- Admin → **Leads** (`/admin`): every unlock email and every book-a-call
  click/submission, filterable by type.
- **CSV export** button in the same screen (`/api/admin/leads.csv`).
- Each substantive lead also emails `ADMIN_EMAIL` immediately.

Admin sign-in: `/login` → «Вход администратора» with the seeded credentials
(printed by `pnpm seed`; the password regenerates on every seed run).
