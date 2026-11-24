/**
 * Single source of truth for public URL shapes. Pages, links, sitemaps and the Page sync all use these.
 * Namespace note: city hubs and area pages share `/makeup-artist-in-{slug}`; the router resolves city first.
 */
export const urls = {
  home: () => "/",
  category: (slug: string) => `/services/${slug}`,
  service: (slug: string, categorySlug?: string) =>
    categorySlug ? `/services/${categorySlug}/${slug}` : `/services/${slug}`,
  cityHub: (citySlug: string) => `/salon-at-home-${citySlug}`,
  categoryCity: (categorySlug: string, citySlug: string) => `/${categorySlug}-at-home-${citySlug}`,
  serviceCity: (serviceSlug: string, citySlug: string) => `/${serviceSlug}-in-${citySlug}`,
  area: (areaSlug: string) => `/makeup-artist-in-${areaSlug}`,
  pro: (slug: string) => `/artists/${slug}`,
  blogIndex: () => "/blog",
  blog: (slug: string) => `/blog/${slug}`,
  services: () => "/services",
  packages: () => "/packages",
  package: (slug: string) => `/packages/${slug}`,
  join: () => "/join-as-beautician",
  about: () => "/about",
  contact: () => "/contact",
  privacy: () => "/privacy-policy",
  terms: () => "/terms",
} as const;

export const absoluteUrl = (
  path: string,
  base = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://herrglow.com"
) => base.replace(/\/$/, "") + path;
