# Plan by Appetite

Production test app for project planning, time blocks and reports.

## Local Setup

```bash
cp .env.example .env.local
docker compose up -d db
npm install
npm run db:migrate
npm run db:seed-admin
npm run dev
```

Open `http://localhost:3000` and log in with the configured `PLAN_ADMIN_EMAIL` and `PLAN_ADMIN_PASSWORD`.

## Deployment

Deploy as a separate Coolify application on `vps-shared-01`.

- Domain: `plan.appetiteapps.be`
- Build command: `npm run build`
- Start command: `npm run start`
- Health check: `/api/health`
- Required env vars: `DATABASE_URL`, `PLAN_ADMIN_EMAIL`, `PLAN_ADMIN_PASSWORD`, `NEXT_PUBLIC_APP_URL`

The database connection is server-only. Do not expose `DATABASE_URL` to browser code.
