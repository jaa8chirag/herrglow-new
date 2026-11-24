# Option 2: Vercel (web) + Neon (Postgres) + Redis + worker on a small host

Read **"What this option costs you"** before choosing it.

## Architecture

| Piece                              | Where                                               | Notes                                                 |
| ---------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Web (Next.js, `/admin`, `/api/v1`) | **Vercel**                                          | project root `apps/web`                               |
| Postgres                           | **Neon**                                            | pooled URL for the app, **direct** URL for migrations |
| Redis (BullMQ queue)               | **Upstash** (fixed-price plan) or **Railway** Redis | must be TCP (`rediss://`)                             |
| Worker (notifications, digest)     | **Railway / Fly / any small VPS**                   | image: `deploy/docker/Dockerfile --target worker`     |
| Media + backups                    | **Cloudflare R2**                                   | same as option 1                                      |
| DNS / CDN / WAF                    | **Cloudflare**                                      | in front of Vercel                                    |

## 1. Neon

1. Create a project in the Mumbai (`ap-south-1`) or nearest region.
2. Copy **two** connection strings: the **pooled** one (host contains `-pooler`) and the **direct** one.
3. Run migrations from your machine or CI with the **direct** URL:
   ```bash
   DATABASE_URL="<direct-url>?sslmode=require" pnpm --filter @herrglow/db exec prisma migrate deploy
   ```
4. Load content once (from a machine that has the legacy dump; never commit it):
   ```bash
   DATABASE_URL="<direct-url>?sslmode=require" pnpm import:legacy --dump <dump.sql> --apply
   DATABASE_URL="<direct-url>?sslmode=require" pnpm --filter @herrglow/core create-admin you@yourdomain OWNER
   ```
5. Neon free/launch plans suspend idle compute; the first request after idle is slow. Use a plan with autosuspend off for production.

## 2. Vercel project

- **Root Directory:** `apps/web` · enable **"Include source files outside of the Root Directory"** (monorepo).
- **Install Command:** `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command:** `cd ../.. && pnpm --filter @herrglow/db generate && pnpm --filter @herrglow/web build`
- **Output:** Next.js (default). `output: "standalone"` in `next.config.ts` is ignored on Vercel.
- The build needs **no database** (all site routes render per request).
- Environment variables (Production):
  `DATABASE_URL` (pooled, `?sslmode=require&pgbouncer=true`), `REDIS_URL`, `AUTH_SECRET`, `SITE_URL`, `ALLOW_INDEXING`, `DEPLOY_ENV=production`, `NEXT_PUBLIC_CF_RESIZING`, `MEDIA_BASE`, `R2_*`, `OWNER_EMAIL`, `SMTP_*`, `TELEGRAM_*`.
- **Staging:** use a **Preview** deployment bound to `staging.herrglow.com` with `ALLOW_INDEXING=false`, `SITE_URL=https://staging.herrglow.com`, and enable **Vercel Authentication** (password protection) on previews.

## 3. Worker host (Railway as the example)

1. New service from the GitHub repo, **Dockerfile path** `deploy/docker/Dockerfile`, **target** `worker`.
2. Variables: `DATABASE_URL` (pooled is fine for the worker), `REDIS_URL`, `OWNER_EMAIL`, `SMTP_*`, `TELEGRAM_*`, `WHATSAPP_*`, `SITE_URL`.
3. One instance only (the 9:00 IST digest is a scheduled job; two workers are safe thanks to idempotent logs but unnecessary).

## 4. Backups

Neon keeps point-in-time history on paid plans. Still run the nightly `pg_dump` to R2 from the worker host or a GitHub Actions cron using `deploy/vps/backup.sh` (set `PGHOST/PGUSER/PGPASSWORD/PGDATABASE` to the **direct** Neon URL parts).

## What this option costs you (honest list)

1. **Uploads over 4.5 MB fail on Vercel.** Vercel limits request bodies on functions to 4.5 MB. The admin upload route (8 MB limit) and the public artist-application photo (5 MB) go through the server. You would need **presigned direct-to-R2 uploads** (not built yet) or client-side image compression first.
2. **Per-instance state.** The login throttle, the lead/application rate limits and the 60 s settings/redirect caches live in server memory. On serverless each instance has its own copy, so limits are weaker. Moving them to Redis is a small job but it is not done.
3. **BullMQ on Upstash** can burn through request-based quotas (the worker polls). Use a fixed-price Redis (Upstash fixed plan, Railway Redis) instead.
4. **Connection limits.** Always use Neon's pooled URL from the app; cold starts add latency.
5. **More moving parts and cost** than one VPS: Vercel + Neon + Redis + worker host.

**Recommendation:** Option 1 (VPS). It fits this codebase as written (no code changes), is cheaper at this scale, and keeps uploads, rate limits and the worker simple. Choose Option 2 only if you specifically want managed infrastructure and accept items 1 and 2.
