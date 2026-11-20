# Option 1: single Ubuntu VPS (Docker Compose + Caddy + Cloudflare)

Recommended. Everything runs from one `docker compose`: **web, worker, postgres, redis, caddy** (+ an on-demand **backup** job).

**Size:** 2 vCPU / 4 GB RAM / 40 GB SSD is comfortable (Hetzner CX22, DigitalOcean 4 GB, or an Indian region host for lower latency). Choose a region near Delhi NCR if you can. Builds need ~2 GB, so keep the 2 GB swap that `setup.sh` adds.

## A. Server bootstrap (once)
```bash
ssh root@SERVER_IP
curl -fsSL https://raw.githubusercontent.com/<you>/<repo>/main/deploy/vps/setup.sh | bash   # or copy and run setup.sh
```
Creates the firewall (22/80/443 only), Docker, fail2ban, unattended security updates, swap. Then create a non-root deploy user and disable root/password SSH.

## B. Staging first (staging.herrglow.com, **ALLOW_INDEXING=false**)
```bash
mkdir -p /opt/herrglow-staging && cd /opt/herrglow-staging
git clone <repo> src && cp -r src/deploy/vps/* src/deploy/vps/.env.example . && cp .env.example .env && chmod 600 .env
# edit .env:
#   COMPOSE_PROJECT_NAME=herrglow-staging   DOMAIN=staging.herrglow.com   CADDYFILE=./Caddyfile.staging
#   SITE_URL=https://staging.herrglow.com   ALLOW_INDEXING=false   DEPLOY_ENV=staging   NEXT_PUBLIC_CF_RESIZING=false
#   POSTGRES_PASSWORD / AUTH_SECRET (openssl rand -base64 32)   STAGING_USER / STAGING_PASSWORD_HASH
docker compose up -d --build
```
Staging is protected three ways: HTTP basic auth, `X-Robots-Tag: noindex` from Caddy, and `ALLOW_INDEXING=false` in the app (robots.txt = `Disallow: /`, every page `noindex`).

First-time data on staging (from your machine, with the dump that never leaves your control):
```bash
docker compose run --rm migrate                       # schema
docker compose run --rm -v /path/to/dump.sql:/dump.sql:ro worker \
  pnpm import:legacy --dump /dump.sql --apply         # content, pros (dry-run first without --apply)
docker compose run --rm worker pnpm --filter @herrglow/core create-admin you@yourdomain OWNER   # prints a one-time password
docker compose run --rm worker pnpm --filter @herrglow/core sync-pages
docker compose run --rm worker pnpm --filter @herrglow/core generate-drafts
```
Smoke test: the checklist in `docs/PRE-LAUNCH.md` §4.

## C. Production
Same as staging in `/opt/herrglow` with: `DOMAIN=herrglow.com`, `CADDYFILE=./Caddyfile`, `SITE_URL=https://herrglow.com`, `ALLOW_INDEXING=true`, `DEPLOY_ENV=production`, `NEXT_PUBLIC_CF_RESIZING=true`, R2 + SMTP + Telegram variables filled in. **Do not turn production on for the public until the DNS cutover step in the pre-launch checklist.** You can first run it on its own hostname (e.g. `origin.herrglow.com`).

## D. Cloudflare
- DNS: `A herrglow.com → SERVER_IP` (proxied), `CNAME www → herrglow.com` (proxied), `A staging → SERVER_IP` (proxied).
- SSL/TLS: **Full (strict)**. Caddy obtains a real certificate automatically (HTTP-01 works through the proxy). Alternative: install a Cloudflare Origin Certificate and reference it in the Caddyfile.
- Firewall on the server: allow 80/443 only from Cloudflare IP ranges once everything works (`ufw allow from <cf-range> to any port 443`).
- Cache Rules: (1) **bypass cache** when path starts with `/admin` or `/api`; (2) **eligible for cache, respect origin headers** for everything else. The app already sends `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` on public HTML, so edge caching is automatic; after a publish, a change shows within 5 minutes (or purge the URL).
- Turn on **Image Resizing** (needed for `NEXT_PUBLIC_CF_RESIZING=true`), Brotli, HTTP/3, and Bot Fight Mode. Add a rate-limiting rule for `POST /` and `/join-as-beautician` (form spam).
- R2: bucket `herrglow-media` with the custom domain `media.herrglow.com` (public) and a CORS rule allowing `GET` from your site. A **second, private** bucket `herrglow-backups` for database dumps.

## E. Backups (daily, to R2)
```bash
crontab -e
0 3 * * * cd /opt/herrglow && docker compose --profile tools run --rm backup >> /var/log/herrglow-backup.log 2>&1
```
Keeps 30 days (`BACKUP_RETENTION_DAYS`). **Test a restore before launch**, onto a scratch database:
```bash
# download the newest dump from R2 (rclone or the dashboard), then:
gunzip -c herrglow-YYYY-MM-DDTHHMMSSZ.sql.gz | docker compose exec -T postgres psql -U herrglow -d herrglow_restore_test
```
Also back up `/opt/herrglow/.env` somewhere safe (password manager). Without `AUTH_SECRET` all sessions reset; without R2 keys uploads stop.

## F. Deploying an update
```bash
cd /opt/herrglow/src && git pull && cd .. && docker compose up -d --build
```
Order is automatic: migrations run first (`migrate` service), then web and worker restart. Rollback: `git checkout <previous-tag> && docker compose up -d --build` (migrations are additive; avoid destructive ones without a backup).

## G. Operating it
```bash
docker compose ps                         # health
docker compose logs -f web worker         # logs
docker compose exec redis redis-cli llen bull:notifications:wait    # queued jobs
docker compose run --rm worker pnpm --filter @herrglow/core page-preview   # page counts per city
```
Alerts to set up: UptimeRobot (or similar) on `https://herrglow.com/api/v1/health` and on the homepage; disk-usage alert at 80%.
