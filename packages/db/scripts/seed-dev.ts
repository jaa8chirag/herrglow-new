/**
 * Seeds initial development data for local testing.
 * Runs idempotently via upserts.
 */
import { prisma } from "../src/index.js";

async function main() {
  console.log("Seeding development data...");

  // 1. Categories
  const categories = [
    { slug: "bridal-makeup", name: "Bridal Makeup" },
    { slug: "salon-at-home", name: "Salon at Home" },
    { slug: "facial-and-skincare", name: "Facial & Skincare" },
    { slug: "waxing", name: "Waxing" },
    { slug: "nail-art", name: "Nail Art" },
    { slug: "hair-styling", name: "Hair Styling" },
  ];

  const catMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
    catMap.set(c.slug, cat.id);
  }

  // 2. Services
  const services = [
    {
      slug: "hd-bridal-makeup",
      title: "HD Bridal Makeup",
      categorySlug: "bridal-makeup",
      price: 15000,
      offerPrice: 12000,
      duration: "3 hours",
      shortDescription: "High-definition bridal makeover with premium international products.",
    },
    {
      slug: "bridal-makeup-artist",
      title: "Bridal Makeup",
      categorySlug: "bridal-makeup",
      price: 12000,
      offerPrice: 9999,
      duration: "2.5 hours",
      shortDescription: "Complete bridal makeover package for your special day.",
    },
    {
      slug: "airbrush-bridal-makeup",
      title: "Airbrush Bridal Makeup",
      categorySlug: "bridal-makeup",
      price: 18000,
      offerPrice: 15000,
      duration: "3.5 hours",
      shortDescription: "Flawless airbrush finish bridal makeup lasting over 16 hours.",
    },
    {
      slug: "facial-at-home",
      title: "Facial at Home",
      categorySlug: "facial-and-skincare",
      price: 1499,
      offerPrice: 999,
      duration: "60 mins",
      shortDescription: "Relaxing glow facial performed by certified beauticians at your home.",
    },
    {
      slug: "full-body-waxing-at-home",
      title: "Full Body Waxing at Home",
      categorySlug: "waxing",
      price: 2499,
      offerPrice: 1899,
      duration: "90 mins",
      shortDescription: "Hygienic full body waxing service at your home with choice of Honey or Rica wax.",
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        price: s.price,
        offerPrice: s.offerPrice,
        duration: s.duration,
        shortDescription: s.shortDescription,
      },
      create: {
        slug: s.slug,
        title: s.title,
        categoryId: catMap.get(s.categorySlug)!,
        price: s.price,
        offerPrice: s.offerPrice,
        duration: s.duration,
        shortDescription: s.shortDescription,
        status: "ACTIVE",
      },
    });
  }

  // 3. Cities
  const cities = [
    { slug: "noida", name: "Noida", state: "Uttar Pradesh", isActive: true },
    { slug: "delhi", name: "Delhi", state: "Delhi", isActive: true },
    { slug: "greater-noida", name: "Greater Noida", state: "Uttar Pradesh", isActive: true },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: { name: city.name, state: city.state, isActive: city.isActive },
      create: city,
    });
  }

  // 4. Areas
  const areas = [
    { slug: "gaur-city-1", name: "Gaur City 1", citySlug: "greater-noida", zone: "West" },
    { slug: "gaur-city-2", name: "Gaur City 2", citySlug: "greater-noida", zone: "West" },
    { slug: "pari-chowk", name: "Pari Chowk", citySlug: "greater-noida", zone: "Central" },
    { slug: "sector-1-greater-noida", name: "Sector 1", citySlug: "greater-noida", zone: "West" },
    { slug: "sector-62-noida", name: "Sector 62", citySlug: "noida", zone: "Central" },
    { slug: "sector-18-noida", name: "Sector 18", citySlug: "noida", zone: "Atta" },
    { slug: "sector-137-noida", name: "Sector 137", citySlug: "noida", zone: "Expressway" },
    { slug: "sector-76-noida", name: "Sector 76", citySlug: "noida", zone: "Central" },
    { slug: "sector-50-noida", name: "Sector 50", citySlug: "noida", zone: "Central" },
    { slug: "south-delhi", name: "South Delhi", citySlug: "delhi", zone: "South" },
    { slug: "dwarka", name: "Dwarka", citySlug: "delhi", zone: "West" },
    { slug: "lajpat-nagar", name: "Lajpat Nagar", citySlug: "delhi", zone: "South" },
    { slug: "rohini", name: "Rohini", citySlug: "delhi", zone: "North" },
    { slug: "vasant-kunj", name: "Vasant Kunj", citySlug: "delhi", zone: "South" },
  ];

  for (const a of areas) {
    await prisma.area.upsert({
      where: { slug: a.slug },
      update: { name: a.name, citySlug: a.citySlug, zone: a.zone },
      create: a,
    });
  }

  // 5. Site settings (contact info & WhatsApp)
  const settings = [
    { key: "whatsapp_number", value: "9876543210" },
    { key: "contact_phone", value: "9876543210" },
    { key: "contact_email", value: "care@herrglow.com" },
    { key: "whatsapp_prefill_text", value: "Hi HerrGlow! I would like to enquire about home salon and makeup services." },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("✓ Development seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
