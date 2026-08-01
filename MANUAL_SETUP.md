# MANUAL_SETUP — turning the demo into a live product

Written for a founder without a DevOps background. Do the steps in order;
each has **why it matters → steps → which .env variable → how to verify**.
Everything is optional except step 1 — the app runs in demo mode without any
of it, but a live product needs at minimum steps 1, 2, 4 and 6.

The product needs exactly four external credentials (§9 of the spec):
**Perplexity API key** (all AI engines), **Firebase** (auth), **MongoDB**
(data), **SMTP** (email). Nothing else.

---

## 1. Create your `.env` and secrets

**Why:** all keys and settings live in one file that is never committed.

- [ ] In the repo root: `cp .env.example .env`
- [ ] Generate a session secret: run `openssl rand -hex 32` in a terminal and
      paste the output into `JWT_SECRET=`
- [ ] Set `ADMIN_EMAIL=` to **your** email. This one address is auto-promoted
      to admin (role + unlimited scans) every time the server boots — no
      manual database step needed. It also receives lead and budget alerts.

**Verify:** `pnpm dev` still starts and the log doesn't complain about env.

---

## 2. Perplexity API key — the ONLY AI credential

**Why:** every engine (ChatGPT, Gemini, Perplexity, Claude, Grok) and the
extraction model are called through **Perplexity's Agent API** with this one
key. Without it a non-demo scan has no engines at all.

- [ ] Sign up at https://www.perplexity.ai/settings/api
- [ ] Add a payment method, click **Generate API key**
- [ ] Paste into `PERPLEXITY_API_KEY=`

Model ids and per-token rates live in `packages/shared/src/engines.ts`
(verified by live call on 2026-08-02, see `pnpm engines:check` below). If
Perplexity moves prices, update that one file. Web-search calls add a flat
$2.50 per 1000 requests on top of tokens.

**Cost expectations:** a free scan is 43 engine calls plus research, prompt
generation and batched extraction, measured at **$0.16**. The daily hard-stop
is `DAILY_LLM_BUDGET_USD`.

**Verify model ids before your first real scan:**

```bash
pnpm engines:check
```

It makes one tiny live call per model and prints status, latency and cost.
Anything other than `200` means the model id in
`packages/shared/src/engines.ts` needs updating; the provider's own error
message is printed underneath.

**Verify:** with `DEMO_MODE=false`, run one scan and watch Admin → Costs
show the per-scan cost; `pnpm cost:report` prints the same from the terminal.
A measured free scan costs about **$0.16** (43 engine calls + research +
prompt generation + batched extraction).

> **While `DEMO_MODE=true` the app shows an amber «Демо-режим» banner and every
> scan returns fixtures at zero cost.** Set `DEMO_MODE=false` in `.env` for
> real results. With demo off and no API key, scans now fail visibly rather
> than quietly returning fake data.

---

## 3. Booking a call — Calendly + WhatsApp

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

## 4. Sign-in — Firebase Auth (required: scanning needs an account)

**Why:** running a scan requires a signed-in, email-verified account — that
is how free-scan quotas (3 per account) are enforced. Without Firebase the
app runs a mock email-only sign-in (dev/demo only; production refuses to
start in mock mode).

> **See FIREBASE_SETUP.md for the click-by-click version of this step**
> (screenshots' worth of detail, verification flow, troubleshooting table).
> The checklist below is the short form.

- [ ] Create a project at https://console.firebase.google.com
- [ ] Build → Authentication → Sign-in method: enable **Email/Password** and
      **Google**
- [ ] Project settings → General → Your apps → add a **Web app**; copy the
      config into the client env (`apps/client/.env`):
      `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
      `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`
- [ ] Project settings → Service accounts → **Generate new private key**;
      encode it: `base64 -i serviceAccount.json | tr -d '\n'` and paste into
      `FIREBASE_SERVICE_ACCOUNT_JSON=` (server `.env`); set `AUTH_MODE=firebase`
- [ ] **Admin access** is automatic: the `ADMIN_EMAIL` account from step 1 is
      promoted on boot. Sign in with that email and open `/admin` (there is
      no admin link in the public UI).
- [ ] **Production domains:** Authentication → Settings → Authorized domains →
      add `yourdomain.com`, otherwise Google sign-in fails with
      `auth/unauthorized-domain`. The four `VITE_FIREBASE_*` values are baked
      into the bundle at build time, so they must be set when you run
      `pnpm build`.

**Verify:** sign up with a fresh email → the app asks you to verify the
email before scanning; verify, run a scan, and confirm the header shows
«Осталось проверок: 2». Then sign in as `ADMIN_EMAIL` and confirm `/admin`
opens with Users / Costs tabs.

---

## 5. Email (SMTP)

**Why:** scan-ready notifications, lead alerts and budget alerts. (The
email-verification message itself is sent by Firebase, not SMTP.) Without
SMTP the app never crashes — emails land in `apps/server/.mail-outbox/` as
HTML files (good for testing, useless for customers).

Concrete walkthrough with **Brevo** (free tier is enough to start):

- [ ] Sign up at https://www.brevo.com → SMTP & API → SMTP
- [ ] Copy the values into `.env`:
      `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`,
      `SMTP_USER=<your login>`, `SMTP_PASS=<your SMTP key>`
- [ ] Set `MAIL_FROM="SynapAI <no-reply@yourdomain.com>"` and verify that
      sender/domain inside Brevo (SPF/DKIM records they show you).

(Any other SMTP provider — Resend, Postmark, Mailgun — works the same way.)

**Verify:** finish a scan and receive the "your report is ready" email.

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

**Verify:** run `pnpm db:check`. It prints the server version, the database
name and the collection count, or the exact error with a fix. Then restart the
server: the log must say `mongo connected` (not "in-memory").

### Troubleshooting a connection failure

If the server logs `mongo connection FAILED` and falls back to the in-memory
database, **your data is not being saved** (the app shows an amber
«Локальная база в памяти» banner while this is true). Run `pnpm db:check` and
match the error:

- **`MongooseServerSelectionError` / "IP that isn't whitelisted"** — the most
  common cause by far. Atlas only accepts connections from allowlisted
  addresses. Open Atlas → **Network Access** → **Add IP Address** → **Add
  Current IP Address** → Confirm. Home and mobile connections change IP
  regularly, so this can start failing again later; re-add the new address.
  (For a deployed server, allowlist the server's fixed IP instead.)
- **"Authentication failed" / "bad auth"** — the user or password in
  `MONGODB_URI` is wrong (Atlas → Database Access). If the password contains
  any of `@ : / ? # %`, it must be percent-encoded in the URI: `@`→`%40`,
  `:`→`%3A`, `/`→`%2F`, `#`→`%23`, `?`→`%3F`, `%`→`%25`. Or simply reset the
  password to letters and digits only.
- **No database name in the URI** — a string ending in `.mongodb.net/?...`
  writes to the default `test` database. Put the name before the query
  string: `...mongodb.net/synapai?appName=SynapAI`. `pnpm db:check` warns
  about this even when the connection succeeds.

In production the server **refuses to start** rather than falling back, so a
broken database can never masquerade as an empty dashboard.

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

- [ ] `DEMO_MODE=false` and `AUTH_MODE=firebase` in `.env`, restart
- [ ] Sign up with a fresh (non-admin) email, verify it, run one real **free**
      scan of your own business
- [ ] Check Admin → Costs: the scan cost appeared (should be ≤ $0.35);
      `pnpm cost:report` agrees
- [ ] Admin → Usage: budget bar is sane; the daily hard-stop is
      `DAILY_LLM_BUDGET_USD` (default $10 — scans pause and you get an email
      at the cap; **Resume** button unpauses for the day)
- [ ] Check the "report is ready" email arrived and its link opens the
      dashboard after sign-in
- [ ] Spend the remaining free scans; the 4th attempt must show the
      end-of-trial modal (book-a-call, no prices)
- [ ] Book-a-call: submit a test lead, confirm the notification email

---

## 9. Where leads land

- Admin → **Leads** (`/admin`): every book-a-call click/submission,
  filterable by type.
- **CSV export** button in the same screen (`/api/admin/leads.csv`).
- Each substantive lead also emails `ADMIN_EMAIL` immediately.

Admin sign-in: `/login` with the `ADMIN_EMAIL` account (auto-promoted on
boot), then open `/admin`.
