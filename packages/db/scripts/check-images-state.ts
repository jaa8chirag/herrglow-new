import { prisma } from "../src";

async function main() {
  const [gallery, testimonials, blogs, pros] = await Promise.all([
    prisma.galleryItem.findMany(),
    prisma.testimonial.findMany(),
    prisma.blog.findMany({ select: { slug: true, title: true, image: true, imageAlt: true } }),
    prisma.pro.findMany({ select: { slug: true, name: true, photo: true, portfolio: true } }),
  ]);

  console.log("=== GALLERY ITEMS ===");
  console.log(gallery.length ? gallery : "No gallery items");

  console.log("\n=== TESTIMONIALS ===");
  console.log(testimonials.map(t => ({ id: t.id, name: t.name, photo: t.photo, location: t.location })));

  console.log("\n=== BLOGS ===");
  console.log(blogs);

  console.log("\n=== PROS ===");
  console.log(pros);
}

main().catch(console.error).finally(() => prisma.$disconnect());
