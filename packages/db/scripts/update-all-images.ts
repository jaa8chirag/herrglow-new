import { prisma } from "../src/index.js";

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "bridal-makeup": "/images/services/hd-bridal-makeup.jpg",
  "engagement-party-makeup": "/images/services/party-makeup-and-hair.jpg",
  "pre-bridal-packages": "/images/packages/pre-bridal-glow-package.jpg",
  "draping-eye-mehndi": "/images/services/bridal-makeup-artist.jpg",
  "hair-styling": "/images/services/bridal-hair-styling.jpg",
  "facial-and-skincare": "/images/services/facial-at-home.jpg",
  "waxing": "/images/services/full-body-waxing-at-home.jpg",
  "nail-art": "/images/services/gel-nail-extensions.jpg",
};

// Specific tailored images for higher variety
const SPECIFIC_SERVICES: Record<string, string> = {
  "airbrush-bridal-makeup": "/images/services/airbrush-bridal-makeup.jpg",
  "bridal-makeup-artist": "/images/services/bridal-makeup-artist.jpg",
  "party-makeup-and-hair": "/images/services/party-makeup-and-hair.jpg",
  "facial-at-home": "/images/services/facial-at-home.jpg",
  "full-body-waxing-at-home": "/images/services/full-body-waxing-at-home.jpg",
  "hair-spa-at-home": "/images/services/hair-spa-at-home.jpg",
  "gel-nail-extensions": "/images/services/gel-nail-extensions.jpg",
  "classic-manicure-pedicure": "/images/services/classic-manicure-pedicure.jpg",
  "classic-manicure-at-home": "/images/services/classic-manicure-pedicure.jpg",
  "classic-pedicure-at-home": "/images/services/classic-manicure-pedicure.jpg",
  "bridal-hair-styling": "/images/services/bridal-hair-styling.jpg",
  "complete-bridal-package": "/images/packages/complete-bridal-package.jpg",
  "pre-bridal-glow-package": "/images/packages/pre-bridal-glow-package.jpg",
  "sangeet-family-glam-package": "/images/packages/sangeet-family-glam-package.jpg",
  "multi-function-wedding-makeup-package": "/images/packages/complete-bridal-package.jpg",
  "group-makeup-package": "/images/packages/sangeet-family-glam-package.jpg",
  "essential-glow-pre-bridal-package": "/images/packages/pre-bridal-glow-package.jpg",
  "luxe-party-glam-package": "/images/packages/sangeet-family-glam-package.jpg",
  "luxury-ultra-radiance-pre-bridal-package": "/images/packages/pre-bridal-glow-package.jpg",
};

async function main() {
  console.log("Starting full catalog image sync...");

  const services = await prisma.service.findMany({
    include: { category: true },
  });

  console.log(`Found ${services.length} services in DB.`);

  let updatedCount = 0;
  for (const s of services) {
    const specific = SPECIFIC_SERVICES[s.slug];
    const categoryDefault = CATEGORY_IMAGE_MAP[s.category.slug];
    const chosenImage = specific || categoryDefault || "/images/services/hd-bridal-makeup.jpg";

    if (s.image !== chosenImage) {
      await prisma.service.update({
        where: { id: s.id },
        data: { image: chosenImage },
      });
      updatedCount++;
    }
  }

  console.log(`Updated images for ${updatedCount} services.`);

  // Verify all 79 have an image
  const remainingMissing = await prisma.service.count({
    where: { image: null },
  });
  console.log(`Services with missing images now: ${remainingMissing}`);

  // Sync packages table too
  const packages = await prisma.package.findMany();
  for (const p of packages) {
    const pkgImg = SPECIFIC_SERVICES[p.slug] || "/images/packages/complete-bridal-package.jpg";
    await prisma.package.update({
      where: { id: p.id },
      data: { image: pkgImg },
    });
  }
  console.log(`Synced ${packages.length} rows in Package table.`);

  // Check Pros
  const pros = await prisma.pro.findMany({
    select: { name: true, photo: true },
  });
  console.log("Pros verified:", pros);

  console.log("FULL CATALOG IMAGE INTEGRATION COMPLETE!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
