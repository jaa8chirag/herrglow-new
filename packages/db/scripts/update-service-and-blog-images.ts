import { prisma } from "../src";

async function main() {
  console.log("Updating service and blog images with newly generated luxury assets...");

  // 1. Update Monthly Grooming Essentials Package
  await prisma.service.update({
    where: { slug: "monthly-grooming-essentials-package" },
    data: {
      image: "/images/packages/monthly-grooming-essentials-package.jpg",
      imageAlt: "Monthly Grooming Essentials Package at home with waxing, threading and fruit cleanup",
    },
  });
  console.log("Updated monthly-grooming-essentials-package image.");

  // 2. Update Fruit Cleanup service image if service exists
  const fruitCleanup = await prisma.service.findFirst({
    where: { slug: "fruit-cleanup" },
  });
  if (fruitCleanup) {
    await prisma.service.update({
      where: { id: fruitCleanup.id },
      data: {
        image: "/images/services/fruit-cleanup.jpg",
        imageAlt: "Fruit Glow Facial Cleanup at home by HerrGlow",
      },
    });
    console.log("Updated fruit-cleanup service image.");
  }

  // 3. Update Blogs with custom dedicated editorial images
  await prisma.blog.updateMany({
    where: { slug: "rica-wax-vs-honey-wax-sensitive-skin-guide" },
    data: {
      image: "/images/blogs/rica-wax-vs-honey-wax.jpg",
    },
  });
  console.log("Updated rica-wax-vs-honey-wax blog image.");

  await prisma.blog.updateMany({
    where: { slug: "facial-vs-cleanup-difference-skincare-guide" },
    data: {
      image: "/images/blogs/facial-vs-cleanup.jpg",
    },
  });
  console.log("Updated facial-vs-cleanup blog image.");
}

main()
  .catch((e) => {
    console.error("Failed to update images:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
