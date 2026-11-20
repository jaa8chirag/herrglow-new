/**
 * Single source of truth for public URL shapes. Pages, links, sitemaps and the Page sync all use these.
 * Namespace note: city hubs and area pages share `/makeup-artist-in-{slug}`; the router resolves city first.
 */
export const urls = {
  home: () => "/",
  category: (slug: string) => `/${slug}`,
  service: (slug: string) => `/services/${slug}`,
  cityHub: (citySlug: string) => `/makeup-artist-in-${citySlug}`,
  serviceCity: (serviceSlug: string, citySlug: string) => `/${serviceSlug}-in-${citySlug}`,
  area: (areaSlug: string) => `/makeup-artist-in-${areaSlug}`,
  pro: (slug: string) => `/artists/${slug}`,
  blogIndex: () => "/blog",
  blog: (slug: string) => `/blog/${slug}`,
  services: () => "/services",
  join: () => "/join-as-beautician",
  about: () => "/about",
  contact: () => "/contact",
  privacy: () => "/privacy-policy",
  terms: () => "/terms",
} as const;

export const absoluteUrl = (path: string, base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://herrglow.com") =>
  base.replace(/\/$/, "") + path;
