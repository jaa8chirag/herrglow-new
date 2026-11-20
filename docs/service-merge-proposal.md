# Service merge proposal (NOT applied — awaiting your approval)

Rule used (yours): **same service, different wax/product/technique → ONE service with variants + prices**, not separate pages.
Distinct occasion or intent (e.g. Karva Chauth, Haldi, Muslim Nikah) stays a separate page.

Demand evidence = enquiries per service in the legacy dump (Sep–Oct 2026, 315 leads, small sample — directional only).
Slugs below are the legacy ones; `(leads n)` = enquiries.

## What this needs in the system
- New `ServiceVariant` model (service, name, price, offerPrice, sort, duration). A service page shows variants as a price table; the booking form lets the user pick one.
- Merged service rows are kept with `mergedIntoId` set, so 301s are generated from data (and the admin can edit them).
- Redirect target is always the **parent service page** (`/services/{parent}`), never a fragment, so Google sees a clean 301.
- Old URL pattern is assumed `/services/{slug}`; the redirect map gets verified against the audit-pack URL inventory before cutover.

Legend: **KEEP** = unchanged · **PARENT** = survives, absorbs others · **→ variant** = becomes a variant of the PARENT, URL 301s to it · **→ merge** = true duplicate, URL 301s, no variant.

---

## 1. True duplicate (no decision needed beyond approval)
| Service | Action |
|---|---|
| `engagement-makeup-artist-gaur-city` (leads 2, ₹5,399) | **→ merge** into `engagement-makeup-artist` (leads 1, ₹5,399). Same price, same service, city baked into the slug. 301 `/services/engagement-makeup-artist-gaur-city` → `/services/engagement-makeup-artist`. Gaur City traffic is served by the Greater Noida city hub and service×city page. |

## 2. Engagement makeup — HD / Airbrush finishes
| Service | Price | Action |
|---|---|---|
| `engagement-makeup-artist` | 5,399 | **PARENT** "Engagement Makeup": variant *Standard* |
| `hd-engagement-makeup` | 8,399 | → variant *HD* |
| `airbrush-engagement-makeup` | 10,799 | → variant *Airbrush* |

Why: same occasion, different finish/product, low demand on each (≤2 leads). Fits your default rule.

## 3. Bridal makeup — **judgment call**
| Service | Price | Leads | Proposal |
|---|---|---|---|
| `hd-bridal-makeup` | 17,999 | 6 | **KEEP** (top bridal demand) |
| `airbrush-bridal-makeup` | 20,399 | 0 | **KEEP** (distinct, well-known query "airbrush bridal makeup") |
| `bridal-makeup-artist` ("Classic Bridal Makeup") | 9,599 | 0 | **PARENT** "Bridal Makeup": add variants *Classic / HD / Airbrush* as a price table that links to the HD and Airbrush pages |
| Cultural bridal: Bengali, Christian, Muslim Nikah, Punjabi & Sikh, South Indian | 16,799 | 0 | **KEEP** all (different search intent per community) |
| `complete-bridal-package`, `multi-function-wedding-makeup-package`, `bridal-makeup-trial-session`, `bridesmaid-family-makeup`, `bridal-hairstyling-advanced-hairdo` | — | 0 | **KEEP** (packages/add-ons with their own intent) |

Why this one deviates from your default rule: HD Bridal is the best bridal performer and "airbrush bridal makeup" is a head term. Merging risks losing both. **Alternative (strict default rule):** fold HD + Airbrush into the Bridal parent as variants and 301 them. Tell me which.

## 4. Party makeup
| Service | Price | Leads | Proposal |
|---|---|---|---|
| `flawless-party-makeup-hair-styling` | 2,399 | 4 | **PARENT** "Party Makeup": variant *Classic (with hair styling)* |
| `hd-party-makeup` | 4,199 | 0 | → variant *HD* |
| `airbrush-party-makeup` | 5,399 | 0 | → variant *Airbrush* |
| `luxe-glam-up-makeup` | 4,199 | **7** | **NEEDS YOUR CALL.** Same price as HD, strong demand. Is "Luxe Glam-up" a distinct look or just HD under another name? If same → variant *Luxe Glam (HD)*; if distinct → KEEP |
| `professional-makeup-artist-at-home` | 3,599 | 1 | **KEEP** as the generic "makeup artist at home" landing (head term) |
| Occasion pages: Birthday, Sangeet & Cocktail, Reception, Haldi, Mehndi Function, **Karva Chauth (10)**, Baby Shower, Wedding Guest, Pre-Wedding Shoot, Groom, Korean Glass Skin, Nude Look, Group Package, Eye Makeup & Lash | — | — | **KEEP** (distinct occasions/intents) |

## 5. Waxing
| Group | Action |
|---|---|
| `full-arms-full-legs-waxing-at-home` (₹696, leads 2) + `-normal-wax` (540) + `-rica-wax` (1,020) + `-white-chocolate-wax` (660) | **PARENT** `full-arms-full-legs-waxing-at-home`; variants *Normal 540 / White Chocolate 660 / Rica 1,020*. **Question:** what wax is the ₹696 base price? Needs a variant name (or is it a "from" price?) |
| `bikini-waxing-at-home` (1,079) + `-rica-wax` (960) + `-peel-off-wax` (1,440) | **PARENT** `bikini-waxing-at-home`; variants by wax type. Base 1,079 needs a name (same question) |
| `full-body-waxing-honey` (959, leads 5) + `full-body-waxing-rica` (2,159, leads 4) | **PARENT** new slug `full-body-waxing-at-home`; variants *Honey / Rica*. Both old slugs 301 to it. Combined 9 leads = strong page |
| `korean-crystal-wax` (2,159) | **NEEDS YOUR CALL:** is it a full-body wax type? If yes → variant *Korean Crystal* of full-body waxing. If it's a different body-area service → KEEP |
| Single body parts: full arms, full legs, arms+half legs, full back, half back, stomach, breast, buttocks | **KEEP** (distinct body-part queries). Add a **Waxing at Home** category hub page that links to all of them and the variant parents |

## 6. Facial & Skincare (new category)
| Service | Price | Leads | Proposal |
|---|---|---|---|
| `facial-service` ("Professional Facial at Home") | 1,199 | 4 | **PARENT** "Facial at Home"; variant *Professional* |
| `premium-glow-facial-at-home` | 1,200 | 1 | → variant *Premium Glow* (price is ₹1 apart: near-identical offering) |
| `pigmentation-treatment-facial` | 2,399 | 0 | **KEEP** (distinct treatment/intent) |
| `classic-cleanup` | 719 | 0 | **PARENT** "Face Cleanup at Home"; variant *Classic* |
| `face-cleanup-at-home` ("Professional Face Cleanup") | 840 | 1 | → variant *Professional* |

## 7. Nails
| Service | Price | Leads | Proposal |
|---|---|---|---|
| `nail-extensions-and-nail-art-service` | 1,079 | 8 | **PARENT** "Nail Extensions & Nail Art at Home" (keeps its URL and its 8-lead page) |
| Acrylic 1,200 · Gel 1,440 · Poly Gel 1,800 · Press-on/Soft Gel Tips 960 · Dip Powder 1,200 · BIAB/Builder Gel 1,440 | | 1+1 | → variants of the parent (default rule) |
| Nail art add-ons: Plain Gel Polish 360, French Tips 240, Glitter/3D 60, Chrome/Cat-eye/Ombre 480, Marble/Aurora 600, Custom Hand-painted 120 | | ≤1 | **become add-ons** (checkbox on the booking form), not pages. 301 to the parent |
| `nail-refill-infill` 960 + `refill-new-art-combo` 1,440 | | 0 | **PARENT** "Nail Refill at Home"; variants *Refill / Refill + new art* |
| `nail-extension-removal-safe-e-file` (360, leads 2), `single-nail-repair` (120) | | | **KEEP** (distinct, cheap utility services) |

Alternative if you prefer SEO granularity: keep Acrylic / Gel / Poly Gel as their own pages ("acrylic nails at home" and "gel nail extension" are separate queries) and make the parent a hub. I'd start merged (less thin-content risk on a new site) and split later if Search Console shows separate demand.

## 8. Manicure / Pedicure
| Service | Proposal |
|---|---|
| Basic Manicure 600 · Aroma Manicure 840 · O3+ Brightening Manicure 1,200 | **PARENT** `manicure-at-home` (new slug), variants *Basic / Aroma / O3+ Brightening* |
| Basic Pedicure 600 · Aroma Pedicure 840 · FYC Jelly Pedicure 1,080 | **PARENT** `pedicure-at-home` (new slug), variants *Basic / Aroma / Jelly* |

## 9. Keep as-is (reviewed, no overlap)
Saree Draping at Home (**50 leads — protect this page**), Bridal Saree & Lehenga Draping (5), Hair Extensions (11), Hair Smoothing, Anti-Hair-Fall, Bridal Mehndi, Party Mehndi (8), 3 Pre-Bridal packages (named tiers; revisit as variants of one "Pre-Bridal Package" later), Full Body Massage, Full Body Polishing, Threading.

---

## Result if everything marked as recommended is approved
Active services 95 → about **65** (30 fewer: 1 duplicate, 2 engagement, 2 party, 3+2+1 waxing, 2 facial/cleanup, 6 nail types, 6 nail-art add-ons, 1 refill, 2 manicure, 2 pedicure), plus a Waxing hub page. If you also choose the strict bridal merge, subtract 2 more.
Open questions for you: ① Luxe Glam-up distinct from HD? ② base wax type for the ₹696 and ₹1,079 prices ③ Korean Crystal Wax type ④ Bridal: keep HD/Airbrush separate (recommended) or strict merge ⑤ Nails: merged (recommended) or split.

Nothing is changed in the database until you approve. On approval I will: add `ServiceVariant`, apply merges in the import (idempotent), generate the `Redirect` rows, and re-run the page preview.
