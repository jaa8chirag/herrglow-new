/**
 * Merges duplicate and unnecessary services into their canonical parents,
 * rolls up lead counts, creates 301 redirects, and marks merged rows as INACTIVE.
 *
 * Safe and idempotent.
 */
import { prisma } from "../src/index.js";

interface MergeDefinition {
  parentSlug: string;
  childSlugs: string[];
  ensureVariants?: {
    name: string;
    price: number;
    offerPrice?: number;
    duration?: string;
    sortOrder: number;
  }[];
}

const MERGE_RULES: MergeDefinition[] = [
  // 1. Manicure & Pedicure Duplicates -> Deluxe Manicure & Pedicure at Home
  {
    parentSlug: "classic-manicure-pedicure",
    childSlugs: [
      "aroma-spa-manicure",
      "aroma-spa-pedicure",
      "classic-manicure-at-home",
      "classic-pedicure-at-home",
      "classic-manicure-pedicure-combo",
      "fyc-jelly-luxury-pedicure",
      "o3-brightening-mani-pedi-spa",
    ],
    ensureVariants: [
      {
        name: "Express Mani-Pedi Combo",
        price: 999,
        offerPrice: 899,
        duration: "60 mins",
        sortOrder: 1,
      },
      {
        name: "Classic Rose Spa Mani-Pedi",
        price: 1499,
        offerPrice: 1299,
        duration: "75 mins",
        sortOrder: 2,
      },
      {
        name: "Aroma Spa Relaxing Mani-Pedi",
        price: 1699,
        offerPrice: 1499,
        duration: "90 mins",
        sortOrder: 3,
      },
      {
        name: "O3+ Luxury Brightening Mani-Pedi",
        price: 1999,
        offerPrice: 1699,
        duration: "90 mins",
        sortOrder: 4,
      },
      {
        name: "FYC Jelly Luxury Spa Pedicure",
        price: 1299,
        offerPrice: 1099,
        duration: "60 mins",
        sortOrder: 5,
      },
    ],
  },

  // 2. Nail Extensions Duplicate -> Gel Nail Extensions & Custom Art
  {
    parentSlug: "gel-nail-extensions",
    childSlugs: ["nail-extensions-gel-art"],
    ensureVariants: [
      {
        name: "Acrylic Extensions with Gel Polish",
        price: 2499,
        offerPrice: 2199,
        duration: "120 mins",
        sortOrder: 1,
      },
      {
        name: "UV Gel Nail Extensions",
        price: 2799,
        offerPrice: 2499,
        duration: "120 mins",
        sortOrder: 2,
      },
      {
        name: "Polygel Sculpting Extensions",
        price: 2999,
        offerPrice: 2699,
        duration: "120 mins",
        sortOrder: 3,
      },
      {
        name: "Express Soft Gel Press-ons",
        price: 1799,
        offerPrice: 1499,
        duration: "60 mins",
        sortOrder: 4,
      },
    ],
  },

  // 3. Facials Duplicates -> Facial at Home
  {
    parentSlug: "facial-at-home",
    childSlugs: ["professional-facial", "premium-glow-facial"],
    ensureVariants: [
      {
        name: "Fruit / Herbal Glow Facial",
        price: 999,
        offerPrice: 849,
        duration: "60 mins",
        sortOrder: 1,
      },
      {
        name: "Cheryl's Cosmeceuticals Glow Facial",
        price: 1499,
        offerPrice: 1299,
        duration: "75 mins",
        sortOrder: 2,
      },
      {
        name: "O3+ Bridal Brightening & De-Tan",
        price: 1999,
        offerPrice: 1699,
        duration: "90 mins",
        sortOrder: 3,
      },
      {
        name: "24K Gold Luxury Radiance Facial",
        price: 2499,
        offerPrice: 2099,
        duration: "90 mins",
        sortOrder: 4,
      },
      {
        name: "Diamond Illuminating Anti-Ageing Facial",
        price: 2999,
        offerPrice: 2499,
        duration: "90 mins",
        sortOrder: 5,
      },
    ],
  },

  // 4. Face Cleanup Duplicate -> Classic Cleanup
  {
    parentSlug: "classic-cleanup",
    childSlugs: ["professional-face-cleanup"],
    ensureVariants: [
      {
        name: "Classic Herbal Cleanup",
        price: 599,
        offerPrice: 499,
        duration: "40 mins",
        sortOrder: 1,
      },
      {
        name: "Professional Deep Pore & De-Tan Cleanup",
        price: 799,
        offerPrice: 699,
        duration: "50 mins",
        sortOrder: 2,
      },
    ],
  },

  // 5. Party Makeup Duplicates -> Party Makeup & Hair Styling
  {
    parentSlug: "party-makeup-and-hair",
    childSlugs: [
      "flawless-party-makeup-hair-styling",
      "hd-party-makeup",
      "airbrush-party-makeup",
      "luxe-glam-up-makeup",
    ],
    ensureVariants: [
      {
        name: "Soft Daylight Glam Party Look",
        price: 2499,
        offerPrice: 1999,
        duration: "75 mins",
        sortOrder: 1,
      },
      {
        name: "HD Celebrity Party Makeup & Hair",
        price: 3499,
        offerPrice: 2999,
        duration: "90 mins",
        sortOrder: 2,
      },
      {
        name: "Airbrush High-Def Party Glam",
        price: 4499,
        offerPrice: 3999,
        duration: "90 mins",
        sortOrder: 3,
      },
      {
        name: "Cocktail & Sangeet Evening Glam",
        price: 4999,
        offerPrice: 4499,
        duration: "100 mins",
        sortOrder: 4,
      },
    ],
  },

  // 6. Engagement Makeup Duplicates -> Engagement Makeup
  {
    parentSlug: "engagement-makeup",
    childSlugs: ["hd-engagement-makeup", "airbrush-engagement-makeup"],
    ensureVariants: [
      {
        name: "Classic Radiance Engagement Look",
        price: 4499,
        offerPrice: 3999,
        duration: "120 mins",
        sortOrder: 1,
      },
      {
        name: "HD Ring Ceremony Engagement Glam",
        price: 6999,
        offerPrice: 5999,
        duration: "150 mins",
        sortOrder: 2,
      },
      {
        name: "Ultra Airbrush Engagement Perfection",
        price: 8999,
        offerPrice: 7999,
        duration: "150 mins",
        sortOrder: 3,
      },
    ],
  },

  // 7. Bridal Makeup Duplicate -> Bridal Makeup (Classic)
  {
    parentSlug: "bridal-makeup-artist",
    childSlugs: ["classic-bridal-makeup"],
    ensureVariants: [
      {
        name: "Classic Bridal Radiance Look",
        price: 9999,
        offerPrice: 8499,
        duration: "180 mins",
        sortOrder: 1,
      },
      {
        name: "Signature Royal Heritage Bridal Look",
        price: 12000,
        offerPrice: 10999,
        duration: "210 mins",
        sortOrder: 2,
      },
    ],
  },

  // 8. Bridal Hair Styling Duplicate -> Bridal & Festive Hair Styling
  {
    parentSlug: "bridal-hair-styling",
    childSlugs: ["bridal-hairstyling-advanced-hairdo"],
    ensureVariants: [
      {
        name: "Festive Textured Bun or Braid",
        price: 1799,
        offerPrice: 1499,
        duration: "45 mins",
        sortOrder: 1,
      },
      {
        name: "Classic Floral Bridal Bun",
        price: 2499,
        offerPrice: 2199,
        duration: "60 mins",
        sortOrder: 2,
      },
      {
        name: "Hollywood Glam Waves / Advanced Hairdo",
        price: 2999,
        offerPrice: 2599,
        duration: "75 mins",
        sortOrder: 3,
      },
      {
        name: "Traditional South Indian Jadai & Floral Styling",
        price: 3499,
        offerPrice: 2999,
        duration: "90 mins",
        sortOrder: 4,
      },
    ],
  },

  // 9. Unnecessary / Awkward Waxing Standalone Pages -> Full Body Waxing
  {
    parentSlug: "full-body-waxing-at-home",
    childSlugs: ["breast-waxing", "stomach-waxing"],
  },

  // 10. Half Back Waxing Duplicate -> Full Back Waxing
  {
    parentSlug: "full-back-waxing",
    childSlugs: ["half-back-waxing"],
    ensureVariants: [
      {
        name: "Full Back Rica Waxing",
        price: 349,
        offerPrice: 299,
        duration: "25 mins",
        sortOrder: 1,
      },
      {
        name: "Half Back Rica Waxing",
        price: 249,
        offerPrice: 199,
        duration: "15 mins",
        sortOrder: 2,
      },
    ],
  },
];

async function main() {
  console.log("Starting catalog deduplication & cleanup...");

  let mergedCount = 0;
  let redirectsCreated = 0;

  for (const rule of MERGE_RULES) {
    const parent = await prisma.service.findUnique({
      where: { slug: rule.parentSlug },
      select: { id: true, title: true, slug: true, leadCount: true },
    });

    if (!parent) {
      console.warn(`[WARN] Parent service not found: ${rule.parentSlug}`);
      continue;
    }

    let additionalLeads = 0;

    for (const childSlug of rule.childSlugs) {
      const child = await prisma.service.findUnique({
        where: { slug: childSlug },
        select: {
          id: true,
          title: true,
          slug: true,
          leadCount: true,
          status: true,
          mergedIntoId: true,
        },
      });

      if (!child) {
        console.log(`[SKIP] Child service not found (may already be removed): ${childSlug}`);
        continue;
      }

      additionalLeads += child.leadCount;

      // Retire child service
      await prisma.service.update({
        where: { id: child.id },
        data: {
          status: "INACTIVE",
          mergedIntoId: parent.id,
        },
      });

      // Create permanent 301 Redirect
      const fromPath = `/services/${child.slug}`;
      const toPath = `/services/${parent.slug}`;

      await prisma.redirect.upsert({
        where: { fromPath },
        update: {
          toPath,
          code: "MOVED_301",
          note: `Merged duplicate "${child.title}" into "${parent.title}"`,
        },
        create: {
          fromPath,
          toPath,
          code: "MOVED_301",
          note: `Merged duplicate "${child.title}" into "${parent.title}"`,
        },
      });

      redirectsCreated++;
      mergedCount++;
      console.log(
        `✓ Merged: "${child.title}" (/services/${child.slug}) -> "${parent.title}" (/services/${parent.slug})`
      );
    }

    // Roll up leads and ensure parent is active
    await prisma.service.update({
      where: { id: parent.id },
      data: {
        status: "ACTIVE",
        mergedIntoId: null,
        leadCount: { increment: additionalLeads },
      },
    });

    // Seed or update rich variants on parent if defined
    if (rule.ensureVariants && rule.ensureVariants.length > 0) {
      for (const v of rule.ensureVariants) {
        const existing = await prisma.serviceVariant.findFirst({
          where: { serviceId: parent.id, name: v.name },
        });

        if (existing) {
          await prisma.serviceVariant.update({
            where: { id: existing.id },
            data: {
              price: v.price,
              offerPrice: v.offerPrice ?? null,
              duration: v.duration ?? null,
              sortOrder: v.sortOrder,
            },
          });
        } else {
          await prisma.serviceVariant.create({
            data: {
              serviceId: parent.id,
              name: v.name,
              price: v.price,
              offerPrice: v.offerPrice ?? null,
              duration: v.duration ?? null,
              sortOrder: v.sortOrder,
            },
          });
        }
      }
    }
  }

  // Summary
  const remainingActive = await prisma.service.count({
    where: { status: "ACTIVE", mergedIntoId: null },
  });
  const totalRetired = await prisma.service.count({
    where: { OR: [{ status: "INACTIVE" }, { mergedIntoId: { not: null } }] },
  });

  console.log("\n=======================================================");
  console.log(`✓ Cleanup Complete!`);
  console.log(`  Merged services: ${mergedCount}`);
  console.log(`  301 Redirects created: ${redirectsCreated}`);
  console.log(`  Active public services: ${remainingActive}`);
  console.log(`  Retired / Merged services: ${totalRetired}`);
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("Error during service deduplication:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
