# P0 checklist

Stack (decided): TypeScript only. pnpm monorepo: apps/web (Next.js: site + /admin + /api/v1), apps/worker (BullMQ),
packages/db (Prisma 7 + Postgres), packages/core (domain logic), packages/ui, apps/mobile (placeholder).

## Done

- [x] Monorepo skeleton, .gitignore (blocks dumps/secrets), no .NET
- [x] Infra: Postgres 17 on :5440, Redis 7 on :6390 (5432/6379 are taken by another local project)
- [x] Prisma schema + migrations (init, area_zone)
- [x] Legacy import (content tables): `pnpm import:legacy --dump <file.sql> [--apply]` — dry-run by default
- [x] Verified: /api/v1/health -> core -> db returns 95 services

## Import notes (see infra/import/out/report.json after a run; gitignored)

- 24,461 location_service rows -> 939 service x city rows
- Delhi zones folded into city "Delhi" (Area.zone keeps the zone)
- mail_* settings, logo, favicon, phone, email are NOT imported. whatsapp_number is empty.
- Branding rewritten to HerrGlow; double-escaped HTML in legacy content is decoded
- 3 locations have no usable city (lucknow, Bhagalpur, mumbai/"maharastra") -> skipped, need review
- Service "engagement-makeup-artist-gaur-city" collides with an existing "engagement-makeup-artist": manual merge needed
- 4 blogs under 350 words (plan said 5)
- Not imported yet: pros (beauticians + prices), leads, payments, app_* tables, seo_url_settings, local_page_content

## Next

- [ ] Auth.js admin (credentials + roles), AdminUser seed
- [ ] packages/ui design tokens + shadcn/ui, Tailwind theme (ivory/blush, plum, Fraunces + Inter)
- [ ] Import stage 2: pros + coverage, then leads (PII; no passwords)
- [ ] Zod -> OpenAPI for /api/v1
- [ ] Cloudflare R2 + image loader
- [ ] Rotate the Gmail app password (still outstanding)
