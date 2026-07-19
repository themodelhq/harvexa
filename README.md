# Harvexa — Universal Web Scraper PWA

Point it at a URL, a search query, a listing page, or a name to look up on
LinkedIn — Harvexa scrapes it and lets you export the results to Excel, CSV,
or JSON. Free and paid tiers, user accounts, and a installable PWA frontend.

This is a ground-up rebuild of the original Streamlit "Universal Product
Scraper" tool: the Jumia-specific **BOB** and **Vendor Center** template
export logic has been removed, the scraping engine has been generalized to
work against *any* site (not just e-commerce), and it now ships as a proper
two-part web app instead of a local Streamlit script.

## Architecture

```
harvexa/
├── backend/     Node.js + Express API, PostgreSQL, JWT auth, scrapers  -> deploy to Render
└── frontend/    React + Vite PWA, Tailwind UI                         -> deploy to Netlify
```

- **Auth**: email/password, JWT, bcrypt password hashing.
- **Tiers**: Free / Pro / Business, defined in `backend/config/tiers.js` —
  edit that one file to change limits, pricing, or which scraper modes each
  tier unlocks.
- **Scrapers**:
  - `url` — scrape any single page or batch of pages (title, price,
    description, image, metadata).
  - `search` — scrape search-engine results for a query.
  - `category` — point at a listing/category page; it discovers every
    on-site link and scrapes each one.
  - `linkedin` — **not** a login-wall bypass. It surfaces the same publicly
    indexed profile/company snippets you'd see on a search engine results
    page (name, headline, public URL). For full profile data, use LinkedIn's
    own export tools or official API.
- **Export**: every scrape is saved as a "job" and can be downloaded as
  `.xlsx`, `.csv`, or `.json` at any time from Job History.
- **Billing**: ships in demo mode (plan switches instantly, no card needed)
  so the whole product is testable end-to-end. `backend/routes/billing.js`
  has a Stripe/Paystack-ready stub — set `STRIPE_SECRET_KEY` or
  `PAYSTACK_SECRET_KEY` and wire in a real Checkout call to go live.

## Local development

### 1. Database
Easiest: create a free PostgreSQL instance on [Render](https://render.com)
(New → PostgreSQL) and copy its connection string. Or run Postgres locally.

### 2. Backend
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev                # http://localhost:4000
```
The schema (users, scrape_jobs tables) is created automatically on first
boot — no separate migration step.

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173, register an account, and start scraping.

## Deploying

### Backend → Render
1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, point at the repo, and it will read
   `backend/render.yaml`, which provisions a free PostgreSQL database and a
   free web service together, wiring `DATABASE_URL` automatically.
3. Once deployed, copy the service URL (e.g. `https://harvexa-api.onrender.com`).
4. Update `CORS_ORIGIN` in the Render dashboard env vars to your Netlify URL
   once you have it (step below), then redeploy.

If you'd rather set it up manually instead of via the blueprint: create a
PostgreSQL instance and a Web Service (root directory `backend`, build
command `npm install`, start command `npm start`), then set the env vars
from `backend/.env.example`.

### Frontend → Netlify
1. In Netlify: **Add new site → Import from Git**, point at this repo, set
   **base directory** to `frontend`.
2. Build command `npm run build`, publish directory `frontend/dist`
   (already configured in `frontend/netlify.toml`).
3. Add an environment variable `VITE_API_URL` = your Render backend URL.
4. Deploy. Netlify gives you a URL like `https://harvexa.netlify.app` — put
   that into the backend's `CORS_ORIGIN` env var on Render and redeploy the
   backend so the browser is allowed to call it.

The frontend is a full PWA — visitors on desktop or mobile can "Install"
it from the browser's address bar / share menu for an app-like experience.

## Rebranding further
Search-and-replace "Harvexa" across `frontend/index.html`,
`frontend/vite.config.js` (PWA manifest block), and `frontend/src/components/Navbar.jsx`
if you want a different name — every other file is name-agnostic.

## Responsible scraping
Harvexa is a general-purpose tool. Respect the target site's `robots.txt`
and terms of service, don't scrape personal data at scale without a lawful
basis, and don't use the LinkedIn discovery mode to try to reconstruct
gated profile data — it intentionally only surfaces what's already public.
