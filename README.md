# Delta Collation — Election Results Management & Analysis Platform

A full-stack election results platform built on the real **Bincom election database**
(`bincomphptest`, originally a MySQL/phpMyAdmin dump). It has been migrated to
PostgreSQL (Neon), with a Node.js/Express/Prisma API and a Next.js/TypeScript/Tailwind
frontend.

## What's in the source data

The original dump defines 10 tables, but only 3 hold real election data:

| Table | Rows | Notes |
|---|---|---|
| `states` | 37 | Reference data (all Nigerian states) |
| `lga` | 25 | LGAs — all under Delta State in this dataset |
| `ward` | 263 | Wards |
| `polling_unit` | 272 (102 valid + 170 blank placeholders, skipped at seed time — see below) | Polling units |
| `party` | 9 | Political parties (PDP, ACN, DPP, etc.) |
| `agentname` | 4 | Collation agents |
| `announced_pu_results` | 150 | **Real vote tallies** at polling-unit level |
| `announced_lga_results` | 225 | **Real vote tallies** at LGA level |
| `announced_state_results` | 0 | Empty in the source dump |
| `announced_ward_results` | 0 | Empty in the source dump |

No records were invented. Every polling-unit and LGA result shown in the app comes
directly from `announced_pu_results` / `announced_lga_results` in the original dump.

### Data quality issues found in the source dump

Postgres enforces foreign keys strictly; the original MySQL dump (MyISAM tables)
never did, which let two data issues hide in the dump until migration surfaced them:

1. **170 of the 272 `polling_unit` rows are blank placeholders** — `lga_id`,
   `ward_id`, and `polling_unit_id` are all `0`, with no name and only lat/long
   populated. `lga_id 0` was never defined in the `lga` table. Confirmed these have
   zero linked results or agents, so `prisma/seed.ts` **skips** them rather than
   inventing a placeholder LGA. Real, usable polling units seeded: **102**.
2. **All 4 `agentname` rows reference a `pollingunit_uniqueid` (1 or 2) that doesn't
   exist anywhere in `polling_unit`** (the table starts at id 8). Rather than drop
   these agents, `AgentName.pollingUnitUniqueId` is nullable — the seed script links
   them to `NULL` instead of a fabricated polling unit, and the UI shows "Unassigned".

Both decisions are documented as comments directly above the affected models in
`backend/prisma/schema.prisma` and in the seed script.

### Key migration decision (read this before touching the schema)

`announced_lga_results.lga_name` is a misleading column name — it actually stores
the LGA's numeric `lga_id` (e.g. `'33'` = Warri North), not a name. This was confirmed
by cross-referencing the dump's data, not assumed, and is modelled correctly as a
foreign key (`AnnouncedLgaResult.lgaId -> Lga.lgaId`) in `backend/prisma/schema.prisma`.

Full migration notes (AUTO_INCREMENT → identity columns, engine/charset directives
dropped, FK design for `lga_id`/`ward_id`/`uniquewardid`, etc.) are documented as
comments at the top of `backend/prisma/schema.prisma` and in
`database/postgres-migration.sql`.

## Architecture

```
Vercel (Next.js frontend)
        │  HTTPS (NEXT_PUBLIC_API_URL)
        ▼
Render (Express + TypeScript REST API)
        │  Prisma Client
        ▼
Neon (PostgreSQL)
```

## Project structure

```
election-platform/
├── frontend/           Next.js 14 App Router + TypeScript + Tailwind
│   ├── app/             Pages: dashboard, results, polling-units, lgas, parties, agents, analytics, search
│   ├── components/      Shared UI (header/nav, tally sheet, stat cards, charts, states)
│   ├── lib/              API client, party color mapping
│   └── types/            Shared TypeScript interfaces
├── backend/             Express + TypeScript REST API
│   ├── src/
│   │   ├── controllers/  Route handlers (one per resource)
│   │   ├── routes/       Express routers
│   │   ├── middleware/   Error handling, rate limiting
│   │   ├── validators/   Zod schemas
│   │   ├── config/       Env + Prisma client singleton
│   │   └── __tests__/    Jest + Supertest tests
│   └── prisma/
│       ├── schema.prisma     Data model (with migration notes)
│       ├── seed.ts            Imports the real dump data
│       └── source-data.json   The dump, parsed losslessly into JSON
├── database/
│   ├── original.sql            The supplied MySQL dump, unmodified
│   └── postgres-migration.sql  Readable PostgreSQL schema reference
└── render.yaml
```

## Tech stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Zod, Helmet, CORS, rate limiting
- **Database**: PostgreSQL on Neon
- **Deployment**: Frontend → Vercel · Backend → Render

## Local development

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL to your Neon connection string
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev          # http://localhost:10000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:10000
npm install
npm run dev           # http://localhost:3000
```

## Prisma commands reference

```bash
npx prisma generate        # generate the typed client
npx prisma migrate dev     # create + apply a migration (local dev)
npx prisma migrate deploy  # apply migrations (production/CI)
npx prisma db seed         # run prisma/seed.ts (imports the real dump data)
npx prisma studio          # browse the database visually
```

## Neon setup

1. Create a project at [neon.tech](https://neon.tech) (or via the Neon console).
2. Copy the **pooled connection string** — it looks like:
   `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require`
3. Put it in `backend/.env` as `DATABASE_URL` for local dev, and in Render's
   environment variables for production.
4. Run `npx prisma migrate deploy` (or `migrate dev` locally) against it, then
   `npx prisma db seed`.

## Render deployment (backend)

`render.yaml` is included at the repo root — Render will pick it up automatically
if you use "New → Blueprint". Otherwise, configure manually:

1. New Web Service → connect this repo, root directory `backend`.
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `npx prisma migrate deploy && npm start`
4. Health check path: `/api/health`
5. Environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `FRONTEND_URL` — your Vercel URL (set after step "Vercel deployment" below)
   - `NODE_ENV=production`
   - `PORT=10000` (Render overrides this automatically at runtime, which the app respects via `process.env.PORT`)
6. Deploy, then verify: `https://<your-render-app>.onrender.com/api/health` should
   return `{"success":true,"message":"API is running"}`.

## Vercel deployment (frontend)

1. New Project → import this repo, root directory `frontend`.
2. Framework preset: Next.js (auto-detected).
3. Environment variable: `NEXT_PUBLIC_API_URL=https://<your-render-app>.onrender.com`
4. Deploy.
5. Go back to Render and set `FRONTEND_URL` to your new Vercel URL (e.g.
   `https://your-app.vercel.app`), then redeploy the backend so CORS allows it.

## Environment variables

**backend/.env**
```
DATABASE_URL=postgresql://...neon.tech/bincomphptest?sslmode=require
PORT=10000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:10000
```

Never commit `.env` or `.env.local` — both are already in `.gitignore`.

## API endpoints

All responses use `{ success, data }` (or `{ success, data, pagination }` for
paginated lists; `{ success: false, error: { message } }` on failure).

```
GET  /api/health
GET  /api/states
GET  /api/states/:id

GET  /api/lgas                     ?state=&search=&page=&limit=
GET  /api/lgas/:id
GET  /api/lgas/:id/results

GET  /api/wards                    ?lga=&search=&page=&limit=
GET  /api/wards/:id

GET  /api/polling-units            ?lga=&ward=&state=&search=&page=&limit=
GET  /api/polling-units/:id
GET  /api/polling-units/:id/results

GET  /api/results                  ?party=&lga=&state=&ward=&sortBy=&sortDir=&page=&limit=
GET  /api/results/summary

GET  /api/parties
GET  /api/parties/:party/results

GET  /api/agents                   ?search=&page=&limit=

GET  /api/analytics/overview
GET  /api/analytics/parties
GET  /api/analytics/lgas
GET  /api/analytics/coverage
GET  /api/analytics/top-polling-units   ?limit=

GET  /api/search?q=
```

## Testing

```bash
cd backend
npm test
```

Covers the health endpoint, paginated results envelope, search validation, and
the 404 handler.

## Design notes

The UI is styled as a "collation sheet" — evoking the paper result sheets this
dataset was originally entered from — using a forest-green/gold civic palette,
a serif display face for headings, and tabular monospace figures for vote counts.
The signature `TallySheet` component stamps a gold "seal" on the leading party.
Fully responsive: single-column stat cards and stacked cards on mobile, multi-column
grids and side-by-side charts from `sm`/`lg` breakpoints up, horizontally-scrollable
tables on narrow screens, and a collapsible hamburger nav below `lg`.

## Troubleshooting

- **CORS errors in the browser**: confirm `FRONTEND_URL` on Render exactly matches
  your Vercel URL (no trailing slash), then redeploy the backend.
- **Prisma can't reach the database**: Neon databases auto-suspend when idle —
  the first request after idle may take a few seconds to wake it up. Also confirm
  `sslmode=require` is in the connection string.
- **`prisma generate` fails to download engines**: this happens in network-restricted
  environments (e.g. CI sandboxes); it will succeed normally on Render, Vercel, or
  a regular dev machine with internet access.
- **Empty dashboard after deploy**: make sure you ran `npx prisma db seed` against
  the Neon database — migrations alone don't load data.

## Verification checklist

- [ ] `npx prisma migrate deploy` run against Neon
- [ ] `npx prisma db seed` run against Neon (confirm row counts match the table above)
- [ ] `GET /api/health` returns `success: true` on the deployed Render URL
- [ ] Vercel frontend loads the dashboard with real stats (not zeros)
- [ ] Polling unit search returns results and detail pages render a tally sheet
- [ ] LGA pages show party standings and a winner
- [ ] Party analysis pages show vote totals, LGAs/PUs won
- [ ] Results table paginates server-side (`?page=`) and filters by party
- [ ] Global search returns grouped results across all types
- [ ] Site is usable on a narrow (375px) mobile viewport — nav, tables, charts
