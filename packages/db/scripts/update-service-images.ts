import { prisma } from "../src/index.js";

const SERVICE_IMAGES: Record<string, string> = {
  "hd-bridal-makeup": "/images/services/hd-bridal-makeup.jpg",
  "airbrush-bridal-makeup": "/images/services/airbrush-bridal-makeup.jpg",
  "bridal-makeup-artist": "/images/services/bridal-makeup-artist.jpg",
  "party-makeup-and-hair": "/images/services/party-makeup-and-hair.jpg",
  "facial-at-home": "/images/services/facial-at-home.jpg",
  "full-body-waxing-at-home": "/images/services/full-body-waxing-at-home.jpg",
  "hair-spa-at-home": "/images/services/hair-spa-at-home.jpg",
  "gel-nail-extensions": "/images/services/gel-nail-extensions.jpg",
  "classic-manicure-pedicure": "/images/services/classic-manicure-pedicure.jpg",
  "bridal-hair-styling": "/images/services/bridal-hair-styling.jpg",
};

async function main() {
  console.log("Updating service image paths in database...");
  for (const [slug, image] of Object.entries(SERVICE_IMAGES)) {
    const updated = await prisma.service.updateMany({
      where: { slug },
      data: { image },
    });
    console.log(`Updated ${slug} -> ${image} (${updated.count} row(s))`);
  }
  console.log("All service image paths updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
