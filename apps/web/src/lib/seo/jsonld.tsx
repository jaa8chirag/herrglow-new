import { SITE_NAME, SITE_URL, abs } from "../site";

type Json = Record<string, unknown>;

/** Renders one JSON-LD block. `<` is escaped so content can never break out of the script tag. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const compact = (o: Json): Json => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export interface OrgInput {
  email?: string | null;
  /** omitted from output when empty (no number configured) */
  telephone?: string | null;
  areaServed?: string[];
  sameAs?: string[];
}

/** Business entity. Service-area business, so no street address. Deliberately NO aggregateRating. */
export const organizationLd = (o: OrgInput = {}): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs("/logo.png"),
    email: o.email,
    telephone: o.telephone,
    priceRange: "₹₹",
    areaServed: o.areaServed?.map((n) => ({ "@type": "City", name: n })),
    sameAs: o.sameAs?.length ? o.sameAs : undefined,
  });

export const websiteLd = (): Json => ({
  "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL,
});

export interface ServiceInput {
  name: string; description: string; path: string; image?: string | null; category?: string | null;
  price?: number | null; areaServed?: string[];
}
export const serviceLd = (s: ServiceInput): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name, description: s.description, url: abs(s.path), serviceType: s.category,
    image: s.image ? (s.image.startsWith("http") ? s.image : abs(s.image)) : undefined,
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: s.areaServed?.map((n) => ({ "@type": "City", name: n })),
    offers: s.price != null ? { "@type": "Offer", price: String(Math.round(s.price)), priceCurrency: "INR", url: abs(s.path), availability: "https://schema.org/InStock" } : undefined,
  });

/** Only pass FAQs that are visibly rendered on the same page. */
export const faqLd = (faqs: { question: string; answer: string }[]): Json | null =>
  faqs.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }
    : null;

export const breadcrumbLd = (items: { name: string; path: string }[]): Json => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});

export const articleLd = (a: { title: string; description?: string | null; path: string; image?: string | null; author?: string | null; published: Date; modified: Date }): Json =>
  compact({
    "@context": "https://schema.org", "@type": "Article", headline: a.title.slice(0, 110), description: a.description, mainEntityOfPage: abs(a.path),
    image: a.image ? (a.image.startsWith("http") ? a.image : abs(a.image)) : undefined,
    author: { "@type": "Organization", name: a.author || SITE_NAME },
    publisher: { "@id": `${SITE_URL}/#business` },
    datePublished: a.published.toISOString(), dateModified: a.modified.toISOString(),
  });

/** Artist profile. Never includes phone/email/address. */
export const personLd = (p: { name: string; path: string; image?: string | null; jobTitle?: string | null; description?: string | null }): Json =>
  compact({
    "@context": "https://schema.org", "@type": "Person", name: p.name, url: abs(p.path), jobTitle: p.jobTitle, description: p.description,
    image: p.image ? (p.image.startsWith("http") ? p.image : abs(p.image)) : undefined,
    worksFor: { "@id": `${SITE_URL}/#business` },
  });
