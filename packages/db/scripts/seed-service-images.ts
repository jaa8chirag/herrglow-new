/**
 * Maps high-resolution photography to all active services across the 11 Master Categories.
 */

import { prisma } from "../src/index.js";

const CATEGORY_IMAGE_DEFAULTS: Record<string, string> = {
  "face-hair-removal": "/images/services/facial-at-home.jpg",
  "waxing": "/images/services/full-body-waxing-at-home.jpg",
  "bleach-detan": "/images/services/facial-at-home.jpg",
  "facials": "/images/services/facial-at-home.jpg",
  "manicure-pedicure": "/images/services/classic-manicure-pedicure.jpg",
  "nail-studio": "/images/services/gel-nail-extensions.jpg",
  "hair": "/images/services/hair-spa-at-home.jpg",
  "makeup": "/images/services/party-makeup-and-hair.jpg",
  "mehendi": "/images/packages/sangeet-family-glam-package.jpg",
  "body-care-spa": "/images/packages/pre-bridal-glow-package.jpg",
  "bridal": "/images/services/bridal-makeup-artist.jpg",
};

const SPECIFIC_SERVICE_IMAGES: Record<string, string> = {
  // Bridal
  "hd-bridal-makeup": "/images/services/hd-bridal-makeup.jpg",
  "airbrush-bridal-makeup": "/images/services/airbrush-bridal-makeup.jpg",
  "traditional-bridal-makeup": "/images/services/bridal-makeup-artist.jpg",
  "bridal-makeup-trial": "/images/services/bridal-makeup-artist.jpg",
  "1-month-pre-bridal-package": "/images/packages/complete-bridal-package.jpg",
  "2-month-pre-bridal-package": "/images/packages/pre-bridal-glow-package.jpg",
  "3-month-pre-bridal-package": "/images/packages/complete-bridal-package.jpg",
  "bride-s-family-package": "/images/packages/sangeet-family-glam-package.jpg",

  // Makeup & Styling
  "hairstyling-buns-braids-curls": "/images/services/bridal-hair-styling.jpg",
  "saree-draping": "/images/services/bridal-hair-styling.jpg",
  "dupatta-lehenga-draping": "/images/services/bridal-hair-styling.jpg",
  "glam-party-makeup": "/images/services/party-makeup-and-hair.jpg",
  "light-party-makeup": "/images/services/party-makeup-and-hair.jpg",
  "engagement-makeup": "/images/services/party-makeup-and-hair.jpg",
  "reception-makeup": "/images/services/party-makeup-and-hair.jpg",
  "family-makeup-package": "/images/packages/sangeet-family-glam-package.jpg",
  "bridesmaids-makeup-package": "/images/services/party-makeup-and-hair.jpg",

  // Hair
  "hair-spa": "/images/services/hair-spa-at-home.jpg",
  "hair-mask": "/images/services/hair-spa-at-home.jpg",
  "anti-dandruff-treatment": "/images/services/hair-spa-at-home.jpg",
  "blow-dry": "/images/services/bridal-hair-styling.jpg",
  "womens-haircut": "/images/services/bridal-hair-styling.jpg",
  "hair-ironing": "/images/services/bridal-hair-styling.jpg",
  "hair-tonging": "/images/services/bridal-hair-styling.jpg",
  "global-hair-colour": "/images/services/hair-spa-at-home.jpg",

  // Waxing
  "full-body-waxing": "/images/services/full-body-waxing-at-home.jpg",
  "full-arms-waxing": "/images/services/full-body-waxing-at-home.jpg",
  "full-legs-waxing": "/images/services/full-body-waxing-at-home.jpg",
  "full-bikini-waxing": "/images/services/full-body-waxing-at-home.jpg",

  // Facials
  "fruit-cleanup": "/images/services/facial-at-home.jpg",
  "anti-tan-cleanup": "/images/services/facial-at-home.jpg",
  "charcoal-cleanup": "/images/services/facial-at-home.jpg",
  "vitamin-c-cleanup": "/images/services/facial-at-home.jpg",
  "fruit-facial": "/images/services/facial-at-home.jpg",
  "gold-facial": "/images/services/facial-at-home.jpg",
  "o3-facial": "/images/services/facial-at-home.jpg",
  "korean-glass-skin-facial": "/images/services/facial-at-home.jpg",
  "bridal-glow-facial": "/images/services/facial-at-home.jpg",

  // Nails & Feet
  "classic-manicure": "/images/services/classic-manicure-pedicure.jpg",
  "classic-pedicure": "/images/services/classic-manicure-pedicure.jpg",
  "mani-pedi-combo": "/images/services/classic-manicure-pedicure.jpg",
  "spa-pedicure": "/images/services/classic-manicure-pedicure.jpg",
  "crystal-spa-pedicure": "/images/services/classic-manicure-pedicure.jpg",
  "gel-nail-extensions": "/images/services/gel-nail-extensions.jpg",

  // Mehendi
  "bridal-mehendi": "/images/packages/sangeet-family-glam-package.jpg",
  "simple-mehendi": "/images/packages/sangeet-family-glam-package.jpg",
  "arabic-mehendi": "/images/packages/sangeet-family-glam-package.jpg",

  // Body Spa
  "body-polishing": "/images/packages/pre-bridal-glow-package.jpg",
  "body-scrub": "/images/packages/pre-bridal-glow-package.jpg",
  "head-neck-shoulder-massage": "/images/packages/pre-bridal-glow-package.jpg",
};

async function main() {
  console.log("Assigning curated high-resolution photos to all services across the master catalogue...");
  const services = await prisma.service.findMany({
    where: { mergedIntoId: null },
    include: { category: true },
  });

  let assignedCount = 0;
  for (const svc of services) {
    const specificImage = SPECIFIC_SERVICE_IMAGES[svc.slug];
    const categoryDefault = CATEGORY_IMAGE_DEFAULTS[svc.category.slug];
    const chosenImage = specificImage || svc.image || categoryDefault;

    if (chosenImage) {
      await prisma.service.update({
        where: { id: svc.id },
        data: {
          image: chosenImage,
          imageAlt: `${svc.title} doorstep beauty service by HerrGlow`,
        },
      });
      assignedCount++;
    }
  }

  console.log(`\nSuccessfully assigned images to ${assignedCount} services! Every single service now has a real photo.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
