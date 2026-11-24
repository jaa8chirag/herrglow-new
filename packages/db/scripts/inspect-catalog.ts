import { prisma } from "../src";

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { services: true } },
      services: {
        take: 5,
        select: {
          slug: true,
          title: true,
          price: true,
          offerPrice: true,
          variants: { select: { name: true, price: true, offerPrice: true } },
        },
      },
    },
    orderBy: { sort: "asc" },
  });

  console.log("=== CATEGORIES & SAMPLES ===");
  for (const c of categories) {
    console.log(`\nCategory: ${c.name} (${c.slug}) - Total Services: ${c._count.services}`);
    for (const s of c.services) {
      console.log(
        `  - ${s.title} (₹${s.offerPrice ?? s.price}) [variants: ${s.variants.map((v) => `${v.name}: ₹${v.offerPrice ?? v.price}`).join(", ") || "none"}]`
      );
    }
  }

  const cities = await prisma.city.findMany({
    include: {
      _count: { select: { areas: true, services: true } },
      areas: { take: 5, select: { slug: true, name: true } },
    },
  });

  console.log("\n=== CITIES & AREAS ===");
  for (const city of cities) {
    console.log(
      `City: ${city.name} (${city.slug}) - Areas: ${city._count.areas}, Services: ${city._count.services}`
    );
    console.log(`  Sample areas: ${city.areas.map((a) => a.name).join(", ")}`);
  }

  const serviceCityCount = await prisma.serviceCity.count();
  const serviceCityOverrides = await prisma.serviceCity.count({
    where: { priceOverride: { not: null } },
  });
  console.log(`\n=== SERVICE CITIES ===`);
  console.log(
    `Total ServiceCity links: ${serviceCityCount}, with price overrides: ${serviceCityOverrides}`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
