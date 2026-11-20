# Status

## Done
- P0: monorepo, infra (Postgres :5440, Redis :6390), Prisma schema, legacy content + pros import (dry-run default, no passwords)
- Service merges applied: 95 → 70 active services, 29 variants, 6 nail-art add-ons, 32 redirects (301)
- City scope: only Noida, Delhi, Greater Noida active. `City.isActive` toggle. Others keep data, no pages/sitemap/nav (410 via proxy)
- Page gates (core/seo/plan.ts): hub ≥3 pros; service×city ≥2 pros + published content; area = (≥2 pros OR ≥1 lead) + landmarks + ≥1 nearby
- Service×city drafts generated from real data (status DRAFT until reviewed)
- 6b design system (packages/ui), 6c SEO foundation, 6d public pages + booking form (lead → DB, out_of_area tag)

## Commands
- `pnpm infra:up`, `pnpm dev:web`
- `pnpm --filter @herrglow/core page-preview | sync-pages | generate-drafts`
- `pnpm import:legacy --dump <file> [--apply]`
- `pnpm --filter @herrglow/web test:seo` (also runs before `build`)

## Before launch
- Set ALLOW_INDEXING=true, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_MEDIA_BASE, NEXT_PUBLIC_CF_RESIZING=true, DEPLOY_ENV=production
- Set whatsapp_number / contact_phone / contact_email in site settings (UI hides them while empty)
- Upload media to R2 (legacy image paths are stored; images show placeholders until NEXT_PUBLIC_MEDIA_BASE is set)
- Review + publish service×city drafts (ServiceCity.contentStatus)
- Legal pages are starter text: counsel review
- Redirect map for legacy URLs: needs audit-pack url-inventory
- Rotate the Gmail app password (in the old dump)

## Known gaps / findings
- Saree Draping at Home (50 leads, #1 service) has 0 pros mapped to it: map pros or it gets no city pages
- 13 services have <80-word descriptions → noindex until rewritten; 4 thin blogs noindex
- 6 active pros without coverage (Garima Gupta, Pays Bhoyar, Vinita Jain, riya sharma, Rupesh, Bharti Mishra)
- Badlapur-style odd coverage: check pros whose coverage came from text matching
- Waxing groups (₹696 full arms+legs, ₹1,079 bikini) left unmerged pending wax-type answer
