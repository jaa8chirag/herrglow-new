---
name: seo-specialist
description: Master technical, on-page, and local programmatic SEO for modern Next.js applications. Enforces Schema.org JSON-LD structured data, canonical tags, heading hierarchies, Core Web Vitals, and localized search optimization. Use when creating or editing pages, components, blog posts, metadata, or structured data.
metadata:
  model: inherit
---

# SEO Specialist & Technical Search Architect

Ensure every page, component, and route built in this application is engineered for maximum search visibility, high Google rankings, rich snippet eligibility, and exceptional Core Web Vitals.

## Use this skill when

- Creating or modifying page routes (`page.tsx`), layouts, and dynamic routes (`[slug]`)
- Writing or updating `generateMetadata()` and OpenGraph/Twitter card configurations
- Implementing or enriching Schema.org JSON-LD structured data (`Service`, `FAQPage`, `LocalBusiness`, `BreadcrumbList`, `Article`)
- Structuring heading hierarchies (`<h1>`, `<h2>`, `<h3>`), internal links, and anchor text
- Writing descriptive, keyword-rich image `alt` text for search engine indexing
- Building programmatic local SEO pages (e.g. city hubs, neighborhood landing pages, service-area combinations)
- Optimizing for Google Core Web Vitals (LCP, INP, CLS)

## Do not use this skill when

- Working strictly on low-level database schemas or internal backend worker jobs without public search surfaces
- Debugging styling issues that have zero impact on semantic HTML or search indexing

## Instructions

1. **Verify Metadata**: Every public page MUST export `generateMetadata` using `@/lib/seo/metadata` (`buildMetadata`). Enforce title $\le$ 60 chars, description $\le$ 155 chars, and strict canonical URLs.
2. **Single `<h1>` Rule**: Every page must have exactly ONE `<h1>` tag containing the primary search intent and location target (e.g., _"Bridal Makeup Artist at Home in Noida"_).
3. **Structured Data**: Always embed `<JsonLd>` with appropriate Schema.org schemas (`Service`, `LocalBusiness`, `FAQPage`, `BreadcrumbList`).
4. **Descriptive Anchor Text**: Never write generic link labels like "Click Here", "Read More", or "View All". Always use descriptive semantic anchors (e.g., _"Explore Bridal Makeup Packages in Delhi NCR"_).
5. **Contextual Image Alt Text**: Never use empty or generic `alt` attributes (`alt="image"`). Describe the subject, style, technique, and location.
6. **Core Web Vitals**: Prevent Cumulative Layout Shift (CLS) by giving all images and media containers explicit aspect ratios or dimensions. Use `priority` on the primary LCP hero image only.
7. Refer to `resources/implementation-playbook.md` for complete code templates, JSON-LD schemas, and programmatic SEO checklists.

## Core Rules for HerrGlow (Delhi NCR At-Home Salon)

### 1. Local Search Optimization

- Weave primary location entities (Delhi NCR, Noida, Greater Noida, South Delhi, Dwarka, Gurgaon) into page titles, `<h1>` headings, breadcrumbs, and FAQ questions.
- Maintain programmatic threshold guards: do not index city-service pages if active professional count is below threshold (`MIN_PROS_FOR_SERVICE_CITY`).

### 2. Schema.org Hierarchy

- **Service Pages**: Must include `serviceLd`, `breadcrumbLd`, and `faqLd` (if FAQs exist).
- **Home Page**: Must include `localBusinessLd` and `websiteLd`.
- **Blog Posts**: Must include `articleLd` and `breadcrumbLd`.

### 3. Build & Deploy Guards

- Never hardcode `noindex` on root layouts or public pages.
- Ensure all tests in `pnpm test:seo` pass cleanly before finalizing tasks.

## Resources

- [Implementation Playbook](file://./resources/implementation-playbook.md) for ready-to-use metadata snippets, JSON-LD patterns, programmatic SEO checklists, and internal linking templates.
