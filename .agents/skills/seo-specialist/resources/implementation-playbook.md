# SEO Implementation Playbook

Production patterns for Next.js 16 App Router technical SEO, Schema.org structured data, Core Web Vitals, and local programmatic SEO.

---

## 1. Next.js 16 Dynamic Route Metadata Pattern

Every public route in `app/(site)/` must implement `generateMetadata` using the centralized `buildMetadata` helper.

```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { urls } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) return {};

  return buildMetadata({
    title: `${service.title} at Home in Delhi NCR`, // Truncated cleanly to <= 60 chars by fitTitle
    description:
      service.shortDescription ||
      `Book verified ${service.title} at home in Delhi NCR. 100% female verified beauticians, pay after service.`, // Truncated to <= 155 chars
    path: urls.service(slug), // Canonical URL without query strings
    image: service.image ?? "/hero/bridal-glam.jpg",
    type: "website",
  });
}
```

---

## 2. Schema.org JSON-LD Structured Data Integration

Always provide search engines with machine-readable entities using the `<JsonLd>` component from `@/lib/seo/jsonld`.

```tsx
import { JsonLd, serviceLd, faqLd, breadcrumbLd } from "@/lib/seo/jsonld";

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceData(slug);

  const path = urls.service(slug);
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: service.category.name, path: urls.category(service.category.slug) },
    { name: service.title, path },
  ];

  return (
    <>
      {/* 1. Service Schema */}
      <JsonLd
        data={serviceLd({
          name: service.title,
          description: service.shortDescription,
          path,
          image: service.image,
          category: service.category.name,
          price: service.offerPrice ?? service.price,
          areaServed: ["Delhi", "Noida", "Greater Noida", "Gurgaon", "Ghaziabad"],
        })}
      />

      {/* 2. BreadcrumbList Schema */}
      <JsonLd data={breadcrumbLd(breadcrumbs)} />

      {/* 3. FAQPage Schema (enables Google Rich FAQ Accordions) */}
      {service.faqs?.length > 0 && <JsonLd data={faqLd(service.faqs)} />}

      <main>
        {/* Semantic H1 with primary search target */}
        <h1>{service.title} at Home in Delhi NCR</h1>
        {/* ... */}
      </main>
    </>
  );
}
```

---

## 3. Semantic Heading Hierarchy Standards

Google algorithms prioritize logical outline structure:

```tsx
//  Correct Semantic Structure:
<main>
  <h1>Bridal Makeup Artist at Home in Noida</h1> {/* Exactly ONE H1 per page */}

  <section>
    <h2>What is Included in Your Bridal Session</h2> {/* H2 for primary topics */}
    <p>...</p>
    <h3>Single-Use Sanitized Makeup Kit</h3> {/* H3 for sub-points */}
    <h3>Airbrush Base & Contour Calibration</h3>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>
    {/* FAQ accordion items */}
  </section>
</main>

// ❌ Incorrect / Penalized Structure:
<main>
  <h1>Bridal Makeup</h1>
  <h1>Our Services</h1> {/* NEVER have multiple H1s */}
  <h4>Sanitized Kit</h4> {/* NEVER skip from H1 or H2 to H4 */}
</main>
```

---

## 4. Contextual Image SEO (`alt` attributes)

Images drive high-intent Google Image search traffic, especially for Indian bridal and beauty searches.

```tsx
// ❌ Poor Image SEO (ignored or penalized):
<Image src="..." alt="photo" />
<Image src="..." alt="bridal-1.jpg" />
<Image src="..." alt="" />

//  High-Performance Image SEO:
<Image
  src="/hero/bridal-glam.jpg"
  alt="Royal Indian bride in crimson lehenga with HD airbrush bridal makeup and polki jewelry in Delhi NCR"
  width={800}
  height={1000}
  priority // Only on primary above-the-fold LCP image!
  sizes="(min-width: 1024px) 35vw, 90vw"
/>
```

---

## 5. Descriptive Internal Anchor Links

Search engines evaluate anchor text to understand what the target page is about:

```tsx
// ❌ Weak / Generic Anchors:
<Link href="/services/bridal-makeup">Click Here</Link>
<Link href="/services/bridal-makeup">Read More</Link>
<Link href="/services">View All</Link>

//  High-Value Semantic Anchors:
<Link href="/services/bridal-makeup-in-noida">
  Explore Bridal Makeup Packages in Noida
</Link>
<Link href="/makeup-artist-in-south-delhi">
  Book Verified Makeup Artists in South Delhi
</Link>
```

---

## 6. Local Delhi NCR SEO Rules

For local beauty services, search engines reward precise location signals:

1. **Neighborhood entity mentions**: Reference specific localities (e.g. _Sector 62, Gaur City, Dwarka, Saket, Indirapuram_) in page text, FAQs, and service area lists.
2. **LocalBusiness NAP consistency**: Ensure business Name, Address/Area Served, and Phone are standardized across the site footer and JSON-LD.
3. **No-Index Staging Protection**: Ensure staging/preview environments always enforce `noindex` via `ALLOW_INDEXING` environment variable (verified by `pnpm test:seo`).
