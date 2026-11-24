import { prisma } from "../src";

async function main() {
  console.log("Seeding Monthly Grooming Essentials Package and Wax Type Variants...");

  // 1. Find Waxing Category
  const waxingCategory = await prisma.category.findFirst({
    where: { slug: "waxing" },
  });

  if (!waxingCategory) {
    throw new Error("Waxing category not found in DB!");
  }

  // 2. Upsert "monthly-grooming-essentials-package" service
  const monthlyPkg = await prisma.service.upsert({
    where: { slug: "monthly-grooming-essentials-package" },
    update: {
      title: "Monthly Grooming Essentials Package (Waxing, Threading & Glow Cleanup)",
      shortDescription:
        "Delhi NCR's #1 monthly maintenance ritual. Includes Full Arms & Full Legs Waxing, Underarms, Eyebrow & Upper Lip Threading, plus an Instant Glow Face Cleanup at home.",
      description:
        "Designed specifically for Delhi NCR working women and homemakers. Get complete monthly salon maintenance done in one relaxing 75-minute doorstep appointment. Our certified female beautician arrives with sanitized tools, authentic products, and disposable sheets.",
      features:
        "Full Arms Waxing • Full Legs Waxing • Underarms Waxing • Eyebrow Threading + Upper Lip • Fruit Glow / Anti-Tan Face Cleanup • 100% Free Doorstep Travel",
      whatsIncluded: [
        "Full Arms Waxing (Honey or Rica White Chocolate)",
        "Full Legs Waxing (Honey or Rica White Chocolate)",
        "Underarms Waxing Included",
        "Eyebrow Threading & Upper Lip Grooming",
        "Fruit Glow / Anti-Tan Brightening Face Cleanup",
        "Relaxing Head & Shoulder acupressure touch (5 min)",
        "100% Free Doorstep Travel across Delhi NCR",
        "Sanitized tools & hygienic disposable setup included",
      ],
      price: 1599,
      offerPrice: 999,
      duration: "75 min",
      durationMins: 75,
      isPackage: true,
      isPopular: true,
      leadCount: 42,
      status: "ACTIVE",
      categoryId: waxingCategory.id,
      image: "/images/packages/monthly-grooming-essentials-package.jpg",
      imageAlt: "Monthly Grooming Essentials Package at home in Delhi NCR",
      seoTitle:
        "Monthly Salon Package at Home in Delhi NCR | Waxing, Threading & Facial Cleanup | HerrGlow",
      seoDescription:
        "Book monthly salon grooming at home across Noida, Delhi & Greater Noida. Full arms & legs waxing, threading, and glow cleanup for ₹999 with 100% Free Doorstep Travel.",
    },
    create: {
      slug: "monthly-grooming-essentials-package",
      title: "Monthly Grooming Essentials Package (Waxing, Threading & Glow Cleanup)",
      shortDescription:
        "Delhi NCR's #1 monthly maintenance ritual. Includes Full Arms & Full Legs Waxing, Underarms, Eyebrow & Upper Lip Threading, plus an Instant Glow Face Cleanup at home.",
      description:
        "Designed specifically for Delhi NCR working women and homemakers. Get complete monthly salon maintenance done in one relaxing 75-minute doorstep appointment. Our certified female beautician arrives with sanitized tools, authentic products, and disposable sheets.",
      features:
        "Full Arms Waxing • Full Legs Waxing • Underarms Waxing • Eyebrow Threading + Upper Lip • Fruit Glow / Anti-Tan Face Cleanup • 100% Free Doorstep Travel",
      whatsIncluded: [
        "Full Arms Waxing (Honey or Rica White Chocolate)",
        "Full Legs Waxing (Honey or Rica White Chocolate)",
        "Underarms Waxing Included",
        "Eyebrow Threading & Upper Lip Grooming",
        "Fruit Glow / Anti-Tan Brightening Face Cleanup",
        "Relaxing Head & Shoulder acupressure touch (5 min)",
        "100% Free Doorstep Travel across Delhi NCR",
        "Sanitized tools & hygienic disposable setup included",
      ],
      price: 1599,
      offerPrice: 999,
      duration: "75 min",
      durationMins: 75,
      isPackage: true,
      isPopular: true,
      leadCount: 42,
      status: "ACTIVE",
      categoryId: waxingCategory.id,
      image: "/images/packages/monthly-grooming-essentials-package.jpg",
      imageAlt: "Monthly Grooming Essentials Package at home in Delhi NCR",
      seoTitle:
        "Monthly Salon Package at Home in Delhi NCR | Waxing, Threading & Facial Cleanup | HerrGlow",
      seoDescription:
        "Book monthly salon grooming at home across Noida, Delhi & Greater Noida. Full arms & legs waxing, threading, and glow cleanup for ₹999 with 100% Free Doorstep Travel.",
    },
  });

  // Delete previous variants for monthly pkg to ensure clean slate
  await prisma.serviceVariant.deleteMany({
    where: { serviceId: monthlyPkg.id },
  });

  await prisma.serviceVariant.createMany({
    data: [
      {
        serviceId: monthlyPkg.id,
        name: "Honey Regular Wax Edition (Budget Essential)",
        price: 1499,
        offerPrice: 999,
      },
      {
        serviceId: monthlyPkg.id,
        name: "Rica White Chocolate (Painless & Anti-Tan)",
        price: 1899,
        offerPrice: 1299,
      },
      {
        serviceId: monthlyPkg.id,
        name: "Rica Roll-On Cartridge (Zero-Spill & Hygienic)",
        price: 1999,
        offerPrice: 1399,
      },
    ],
  });

  console.log("Monthly Grooming Essentials Package seeded successfully:", monthlyPkg.id);

  // 3. Update Wax Variants on Core Waxing Services
  const coreWaxServices = [
    {
      slug: "full-arms-waxing",
      variants: [
        { name: "Honey Regular Smooth Wax", price: 299, offerPrice: 249 },
        { name: "Rica White Chocolate (Painless & Anti-Tan)", price: 449, offerPrice: 349 },
        { name: "Rica Roll-On Cartridge (Zero-Spill)", price: 499, offerPrice: 399 },
      ],
    },
    {
      slug: "full-legs-waxing",
      variants: [
        { name: "Honey Regular Smooth Wax", price: 449, offerPrice: 399 },
        { name: "Rica White Chocolate (Painless & Anti-Tan)", price: 649, offerPrice: 499 },
        { name: "Rica Roll-On Cartridge (Zero-Spill)", price: 699, offerPrice: 549 },
      ],
    },
    {
      slug: "underarms-waxing",
      variants: [
        { name: "Honey Regular Wax", price: 149, offerPrice: 99 },
        { name: "Rica White Chocolate Wax", price: 199, offerPrice: 149 },
        { name: "Rica Roll-On Wax", price: 249, offerPrice: 179 },
      ],
    },
    {
      slug: "full-body-waxing-at-home",
      variants: [
        { name: "Honey Regular Smooth Wax", price: 1799, offerPrice: 1299 },
        { name: "Rica White Chocolate (Painless & Anti-Tan)", price: 2499, offerPrice: 1899 },
        { name: "Rica Roll-On Cartridge (Zero-Spill)", price: 2799, offerPrice: 2199 },
        { name: "Full Body Rica + Brazilian Peel-off", price: 3299, offerPrice: 2599 },
      ],
    },
  ];

  for (const s of coreWaxServices) {
    const svc = await prisma.service.findFirst({ where: { slug: s.slug } });
    if (svc) {
      await prisma.serviceVariant.deleteMany({ where: { serviceId: svc.id } });
      await prisma.serviceVariant.createMany({
        data: s.variants.map((v) => ({
          serviceId: svc.id,
          name: v.name,
          price: v.price,
          offerPrice: v.offerPrice,
        })),
      });
      console.log(`Updated wax variants for ${s.slug}`);
    }
  }

  // 4. Ensure Page table has entry for monthly-grooming-essentials-package
  await prisma.page.upsert({
    where: { url: "/services/waxing/monthly-grooming-essentials-package" },
    update: {
      type: "SERVICE",
      entityId: monthlyPkg.id,
      isIndexable: true,
      inSitemap: true,
      seoTitle:
        "Monthly Salon Package at Home in Delhi NCR | Waxing, Threading & Facial Cleanup | HerrGlow",
      seoDescription:
        "Book monthly salon grooming at home across Noida, Delhi & Greater Noida. Full arms & legs waxing, threading, and glow cleanup for ₹999 with 100% Free Doorstep Travel.",
    },
    create: {
      url: "/services/waxing/monthly-grooming-essentials-package",
      type: "SERVICE",
      entityId: monthlyPkg.id,
      isIndexable: true,
      inSitemap: true,
      seoTitle:
        "Monthly Salon Package at Home in Delhi NCR | Waxing, Threading & Facial Cleanup | HerrGlow",
      seoDescription:
        "Book monthly salon grooming at home across Noida, Delhi & Greater Noida. Full arms & legs waxing, threading, and glow cleanup for ₹999 with 100% Free Doorstep Travel.",
    },
  });

  console.log("Page table entry verified!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
