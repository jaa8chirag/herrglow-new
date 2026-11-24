# Deployment

Two ready-to-use options. **Both were verified:** the web and worker images build, the web container serves from a database, migrations run from the worker image, and `docker compose config` validates.

|                     | **Option 1: VPS** (recommended)                          | **Option 2: Vercel + managed**                                                   |
| ------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Runs                | web, worker, Postgres, Redis, Caddy on one Ubuntu server | web on Vercel, Postgres on Neon, Redis on Upstash/Railway, worker on Railway/VPS |
| Code changes needed | none                                                     | presigned R2 uploads (Vercel's 4.5 MB request limit), Redis-backed rate limits   |
| Cost at this scale  | one small VPS (about 2 vCPU / 4 GB) + R2                 | Vercel + Neon + Redis + worker host                                              |
| Ops effort          | you patch the server (unattended upgrades enabled)       | less server ops, more services to watch                                          |
| Docs                | [`vps/DEPLOY.md`](vps/DEPLOY.md)                         | [`vercel/README.md`](vercel/README.md)                                           |

Shared pieces

- `docker/Dockerfile`: targets `web` (Next standalone) and `worker` (also used for migrations and maintenance scripts).
- **Staging first:** `staging.herrglow.com` with `ALLOW_INDEXING=false`, basic auth and `X-Robots-Tag: noindex`.
- **Build-time SEO guard:** a production build fails if `ALLOW_INDEXING` is not `true` (`DEPLOY_ENV=production`), so a misconfigured deploy cannot ship a site-wide noindex.
- Go-live runbook, Search Console steps and rollback: [`../docs/PRE-LAUNCH.md`](../docs/PRE-LAUNCH.md).
