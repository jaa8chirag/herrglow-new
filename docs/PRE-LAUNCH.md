# HerrGlow: pre-launch checklist

Deploy mechanics live in [`deploy/vps/DEPLOY.md`](../deploy/vps/DEPLOY.md) (recommended) and [`deploy/vercel/README.md`](../deploy/vercel/README.md).
This document is the **go / no-go list**, the **cutover runbook**, the **Search Console steps** and the **rollback plan**.

> Context: herrglow.com is **already live on the old Laravel site**. The new site replaces it on the **same domain**, so there is no Change of Address. The risk is the switch itself, so the plan is: staging sign-off → low-traffic cutover → Laravel kept deployable for 14 days.

---

## 0. Blockers: do these first

- [ ] **Rotate the Gmail app password** for the old `info@glowmakeover.co.in` account. It was in the dump you shared and is still valid until you revoke it.
- [ ] **Change the dev admin password** (`admin@herrglow.local`, flagged "must change"). Create real accounts on staging/production with `create-admin`; never reuse the dev account or the `TempPass12345` test passwords.
- [ ] **Decide: import historical leads?** The new database has **0 leads** from before launch (the 315+ legacy leads, 220 from WhatsApp, are not imported; only content and artists are). Either accept a fresh CRM, or ask me to build the leads/customers import (phones and addresses: handle with care). Decide **before** cutover so the final import is a single pass.
- [ ] **Do not re-run `import:legacy` after admins start editing artists.** The import upserts artists by legacy id and **overwrites** profile fields. Do the final fresh-dump import _before_ anyone edits in the new admin, or ask for an "import only missing rows" mode.
- [ ] Legal pages are **starter text**: have counsel review `/privacy-policy` and `/terms`.

## 1. Accounts and infrastructure

- [ ] VPS (or Vercel/Neon/Redis/worker host) provisioned; SSH key-only; firewall on (`setup.sh`).
- [ ] Cloudflare zone for herrglow.com; **R2 buckets**: `herrglow-media` (public via `media.herrglow.com`, CORS `GET` from the site) and `herrglow-backups` (private).
- [ ] **SMTP** for transactional email (Brevo, Amazon SES, Zoho, or Google Workspace with a **new** app password). SPF + DKIM + DMARC records on herrglow.com so customer confirmations do not land in spam.
- [ ] **Telegram bot**: message `@BotFather` → `/newbot` → copy the token. Add the bot to your chat or group, send it a message, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `chat.id`.
- [ ] Uptime monitoring on `/api/v1/health` and `/` (UptimeRobot or similar) alerting to you.
- [ ] A calendar reminder for the first **backup restore test** (see DEPLOY.md §E). A backup you have never restored is not a backup.

## 2. Environment variables

Set in the server's `.env` (`deploy/vps/.env.example` is the template). **Staging differs only where marked.**

| Variable                                                                 | Production                   | Staging                        | Required        | Notes                                                                                                    |
| ------------------------------------------------------------------------ | ---------------------------- | ------------------------------ | --------------- | -------------------------------------------------------------------------------------------------------- |
| `SITE_URL`                                                               | `https://herrglow.com`       | `https://staging.herrglow.com` | yes             | canonical host, sitemap URLs, emails                                                                     |
| `ALLOW_INDEXING`                                                         | `true`                       | **`false`**                    | yes             | `false` ⇒ robots `Disallow: /` and `noindex` on every page                                               |
| `DEPLOY_ENV`                                                             | `production`                 | `staging`                      | yes             | on `production` the **build fails** if `ALLOW_INDEXING` is not `true`                                    |
| `AUTH_SECRET`                                                            | random 32 bytes              | different random               | yes             | `openssl rand -base64 32`; changing it signs everyone out                                                |
| `POSTGRES_PASSWORD`                                                      | strong, unique               | strong, unique                 | yes             | DB is not exposed publicly                                                                               |
| `NEXT_PUBLIC_CF_RESIZING`                                                | `true`                       | `false`                        | build arg       | baked into the client bundle; needs Cloudflare Image Resizing                                            |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | set                          | set (staging bucket)           | **yes in prod** | uploads are stored in R2; local disk only works in dev                                                   |
| `MEDIA_BASE`                                                             | `https://media.herrglow.com` | staging media URL              | yes             | artist photos are "real" only if the file exists in the media library **and** this is set                |
| `OWNER_EMAIL`                                                            | your email                   | your email                     | yes             | new-lead, application and daily-summary emails                                                           |
| `SMTP_HOST/PORT/USER/PASS/FROM`                                          | set                          | set                            | yes             | without SMTP, owner email and customer confirmations are skipped (logged, not failed)                    |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`                                 | set                          | optional                       | recommended     | the fastest alert channel                                                                                |
| `WHATSAPP_ENABLED`                                                       | `false`                      | `false`                        | no              | adapter is built; flip to `true` only with `WHATSAPP_PHONE_ID` + `WHATSAPP_TOKEN` and approved templates |
| `BACKUP_BUCKET`, `BACKUP_RETENTION_DAYS`                                 | set                          | optional                       | yes (prod)      | nightly dump to R2                                                                                       |
| `STAGING_USER`, `STAGING_PASSWORD_HASH`                                  | n/a                          | set                            | staging         | Caddy basic auth                                                                                         |

Site settings (admin → Settings, owner only): business name, contact email, **WhatsApp number**, **call number**, pre-filled message, offer strip. **While the numbers are empty, all WhatsApp/call buttons are hidden and no `telephone` is published in structured data.** Add the number the day it exists; it also becomes the business phone in schema.

## 3. Content readiness (what Google will see on day one)

Current state (staging data): **210 indexable pages**: 1 home, 7 categories, 3 city hubs (Noida, Delhi, Greater Noida), 123 area pages, 57 services, 14 blogs, 5 static. Not yet public by design: 24 service×city drafts, 32 artist pages (see below), 13 thin services and 4 thin blogs (noindex).

- [ ] **Review and publish the service×city drafts** (admin → Review queue). Publish only the ones you are happy with; each needs real, correct content. Suggested first batch: `hd-bridal-makeup`, `engagement-makeup-artist`, `facial-at-home`, `nail-extensions-and-nail-art-service` × the 3 cities.
- [ ] **Rewrite the 13 thin services and 4 thin blogs**, or leave them noindex (they are not harmful, just not indexed).
- [ ] **Artist photos and bios**: 0 of 32 artist pages are indexable today because none has an uploaded photo. Upload photos (admin → Artists) and ensure each bio is ≥ 50 words. Prioritise artists covering the 3 hubs.
- [ ] **Map artists to Saree Draping at Home** (your #1 service, 50 enquiries): 0 artists are linked to it, so it can never get city pages.
- [ ] **The 6 artists with no coverage** (Garima Gupta, Pays Bhoyar, Vinita Jain, riya sharma, Rupesh, Bharti Mishra): add coverage areas or deactivate.
- [ ] Confirm prices on the services that carry variants; confirm the two wax groups you left unmerged (₹696 and ₹1,079).
- [ ] Set contact details in Settings. Turn the **offer strip off** unless you have a current offer (the imported text is the expired Karva Chauth offer and is hidden by default).
- [ ] Create `public/logo.png` (referenced in structured data) and a favicon; add the real logo to the header.

## 4. Staging sign-off (nothing goes live until all of these pass)

**Functional**

- [ ] Home, category, service, city hub, area and blog pages render on mobile and desktop; no console errors.
- [ ] Book a service from each page type; the lead appears in **admin → Leads** with the right service, area and tag.
- [ ] Book with an area outside the 3 cities → "Coming soon" message and the lead is tagged **out of area**.
- [ ] **Notifications:** the new lead produces a Telegram message and an owner email within ~1 minute; a lead with an email gets the customer confirmation; stop the worker, create a lead, start the worker: it is delivered (retry/sweep). The 9:00 IST summary arrives next morning.
- [ ] `/join-as-beautician`: submit an application (with photo) → appears in **Applications** → approve → an **inactive** artist exists.
- [ ] Admin: login, forced password change, role limits (content user cannot open Leads), deactivate a user mid-session, publish a draft (it appears on the site and in the sitemap), unpublish (it disappears).
- [ ] Image upload to R2 works; the image loads from `media.herrglow.com`.

**SEO and technical**

- [ ] `robots.txt` on **staging** is `Disallow: /` and pages carry `noindex`. On **production** (after cutover) robots allows `/` and blocks `/admin`, `/api`; the home page has **no** `noindex`.
- [ ] `https://<host>/sitemap.xml` returns the index; each child sitemap loads; no URL in a sitemap is `noindex`, redirected or 404.
- [ ] Redirect spot-checks (should match): `/packages`→`/services` 301; `/testimonials`→`/about#reviews` 301; `/gallery`→`/` 301; `/blogs/<slug>`→`/blog/<slug>` 301; an old `/beauticians/<slug>` for a live artist → 301 to `/artists/<new>`; `/hd-engagement-makeup`-style merged service URLs → 301 to the parent; `/bridal-makeup-in-<area>` and `/<service>-in-<area>` → **410**; `/makeup-artist-in-<existing-area>` → **200 at the same URL**. Re-run the audit against a **fresh dump**: `pnpm --filter @herrglow/core legacy-audit <dump.sql>` (writes a CSV of all 26k legacy URLs and their outcome).
- [ ] Rich Results Test on one service page and one city hub: `Service`, `FAQPage`, `BreadcrumbList` valid; **no** `aggregateRating`; `telephone` present only if a number is set.
- [ ] Lighthouse (mobile) on home, a service and a city hub: LCP < 2.5 s, CLS < 0.1, INP < 200 ms. Fix before launch if red.
- [ ] Only one canonical host: `www.herrglow.com` → `https://herrglow.com` (301); `http` → `https`.
- [ ] `curl -I https://<host>/admin/login` has `Cache-Control: private, no-cache…`; public pages have `s-maxage=300`.
- [ ] Backup ran once and **a restore into a scratch database succeeded**.

## 5. Cutover runbook (same domain, Laravel stays alive)

Pick a **low-traffic window** (early morning IST, a weekday). Have rollback (§7) open.

**T-7 days**

- [ ] Staging fully signed off (§4). Content readiness (§3) done.
- [ ] Production stack deployed and running on a **private hostname** (e.g. `origin-new.herrglow.com`, or the server IP with a hosts-file entry) with production env **but not yet receiving traffic**. Verify it works there.
- [ ] Put the old Laravel site on a second hostname (e.g. `origin-old.herrglow.com`) so it can be switched back instantly. Confirm it still runs and has a current backup of its database and `storage/` (uploaded images).
- [ ] **Copy the legacy media** (artist photos, blog images, logo) from Laravel `storage/` into R2 and register them in the media library, or re-upload. Until then those images are placeholders.

**T-48 hours**

- [ ] Lower the DNS TTL for `herrglow.com` and `www` to **300 s** in Cloudflare (if the records are DNS-only/unproxied; if already proxied, TTL is automatic).
- [ ] Take a **fresh dump** from the old database. Run the importer in **dry-run**, read `infra/import/out/report.json`, then `--apply` on production (only if no one has edited artists in the new admin, see §0). Run `sync-pages` and `generate-drafts`. Re-run the legacy audit.
- [ ] Announce a content freeze on the old site (no new blogs/prices) until cutover.

**T-0 (cutover)**

1. [ ] Final dump + import (if leads import was built, import leads now). `sync-pages`.
2. [ ] Confirm production env: `ALLOW_INDEXING=true`, `SITE_URL=https://herrglow.com`, `DEPLOY_ENV=production`. Open the origin hostname and check `robots.txt` and that the home page has no `noindex`.
3. [ ] In Cloudflare, point the `herrglow.com` and `www` records at the **new server** (proxied). Purge the Cloudflare cache.
4. [ ] Smoke test on the live domain (5 minutes): home, one service, one city hub, a legacy 410 URL, a legacy 301 URL, `sitemap.xml`, `robots.txt`; **submit a real test lead** and confirm the Telegram alert and email arrive; open `/admin`.
5. [ ] Post your first Telegram message "launch smoke test OK" so the alert channel is proven in production.

**T+1 hour / T+24 hours / T+7 days**

- [ ] Watch: error rate (container logs), lead flow (admin → Leads vs the ~8 leads/day Oct baseline), `docker compose ps` health, Redis queue length, disk usage.
- [ ] T+24 h: confirm the first 9:00 summary arrived; check the first nightly backup in R2.
- [ ] T+7 d: review Search Console (§6) and the first week of leads; decide on decommissioning Laravel only at T+14 d.

## 6. Search Console and indexing

Do these **after** the cutover is live and stable (T+1 hour).

1. **Property.** Use a **Domain property** for `herrglow.com` (DNS TXT verification). If the property already exists from the old site, keep it: the history stays.
2. **Sitemaps.** _Indexing → Sitemaps_: **remove the old Laravel sitemap entries** and submit **`sitemap.xml`** (the index at `https://herrglow.com/sitemap.xml`). It lists `pages`, `services`, `areas`, `blogs` (and `artists` once artists qualify). Status should read _Success_ and discovered URLs ≈ the indexable count in admin → SEO manager.
3. **Request indexing**: URL Inspection → _Request indexing_ for these **indexable** pages (Google allows roughly 10 to 12 a day; do the rest tomorrow):
   - `https://herrglow.com/`
   - `https://herrglow.com/makeup-artist-in-noida`
   - `https://herrglow.com/makeup-artist-in-delhi`
   - `https://herrglow.com/makeup-artist-in-greater-noida`
   - `https://herrglow.com/services/saree-draping-at-home` (your top service, 50 enquiries)
   - `https://herrglow.com/services/nail-extensions-and-nail-art-service`
   - `https://herrglow.com/services/best-hair-extensions-service`
   - `https://herrglow.com/services/hd-bridal-makeup`
   - `https://herrglow.com/services/full-body-waxing-at-home`
   - `https://herrglow.com/services/party-guest-mehndi`
   - Then, on day 2: `facial-at-home`, `bridal-saree-lehenga-draping`, `flawless-party-makeup-hair-styling`, `luxe-glam-up-makeup`, `karva-chauth-makeup` (seasonal).
   - **Do not** request indexing for noindex pages (for example `premium-full-body-massage-at-home` is currently thin and noindex). Check admin → SEO manager first.
4. **Monitor with the right view.** _Indexing → Pages_ → use the **"All submitted pages"** filter (top-left dropdown), **not** "All known pages". "All known pages" will be dominated by the ~26,000 old URLs that now return 410, which is expected and not a problem. "All submitted pages" shows only what is in your sitemap, and what you care about is: _submitted vs indexed_, and the reasons for the rest.
5. **Expected, healthy signals**
   - Old URLs: _"Not found (404)"_/_Gone_ growing into the thousands over weeks. Normal. Google drops 410s faster than 404s.
   - Redirected URLs (merged services, blogs, artists): _"Page with redirect"_. Normal.
   - New pages: _"Discovered – currently not indexed"_ then _"Crawled – currently not indexed"_ for a while on a new setup. The remedy is content quality and internal links, not more submissions.
6. **Weekly for the first month:** coverage of submitted pages, _Crawl stats_ (response codes: 410/301 should dominate at first, then 200), _Core Web Vitals_, queries/clicks for the 3 city names and top services. Fix anything in _"Soft 404"_, _"Duplicate, Google chose different canonical"_, or _"Blocked by robots.txt"_ immediately.
7. **Bing Webmaster Tools:** import the site from Search Console and submit the same sitemap.
8. **Google Business Profile** (service-area business): categories, every service with prices, 20+ real photos, review link/QR, the same name and number everywhere (NAP). Add the website URL.

## 7. Rollback plan (keep Laravel deployable for 14 days)

**Do not shut down or modify the Laravel server, its database or its `storage/` for 14 days after cutover.** Keep it running on the second hostname with its DB and code intact. Snapshot the VPS (or at least dump the DB) before T-0.

**Rollback triggers** (any one): sustained 5xx on public pages (> 2% for 15 min), the booking form failing, no leads arriving for a window that is abnormal for the hour, a data problem you cannot fix within an hour, or a serious SEO regression you can attribute to the switch (for example unexpected `noindex`).

**Procedure (target: back on Laravel in under 10 minutes)**

1. [ ] In Cloudflare, point `herrglow.com` and `www` back at the **old server** (TTL is already 300 s). Purge the cache.
2. [ ] Verify the old site answers on the domain and its booking works.
3. [ ] Leave the new stack running (do not delete data). Set `ALLOW_INDEXING=false` on it so nothing from it is indexed while it is off-air.
4. [ ] **Reconcile leads captured on the new system** during the window. Export them and enter them into the old system (or message the customers yourself):
   ```bash
   docker compose exec -T postgres psql -U herrglow -d herrglow -c "\copy (select \"bookingRef\",name,phone,email,\"locationText\",\"eventDate\",message,tags,\"createdAt\" from \"Lead\" where \"createdAt\" > '<T0 timestamp>' order by \"createdAt\") to stdout with csv header" > leads-since-cutover.csv
   ```
5. [ ] Write down what failed, fix on staging, and schedule a new cutover. Search Console: if the new URLs were crawled during the window, nothing to undo; they will be re-evaluated.

**After 14 clean days:** decommission Laravel (keep a final database dump and a copy of `storage/` in R2 for at least 6 months), and remove the old hostname.

## 8. Known gaps (so nothing surprises you)

- Historical leads/customers are not imported (§0).
- WhatsApp: adapter built and tested, **off** until you have a business number and approved message templates.
- Uploads pass through the server (8 MB; artist-application photo 5 MB). Fine on a VPS; on Vercel see `deploy/vercel/README.md`.
- Login/form rate limits and the 60 s settings/redirect caches are **per instance** (fine for one server; move to Redis if you ever run several).
- No orphan-page / internal-link report yet; blog link suggestions exist in the editor.
- No self-serve customer or artist login yet (the mobile apps are placeholders).
