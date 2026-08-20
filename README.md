# My Vet

My Vet is a Next.js 16 veterinary directory and management application with a production-oriented Express 5 API in [`backend/`](backend/).

## Frontend

```powershell
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

Copy `.env.example` to `.env.local` and set both API URLs. On Railway, configure these on the frontend service before building:

```text
API_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

## Backend

```powershell
cd backend
Copy-Item .env.example .env
npm ci
npm run db:generate
npm run dev
```

The API defaults to `http://localhost:5000`. A PostgreSQL `DATABASE_URL` and both JWT secrets are required. Docker is not part of this setup.

Run safe local checks with:

```powershell
cd backend
npm run typecheck
npm run lint
npm test
npm run build
```

Integration tests and database resets require an isolated `DATABASE_URL_TEST`. They refuse to run in production or against the configured application database. The development seed also refuses to run when `NODE_ENV=production`.

## Railway deployment

Create a Railway service from this repository and configure:

- Root directory: `/backend`
- Config file: `/railway.json` (relative to the service root)
- PostgreSQL service with `DATABASE_URL` available to the API service
- All required values from [`backend/.env.example`](backend/.env.example)

[`backend/railway.json`](backend/railway.json) builds the TypeScript service, runs `prisma migrate deploy` as a pre-deploy command, starts `dist/server.js`, and checks `/api/health`. Do not add the seed command to deployment.

The frontend service uses repository root `/`; the backend service uses `/backend`. The production bootstrap is a deliberate one-time operation, not a deploy hook. See [`backend/README.md`](backend/README.md) before importing initial listings.

After deployment, run only non-destructive checks:

```powershell
cd backend
$env:API_URL='https://your-api.up.railway.app'
npm run smoke
```

See [`backend/README.md`](backend/README.md) for environment and operations details and [`backend/docs/api-endpoints.md`](backend/docs/api-endpoints.md) for the endpoint inventory.
