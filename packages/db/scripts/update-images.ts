import { prisma } from "../src";

async function main() {
  console.log("Updating Database Image References...");

  // 1. Gallery Items: Add Before/After transformation pair
  // First check if pair already exists
  const existingBefore = await prisma.galleryItem.findFirst({
    where: { title: "Before: Heritage Bridal HD Transformation" }
  });

  if (!existingBefore) {
    await prisma.galleryItem.create({
      data: {
        title: "Before: Heritage Bridal HD Transformation",
        mediaType: "IMAGE",
        mediaPath: "/images/transformations/bridal-before.jpg",
        alt: "Bare skin natural portrait before bridal HD makeover",
        category: "Bridal",
        status: "ACTIVE",
        sort: 0,
      }
    });
  } else {
    await prisma.galleryItem.update({
      where: { id: existingBefore.id },
      data: {
        mediaPath: "/images/transformations/bridal-before.jpg",
        status: "ACTIVE",
        sort: 0,
      }
    });
  }

  const existingAfter = await prisma.galleryItem.findFirst({
    where: { title: "After: Heritage Bridal HD Transformation" }
  });

  if (!existingAfter) {
    await prisma.galleryItem.create({
      data: {
        title: "After: Heritage Bridal HD Transformation",
        mediaType: "IMAGE",
        mediaPath: "/images/transformations/bridal-after.jpg",
        alt: "Radiant Heritage Bridal HD Glam after transformation with gold kundan jewelry",
        category: "Bridal",
        status: "ACTIVE",
        sort: 0,
      }
    });
  } else {
    await prisma.galleryItem.update({
      where: { id: existingAfter.id },
      data: {
        mediaPath: "/images/transformations/bridal-after.jpg",
        status: "ACTIVE",
        sort: 0,
      }
    });
  }

  // 2. Testimonials: Update client photos
  const testimonialMap: Record<string, string> = {
    "Pooja Sharma": "/images/testimonials/pooja-sharma.jpg",
    "Ananya Verma": "/images/testimonials/ananya-verma.jpg",
    "Simran Kaur": "/images/testimonials/simran-kaur.jpg",
    "Meenakshi Joshi": "/images/testimonials/meenakshi-joshi.jpg",
    "Rhea Malhotra": "/images/testimonials/rhea-malhotra.jpg",
    "Tanvi Saxena": "/images/testimonials/tanvi-saxena.jpg",
  };

  for (const [name, photo] of Object.entries(testimonialMap)) {
    const updated = await prisma.testimonial.updateMany({
      where: { name: { contains: name, mode: "insensitive" } },
      data: { photo }
    });
    console.log(`Updated testimonial photo for ${name}: ${updated.count} row(s)`);
  }

  // 3. Pros: Populate portfolio arrays
  const portfolios: Record<string, Array<{ path: string; alt: string }>> = {
    "priyanka-verma": [
      { path: "/images/services/hd-bridal-makeup.jpg", alt: "Royal HD Bridal Makeup by Priyanka" },
      { path: "/images/services/airbrush-bridal-makeup.jpg", alt: "Airbrush Bridal Finish by Priyanka" },
      { path: "/images/services/bridal-makeup-artist.jpg", alt: "Bridal Glamour Look by Priyanka" },
    ],
    "mehak-khurana": [
      { path: "/images/services/party-makeup-and-hair.jpg", alt: "Dewy Cocktail Party Makeup by Mehak" },
      { path: "/images/services/bridal-hair-styling.jpg", alt: "Intricate Bridal Floral Bun by Mehak" },
      { path: "/images/services/hd-bridal-makeup.jpg", alt: "Reception Glam by Mehak" },
    ],
    "sunita-rawat": [
      { path: "/images/services/facial-at-home.jpg", alt: "Hydrating Facial & Glow Treatment by Sunita" },
      { path: "/images/services/hair-spa-at-home.jpg", alt: "Deep Nourishing Hair Spa by Sunita" },
      { path: "/images/services/full-body-waxing-at-home.jpg", alt: "Rica Waxing Session by Sunita" },
    ],
    "kritika-sharma": [
      { path: "/images/services/gel-nail-extensions.jpg", alt: "Glossy Gel Nail Art Extensions by Kritika" },
      { path: "/images/services/classic-manicure-pedicure.jpg", alt: "Spa Manicure & Pedicure by Kritika" },
      { path: "/images/services/facial-at-home.jpg", alt: "O3+ Bridal Facial Glow by Kritika" },
    ],
    "neha-bisht": [
      { path: "/images/services/airbrush-bridal-makeup.jpg", alt: "Flawless Airbrush Finish by Neha" },
      { path: "/images/services/party-makeup-and-hair.jpg", alt: "Sangeet Glam by Neha" },
      { path: "/images/services/bridal-hair-styling.jpg", alt: "Hollywood Waves Styling by Neha" },
    ],
  };

  for (const [slug, portfolio] of Object.entries(portfolios)) {
    const updated = await prisma.pro.updateMany({
      where: { slug },
      data: { portfolio: portfolio as any }
    });
    console.log(`Updated portfolio for pro ${slug}: ${updated.count} row(s)`);
  }

  console.log("Database image update completed successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
