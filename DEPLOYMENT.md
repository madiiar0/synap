# Synap deployment

Synap can run as two Vercel projects from this pnpm monorepo:

- `apps/client`: Vite frontend and same-origin `/api` proxy
- `apps/server`: Express API, MongoDB access and audit execution

The proxy is intentional. Browser code continues to request `/api/...`, so
the HTTP-only session cookie remains first-party on the frontend hostname.
Neither temporary nor final domains are hardcoded in the repository.

## 1. Create the backend project first

Import the repository into Vercel as a new project and select
`apps/server` as its Root Directory. Keep **Include source files outside of
the Root Directory** enabled because the server imports `packages/shared`.

Use Node.js 22. The Express entry is `src/index.ts`; `vercel.json` gives the
function a 300-second maximum duration. Vercel automatically sets `VERCEL=1`.
In that environment Synap uses `waitUntil()` for an audit started by the
request instead of assuming an always-running process.

Configure these backend variables for the environment being deployed:

```dotenv
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
APP_BASE_URL=https://your-backend.vercel.app
BRAND_NAME=Synap
JWT_SECRET=<at-least-32-random-bytes>
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/synapai?retryWrites=true&w=majority
AUTH_MODE=firebase
FIREBASE_SERVICE_ACCOUNT_JSON=<base64-service-account-json>
ADMIN_EMAIL=admin@synapai.app
ADMIN_PASSWORD=<at-least-12-random-characters>
DEMO_MODE=true
SITE_NOINDEX=true
```

For a safe first deployment, keep `DEMO_MODE=true`, leave
`PERPLEXITY_API_KEY` empty and use a persistent MongoDB Atlas database. A
production process refuses to start without reachable MongoDB, a public HTTPS
`APP_BASE_URL`, a non-default `JWT_SECRET`, and Firebase server credentials.

MongoDB Atlas must also allow connections from the backend deployment. For a
short controlled test, Atlas can temporarily allow `0.0.0.0/0` when the
database user has a strong unique password and least-privilege access. Replace
that broad rule with fixed egress IPs or a private networking option before
real customer use.

`REDIS_URL` is optional on a persistent Node host. The Vercel adapter does not
start a resident BullMQ worker; it uses `waitUntil()` because function instances
are not permanent. An audit must complete within the plan's function-duration
limit. For higher-volume or longer production audits, deploy `apps/server` on
a persistent Node service and configure Redis instead.

Verify the backend before connecting the frontend:

```text
https://your-backend.vercel.app/api/health
```

## 2. Configure the frontend project

Use the existing Vercel frontend project with `apps/client` as its Root
Directory. Keep source files outside the Root Directory enabled for
`packages/shared`.

Set the four `VITE_FIREBASE_*` values from the same Firebase project used by
the backend service account. Also set this server-only Vercel Function value:

```dotenv
BACKEND_URL=https://your-backend.vercel.app
```

Do not prefix `BACKEND_URL` with `VITE_`: it must not be embedded into the
browser bundle. Redeploy after changing any environment variable.

Verify the same-origin bridge:

```text
https://your-frontend.vercel.app/api/health
```

It must return the backend health JSON. `/api/config` can then confirm the
effective public runtime mode without exposing secrets.

## 3. Firebase

Enable Email/Password authentication and add the frontend hostname (without
`https://`) to Firebase Authentication's Authorized domains. The backend
`FIREBASE_SERVICE_ACCOUNT_JSON` must be a base64 encoding of a service-account
key from that same project.

## 4. First audit test

1. Open the frontend `/login` route.
2. Enter any valid email and the configured `ADMIN_PASSWORD`.
3. Confirm the session redirects to `/admin` and reports unlimited audits.
4. Start an audit while `DEMO_MODE=true`.
5. Confirm progress reaches `done` and the private report opens.

SMTP may remain empty for this controlled test, but no real report email will
arrive. Configure SMTP before inviting external users.

## 5. Moving to final domains

When the final domains are ready, update and redeploy:

1. Backend `CLIENT_URL` to the final frontend origin.
2. Backend `APP_BASE_URL` to the chosen canonical backend/public origin.
3. Frontend `BACKEND_URL` to the final backend origin.
4. Firebase Authorized domains with the final frontend hostname.
5. Set `SITE_NOINDEX=false` only for the canonical public production site.

Keep `JWT_SECRET`, MongoDB, Firebase, provider, SMTP and admin credentials
unchanged during a domain-only migration.
