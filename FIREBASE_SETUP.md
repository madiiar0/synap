# Firebase setup — step by step

Everything you do by hand, in order. Roughly 15 minutes. Nothing here needs a
terminal except steps 5 and 7.

Why it is needed: running a scan requires a signed-in account whose email is
verified. That is how the 3-free-scans-per-account limit is enforced. Until
Firebase is configured the app runs `AUTH_MODE=mock` (type any email, no
password) which is fine for local demos and refused in production.

---

## 1. Create the Firebase project

1. Open https://console.firebase.google.com and click **Create a project**
   (or **Add project**).
2. Name it `synapai` (any name works; it only shows in the console).
3. Google Analytics: **turn it off**. You do not need it and it adds steps.
4. Click **Create project**, wait, then **Continue**.

## 2. Turn on the two sign-in methods

1. Left sidebar: **Build → Authentication** → **Get started**.
2. Tab **Sign-in method**.
3. Click **Email/Password** → toggle **Enable** (the first toggle only, leave
   "Email link / passwordless" off) → **Save**.
4. Click **Add new provider → Google** → toggle **Enable** → pick a
   **Project support email** from the dropdown → **Save**.

## 3. Register the web app and copy the 4 client values

1. Click the gear icon (top left) → **Project settings** → tab **General**.
2. Scroll to **Your apps** → click the **web** icon `</>`.
3. App nickname: `synapai-web`. Do **not** tick "Firebase Hosting". →
   **Register app**.
4. Firebase shows a `firebaseConfig` snippet. Keep this tab open; you need
   four values from it:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",              // -> VITE_FIREBASE_API_KEY
     authDomain: "synapai.firebaseapp.com",  // -> VITE_FIREBASE_AUTH_DOMAIN
     projectId: "synapai-xxxxx",       // -> VITE_FIREBASE_PROJECT_ID
     storageBucket: "...",             // not needed
     messagingSenderId: "...",         // not needed
     appId: "1:123...:web:abc...",     // -> VITE_FIREBASE_APP_ID
   };
   ```

   These four are **public by design** (they ship in the browser bundle).
   They are not secrets.

## 4. Put those 4 values in the client env

Open (or create) **`apps/client/.env`** and write:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=synapai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=synapai-xxxxx
VITE_FIREBASE_APP_ID=1:123...:web:abc...
```

No quotes, no spaces around `=`. Vite only reads variables that start with
`VITE_`, and only at startup, so you must restart `pnpm dev` afterwards.

## 5. Download the service account key (this one IS secret)

1. **Project settings** → tab **Service accounts**.
2. Click **Generate new private key** → **Generate key**. A `.json` file
   downloads.
3. In a terminal, turn it into one line of base64:

   ```bash
   base64 -i ~/Downloads/synapai-xxxxx-firebase-adminsdk-xxxxx.json | tr -d '\n' | pbcopy
   ```

   (`pbcopy` puts it on your clipboard. Drag the downloaded file into the
   terminal after `-i ` to get its exact path without typing it.)

4. **Delete the downloaded .json** afterwards. Anyone holding it can sign in
   as any user of your project.

## 6. Put the server values in the root `.env`

Open the repo root **`.env`** and set these three lines:

```
AUTH_MODE=firebase
FIREBASE_SERVICE_ACCOUNT_JSON=<paste the base64 blob from step 5>
ADMIN_EMAIL=your.real@email.com
```

Notes:

- `ADMIN_EMAIL` is currently `admin@synapai.app`. **Change it to the email you
  will actually sign in with.** That account is promoted to admin with
  unlimited scans automatically every time the server boots, and it skips the
  email-verification gate. It also receives lead and budget alerts.
- Leave `GOOGLE_APPLICATION_CREDENTIALS=` empty. It is the alternative to the
  base64 blob, not an addition to it.
- Vercel also accepts the complete raw service-account JSON as this value. Do
  not paste a filename or only the private key; the full downloaded JSON object
  is required.
- The root `.env` is gitignored. Never commit it.

## 7. Restart and verify

```bash
# stop the running dev servers first (Ctrl+C), then:
pnpm dev
```

Check the login page at http://localhost:5173/login. You should now see the
**Continue with Google** button and a **password** field. If you still see
"Demo mode: enter an email, no password required", the server is still in
mock mode: check `AUTH_MODE=firebase` and that you restarted.

Then verify each path:

1. **Google sign-in** → click Continue with Google, pick your account. You
   land on the dashboard and can scan immediately (Google accounts arrive
   already verified).
2. **Email sign-up** → switch to "Create an account", use a real inbox, pick a
   password of 6+ characters. Firebase emails you a confirmation link
   automatically. Start a scan **before** clicking it: the app opens a
   "Verify your email" dialog with **Resend** and **I verified it, continue**.
   Click the link in the inbox, come back, press **I verified it, continue**,
   and the scan runs.
3. **Admin** → sign in with the `ADMIN_EMAIL` account and open
   http://localhost:5173/admin. The Users and Costs tabs must load. There is
   deliberately no admin link in the public UI.

---

## Make the verification email Russian and branded

Firebase sends the confirmation email, not your SMTP provider, so the wording
is configured in the Firebase Console:

1. **Authentication → Templates → Email address verification**.
2. Click the pencil icon. Set **Sender name** to `Synap` (the reply-to
   address can stay the default).
3. Change the template language with the dropdown at the top right of the
   template list: pick **Russian** so Russian-speaking customers get a Russian
   email. Firebase picks the language per user from `auth.languageCode`, and
   falls back to this default.
4. Edit **Subject** and **Message** if you want your own wording. Keep the
   `%LINK%` placeholder exactly as it is: that is the confirmation link.
5. If you use a custom domain for the action link, set it under **Action URL**
   (optional; the default `<project>.firebaseapp.com` works fine).

**Verify:** sign up with a real inbox and confirm the email arrives with your
sender name and the expected language.

## If Google sign-in does not work

Work through these in order:

- **Provider enabled?** Authentication → Sign-in method → Google must be
  **Enabled** with a support email set (step 2 above).
- **Domain authorized?** Authentication → Settings → **Authorized domains**
  must list the domain you are browsing from. `localhost` is there by default;
  add your production domain before launch. The symptom is the localized error
  "This domain is not authorized for sign-in".
- **Popup blocked?** The app automatically falls back to a full-page redirect
  and completes the sign-in on return, so this should self-heal. If it does
  not, allow popups for the site.
- **Content Security Policy.** The server sends a CSP that explicitly allows
  the Firebase auth origins (`*.firebaseapp.com`, `*.googleapis.com`,
  `accounts.google.com`) in `frame-src`, `connect-src`, `script-src` and
  `form-action`. If you put a proxy or CDN in front that rewrites CSP headers,
  it must preserve those entries or the popup will fail silently. Check the
  browser console for a `Refused to frame ...` message.
- **Same account, different method.** Signing up with a password and later
  using Google on the same address raises
  "This email is already linked to another sign-in method". Use the original
  method, or link them in the Firebase Console.

## Checking Google sign-in without guesswork

Every Firebase failure now appears on the sign-in page with its raw code
underneath the message, and is logged to the browser console as
`[Synap auth] <code>: <message>`. If Google sign-in misbehaves, open the
console, read the code, and match it here:

| Code | Meaning and fix |
| --- | --- |
| `auth/unauthorized-domain` | The domain you are browsing from is not in Authentication → Settings → Authorized domains. Add it. |
| `auth/operation-not-allowed` | The Google provider is disabled. Enable it in Sign-in method. |
| `auth/popup-blocked` | The browser blocked the popup; the app falls back to a redirect automatically. Allow popups for a smoother flow. |
| `auth/popup-closed-by-user` | The account chooser was closed before finishing. Not an error. |
| `auth/account-exists-with-different-credential` | That email already signed up with a password. Use the original method. |
| *(no code, nothing happens)* | The popup is open and waiting for you to pick an account. Look for a second browser window. |

You can confirm the project side from a terminal without touching the app:

```bash
# 1. Which domains may host sign-in?
curl -s "https://identitytoolkit.googleapis.com/v1/projects?key=YOUR_VITE_FIREBASE_API_KEY"

# 2. Is the Google provider actually enabled? (a valid authUri means yes)
curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=YOUR_VITE_FIREBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"providerId":"google.com","continueUri":"http://localhost:5173"}'
```

## Going to production later

When you deploy to a real domain, add it to Firebase or Google sign-in will
fail with `auth/unauthorized-domain`:

**Authentication → Settings → Authorized domains → Add domain** →
`yourdomain.com`. `localhost` is already whitelisted for local work.

Set the same `AUTH_MODE=firebase` and `FIREBASE_SERVICE_ACCOUNT_JSON` on the
server, and the four `VITE_FIREBASE_*` values in the build environment (they
are baked into the bundle at build time, so they must be present when you run
`pnpm build`, not just at runtime).

The server refuses to start with `AUTH_MODE=mock` when `NODE_ENV=production`,
so a misconfigured deploy fails loudly instead of silently accepting
password-less sign-ins.

---

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Login page still shows the demo hint | `AUTH_MODE` is not `firebase`, or the server was not restarted |
| Google button does nothing / popup closes | Popup blocked. The app falls back to a redirect; allow popups for a smoother flow |
| `auth/unauthorized-domain` | Add the domain under Authentication → Settings → Authorized domains |
| `auth/api-key-not-valid` | A `VITE_FIREBASE_*` value is wrong or the client was not restarted |
| Server log: `Failed to parse private key` | The base64 blob is truncated. Redo step 5, make sure `tr -d '\n'` is in the command |
| Scan returns 403 and the verify dialog keeps appearing | The link was not clicked yet, or it went to spam. Use **Resend**, then **I verified it, continue** |
| No verification email at all | Firebase free tier sends these itself; check spam. Your SMTP settings are unrelated to this email |
