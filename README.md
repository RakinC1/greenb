# 🌉 GreenBridge — Food Rescue Platform

AI-powered surplus food redistribution connecting restaurants with shelters. Built with Next.js 14, Supabase, Mapbox, and Gemini AI.

---

## Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | Next.js 14 (App Router) |
| Database   | Supabase (PostgreSQL)   |
| Storage    | Supabase Storage        |
| Maps       | Mapbox GL JS            |
| AI         | Google Gemini 1.5 Flash |
| Hosting    | Vercel via GitHub Actions |
| Auth       | Supabase Auth           |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourname/greenbridge.git
cd greenbridge
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Fill in your keys (see below)
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → Run
3. Go to **Storage** → create a public bucket named `food-photos`
4. Copy your project URL and anon key into `.env.local`

### 4. Get API keys

| Service | Where to get it |
|---------|----------------|
| Supabase URL + Keys | Supabase Dashboard → Settings → API |
| Mapbox Token | [mapbox.com](https://account.mapbox.com) → Tokens |
| Gemini API Key | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| Vercel Token | [vercel.com](https://vercel.com/account/tokens) → Create Token |

### 5. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

---

## GitHub Actions CI/CD

Three workflows are included:

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `test.yml` | Every push | TypeScript check + lint + build verify |
| `preview.yml` | Pull Requests | Deploy preview + post URL to PR |
| `deploy.yml` | Push to `main` | Deploy to Vercel production |

### Set up GitHub Secrets

Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_MAPBOX_TOKEN
GEMINI_API_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_APP_URL
```

To get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`:
```bash
npm i -g vercel
vercel link   # follow prompts
cat .vercel/project.json
```

---

## Project Structure

```
greenbridge/
├── .github/workflows/     # CI/CD pipelines
├── app/
│   ├── (auth)/            # Login + Register pages
│   ├── api/               # API route handlers
│   ├── dashboard/         # Main dashboard
│   ├── listings/          # Browse + detail pages
│   ├── upload/            # Restaurant: post surplus
│   ├── claims/            # Shelter: manage claims
│   ├── predictions/       # AI forecast page
│   └── impact/            # Environmental stats
├── components/
│   ├── AI/                # Gemini prediction widget
│   ├── Dashboard/         # Stats grid, activity feed
│   ├── FoodCard/          # Reusable food listing card
│   ├── Layout/            # Sidebar, topbar, app shell
│   ├── Map/               # Mapbox component
│   └── UI/                # Buttons, inputs, badges, toasts
├── hooks/                 # useAuth, useListings, useClaims
├── lib/                   # supabase, gemini, impact, mapbox
├── supabase/schema.sql    # Full DB schema + RLS policies
└── types/index.ts         # Shared TypeScript types
```

---

## Features

- **Restaurant role**: upload surplus food with Gemini Vision auto-fill, manage listings, view AI waste predictions and environmental impact
- **Shelter role**: browse real-time available food with map view, claim listings, track pickups
- **AI predictions**: Gemini 1.5 Flash analyzes 30-day history to forecast tomorrow's surplus with risk levels and confidence scores
- **Gemini Vision**: photograph food → AI auto-identifies name, category, and dietary tags
- **Mapbox**: interactive map with waste heatmap showing surplus density across the city
- **Real-time**: Supabase subscriptions push new listings to all connected shelters instantly
- **Impact tracking**: CO₂, water, and meal equivalences calculated from lifecycle assessment data

---

## Cost at Scale

| Service | Free Tier | ~1k users/mo |
|---------|-----------|-------------|
| Vercel | 100GB bandwidth | ~$20/mo |
| Supabase | 500MB DB | ~$25/mo |
| Mapbox | 50k map loads | ~$0–10/mo |
| Gemini 1.5 Flash | **1M tokens/day free** | ~$0–5/mo |
| GitHub Actions | 2,000 min/mo | $0 |
| **Total** | **$0** | **~$45–60/mo** |
# greenb
