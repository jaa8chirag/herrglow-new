/**
 * Owner-approved service merges (docs/service-merge-proposal.md) as DATA, keyed by legacy service id.
 * Applied inside import-legacy.ts, so the import stays idempotent and dry-run shows the result.
 *
 * Deliberately NOT merged (owner decision): Luxe Glam-up (4), full arms+legs waxing group (25,38,39,40),
 * bikini waxing group (32,43,44), Korean Crystal Wax (51), HD Bridal (1) / Airbrush Bridal (6) pages.
 */
export interface Svc {
  id: string; legacyId: number; slug: string; title: string; categoryId: string;
  price: number | null; offerPrice: number | null; duration: string | null; priceLabel: string | null;
  status: "ACTIVE" | "INACTIVE"; leadCount: number; [k: string]: unknown;
}
export interface VariantSpec { name: string; legacyId?: number; own?: boolean; link?: boolean }
export interface MergeGroup {
  /** existing parent (legacy id) OR a new parent derived from `deriveFrom` */
  parent: number | { slug: string; title: string; deriveFrom: number; categoryId?: string };
  /** rename parent (old slug becomes a 301) */
  rename?: { slug: string; title: string };
  variants: VariantSpec[];
  /** children whose pages are retired (301 → parent). A variant with `link: true` keeps its own page. */
  /** children that become booking-form add-ons instead of variants */
  addons?: { name: string; legacyId: number }[];
  parentPriceLabel?: string;
}

export const MERGES: MergeGroup[] = [
  // 1 + 2. Engagement: true duplicate (8) + HD/Airbrush finishes
  { parent: 7, variants: [{ name: "Standard", own: true }, { name: "HD", legacyId: 98 }, { name: "Airbrush", legacyId: 99 }] },
  // 3. Bridal: parent lists Classic / HD / Airbrush; HD + Airbrush keep their own pages
  { parent: 5, rename: { slug: "bridal-makeup-artist", title: "Bridal Makeup" }, variants: [{ name: "Classic", own: true }, { name: "HD", legacyId: 1, link: true }, { name: "Airbrush", legacyId: 6, link: true }] },
  // 4. Party (Luxe Glam-up stays separate)
  { parent: 3, variants: [{ name: "Classic (with hair styling)", own: true }, { name: "HD", legacyId: 94 }, { name: "Airbrush", legacyId: 95 }] },
  // 5. Full body waxing: Honey + Rica → new parent
  { parent: { slug: "full-body-waxing-at-home", title: "Full Body Waxing at Home", deriveFrom: 17 }, variants: [{ name: "Honey Wax", legacyId: 17 }, { name: "Rica Wax", legacyId: 16 }] },
  // 6. Facial & Skincare
  { parent: 9, rename: { slug: "facial-at-home", title: "Facial at Home" }, variants: [{ name: "Professional", own: true }, { name: "Premium Glow", legacyId: 37 }] },
  { parent: 36, rename: { slug: "face-cleanup-at-home", title: "Face Cleanup at Home" }, variants: [{ name: "Professional", own: true }, { name: "Classic", legacyId: 58 }] },
  // 7. Nails
  {
    parent: 15, parentPriceLabel: "Starting at",
    variants: [
      { name: "Acrylic", legacyId: 62 }, { name: "Gel", legacyId: 63 }, { name: "Poly Gel", legacyId: 64 },
      { name: "Press-on / Soft Gel Tips", legacyId: 67 }, { name: "Dip Powder", legacyId: 66 }, { name: "BIAB / Builder Gel", legacyId: 65 },
    ],
    addons: [
      { name: "Plain Gel Polish", legacyId: 68 }, { name: "French Tips", legacyId: 69 }, { name: "Chrome / Cat Eye / Ombre", legacyId: 70 },
      { name: "Glitter / Rhinestones / 3D", legacyId: 71 }, { name: "Custom Hand-Painted Art", legacyId: 72 }, { name: "Marble / Aurora / Magnetic Gel", legacyId: 73 },
    ],
  },
  { parent: 74, variants: [{ name: "Refill / Infill", own: true }, { name: "Refill + New Art", legacyId: 77 }] },
  // 8. Manicure / Pedicure
  { parent: { slug: "manicure-at-home", title: "Manicure at Home", deriveFrom: 45 }, parentPriceLabel: "Starting at",
    variants: [{ name: "Basic", legacyId: 45 }, { name: "Aroma", legacyId: 46 }, { name: "O3+ Brightening", legacyId: 47 }] },
  { parent: { slug: "pedicure-at-home", title: "Pedicure at Home", deriveFrom: 48 }, parentPriceLabel: "Starting at",
    variants: [{ name: "Basic", legacyId: 48 }, { name: "Aroma", legacyId: 49 }, { name: "Jelly (FYC Professional)", legacyId: 50 }] },
];

/** Pure duplicate: retired with a 301, no variant. */
export const DUPLICATES: { legacyId: number; into: number }[] = [{ legacyId: 8, into: 7 }];

export interface MergeResult {
  services: Svc[];
  variants: { serviceId: string; name: string; price: number | null; offerPrice: number | null; duration: string | null; sortOrder: number; linkedServiceId: string | null }[];
  addons: { serviceId: string; name: string; price: number | null; sortOrder: number }[];
  redirects: { fromPath: string; toPath: string; note: string }[];
}

export function applyMerges(input: Svc[], redirectsIn: MergeResult["redirects"]): MergeResult {
  const services = input.map((s) => ({ ...s }));
  const byLegacy = new Map(services.map((s) => [s.legacyId, s]));
  const variants: MergeResult["variants"] = [];
  const addons: MergeResult["addons"] = [];
  const redirects = [...redirectsIn];
  const retire = (child: Svc, parent: Svc, why: string) => {
    child.status = "INACTIVE";
    (child as Svc & { mergedIntoId?: string }).mergedIntoId = parent.id;
    parent.leadCount += child.leadCount;
    redirects.push({ fromPath: `/services/${child.slug}`, toPath: `/services/${parent.slug}`, note: why });
  };
  const eff = (s: Svc) => ({ price: s.price, offerPrice: s.offerPrice });

  for (const d of DUPLICATES) retire(byLegacy.get(d.legacyId)!, byLegacy.get(d.into)!, "duplicate service merged");

  for (const g of MERGES) {
    let parent: Svc;
    if (typeof g.parent === "number") parent = byLegacy.get(g.parent)!;
    else {
      const src = byLegacy.get(g.parent.deriveFrom)!;
      parent = { ...src, id: `svc_new_${g.parent.slug}`, legacyId: -services.length - 1, slug: g.parent.slug, title: g.parent.title, leadCount: 0, status: "ACTIVE" };
      (parent as Svc & { mergedIntoId?: string | null }).mergedIntoId = null;
      services.push(parent);
    }
    if (g.rename) {
      if (parent.slug !== g.rename.slug) redirects.push({ fromPath: `/services/${parent.slug}`, toPath: `/services/${g.rename.slug}`, note: "service renamed" });
      parent.slug = g.rename.slug; parent.title = g.rename.title;
    }
    g.variants.forEach((v, i) => {
      const src = v.own ? parent : byLegacy.get(v.legacyId!)!;
      const { price, offerPrice } = eff(src);
      variants.push({ serviceId: parent.id, name: v.name, price, offerPrice, duration: src.duration, sortOrder: i, linkedServiceId: v.link ? src.id : null });
      if (!v.own && !v.link && src !== parent) retire(src, parent, `merged into ${parent.title} as variant "${v.name}"`);
    });
    (g.addons ?? []).forEach((a, i) => {
      const src = byLegacy.get(a.legacyId)!;
      addons.push({ serviceId: parent.id, name: a.name, price: src.offerPrice ?? src.price, sortOrder: i });
      retire(src, parent, `nail-art add-on "${a.name}" moved to booking add-ons`);
    });
    // parent's displayed price: lowest variant ("Starting at") when the parent itself isn't a variant
    if (g.parentPriceLabel || typeof g.parent !== "number") {
      const mine = variants.filter((v) => v.serviceId === parent.id);
      const low = mine.reduce<(typeof mine)[number] | null>((m, v) => ((v.offerPrice ?? v.price ?? 1e9) < (m ? (m.offerPrice ?? m.price ?? 1e9) : 1e9) ? v : m), null);
      if (low) { parent.price = low.price; parent.offerPrice = low.offerPrice; parent.priceLabel = g.parentPriceLabel ?? "Starting at"; }
    }
  }
  return { services, variants, addons, redirects };
}
