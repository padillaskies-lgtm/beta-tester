# Beta Tester Application — Website

A static application form that emails submissions (via formsubmit.co, no
backend needed for that part) and tracks a running applicant count using
Upstash Redis (connected via Vercel's Marketplace integration).

## Project structure

```
.
├── index.html                  # the application page (was beta-tester.html)
├── api/
│   └── applicant-count.js      # serverless function -> /api/applicant-count
├── package.json
├── vercel.json
└── README.md
```

## 1. Push to GitHub

```bash
cd beta-tester
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 2. Import into Vercel

1. Go to https://vercel.com/new
2. Select your GitHub repo
3. Framework Preset: **Other**
4. Click **Deploy** (it will fail to count applicants until KV is connected — see below — but the page itself will still load and emails will still send)

## 3. Connect Upstash Redis (required for the applicant counter)

1. In your Vercel project: **Storage** tab → **Browse Marketplace** → **Upstash**
2. Create a Redis database and connect it to this project
3. Vercel adds env vars automatically — depending on when the integration
   ran, they'll be named either:
   - `KV_REST_API_URL` / `KV_REST_API_TOKEN`, or
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

   The function checks for both, so you don't need to rename anything.
4. Redeploy (Vercel → Deployments → ⋯ → Redeploy) so the function picks up the new env vars

Once connected, every form submission calls `POST /api/applicant-count`,
which atomically increments a counter in Redis and returns the new total —
that's the "You are applicant #N" number shown on success.

The function talks to Upstash directly over its REST API with plain
`fetch` (no SDK), so there's no dependency to install or version-match.

## 4. Email delivery (formsubmit.co)

The form submits directly to `https://formsubmit.co/padillaskies@gmail.com`
from the browser — no server code needed. **Important:** the first time
someone submits the form, formsubmit.co will send a confirmation email to
that address that must be clicked to activate delivery. Submit a test
application yourself first and confirm it, or you'll miss real applications
sent before activation.

If you'd rather send to a different address, just change the URL in
`index.html`:

```js
const emailRes = await fetch('https://formsubmit.co/your-email@example.com', {
```

## Local testing with Vercel CLI

```bash
npm i -g vercel
vercel dev
```

Note: the counter won't work locally unless you `vercel env pull` after
connecting Upstash in the dashboard, which writes a `.env.local` file the
Vercel CLI can read.
