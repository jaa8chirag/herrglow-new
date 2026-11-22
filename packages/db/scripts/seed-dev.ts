/**
 * Seeds initial development and pre-launch data for local testing & live preview.
 * Runs idempotently via upserts so it never creates duplicates.
 */
import { prisma } from "../src/index.js";

async function main() {
  console.log("Seeding pre-launch data with watermarked local assets for HerrGlow...");

  // 1. Categories
  const categories = [
    { slug: "bridal-makeup", name: "Bridal & Wedding Makeup", sort: 1 },
    { slug: "engagement-party-makeup", name: "Engagement, Pre-Wedding & Party Makeup", sort: 2 },
    { slug: "pre-bridal-packages", name: "Pre-Bridal & Combo Packages", sort: 3 },
    { slug: "draping-eye-mehndi", name: "Draping, Eye Makeup & Mehndi", sort: 4 },
    { slug: "hair-styling", name: "Hair Styling & Treatments", sort: 5 },
    { slug: "facial-and-skincare", name: "Facials, Skin & Body Care (Salon at Home)", sort: 6 },
    { slug: "waxing", name: "Waxing (Salon at Home)", sort: 7 },
    { slug: "nail-art", name: "Manicure, Pedicure & Nails (Salon at Home)", sort: 8 },
  ];

  const catMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sort: c.sort },
      create: { slug: c.slug, name: c.name, sort: c.sort },
    });
    catMap.set(c.slug, cat.id);
  }

  // 2. Services (including Flagship Package Services)
  const services = [
    // Packages / Bundles (isPackage: true)
    {
      slug: "complete-bridal-package",
      title: "Complete Bridal Signature Package",
      categorySlug: "bridal-makeup",
      price: 24999,
      offerPrice: 19999,
      duration: "4–5 hours",
      image: "/images/packages/complete-bridal-package.jpg",
      shortDescription: "All-inclusive luxury bridal experience: HD/Airbrush makeup, luxury hairstyling, draping, and lashes.",
      features: "HD or Airbrush Bridal Makeup; Luxury Hairstyle with Floral Styling; Saree / Dupatta Draping & Jewellery Setting; Complimentary Pre-Bridal Skin Prep; Mink Eyelashes & Lens Application Included",
      isPackage: true,
      featured: true,
      leadCount: 16,
      sort: 1,
    },
    {
      slug: "pre-bridal-glow-package",
      title: "Pre-Bridal Luxury Glow Package",
      categorySlug: "salon-at-home",
      price: 10999,
      offerPrice: 7999,
      duration: "3.5 hours",
      image: "/images/packages/pre-bridal-glow-package.jpg",
      shortDescription: "Head-to-toe pre-wedding pampering with luxury facial, full body Rica waxing, body polishing, and mani-pedi.",
      features: "O3+ Bridal Glow Facial & De-Tan; Full Body Waxing (Rica Wax); Full Body Scrub & Skin Polishing; Crystal Spa Manicure & Pedicure; Deep Conditioning Hair Spa",
      isPackage: true,
      featured: true,
      leadCount: 10,
      sort: 2,
    },
    {
      slug: "sangeet-family-glam-package",
      title: "Sangeet & Family Glam Bundle",
      categorySlug: "bridal-makeup",
      price: 17999,
      offerPrice: 13999,
      duration: "3 hours",
      image: "/images/packages/sangeet-family-glam-package.jpg",
      shortDescription: "Party & cocktail glam for bride's family or friends (up to 3 persons) with certified senior artists.",
      features: "Party / Cocktail Makeup for 3 Persons; Hair Styling (Curls / Messy Bun / Straightening); Saree / Dupatta Draping for All 3; International Waterproof Cosmetics; Doorstep Travel Included",
      isPackage: true,
      featured: true,
      leadCount: 8,
      sort: 3,
    },

    // Individual Services
    {
      slug: "hd-bridal-makeup",
      title: "HD Bridal Makeup",
      categorySlug: "bridal-makeup",
      price: 15000,
      offerPrice: 12000,
      duration: "3 hours",
      image: "/images/packages/complete-bridal-package.jpg",
      shortDescription: "High-definition bridal makeover with premium international products for photography perfection.",
      features: "Full Face HD Base; Glam Smokey or Cut-Crease Eyes; Natural Lashes & Lens Placement; Dupatta Draping; Hair Styling Included",
      isPackage: false,
      featured: true,
      leadCount: 22,
      sort: 4,
    },
    {
      slug: "airbrush-bridal-makeup",
      title: "Airbrush Bridal Makeup",
      categorySlug: "bridal-makeup",
      price: 18000,
      offerPrice: 15000,
      duration: "3.5 hours",
      image: "/images/packages/complete-bridal-package.jpg",
      shortDescription: "Flawless airbrush finish bridal makeup lasting over 16 hours with zero transfer.",
      features: "Silicon Airbrush Base Application; High Definition Contouring; Waterproof 16-Hour Wear; Intricate Bridal Hairstyle; Complete Draping",
      isPackage: false,
      featured: true,
      leadCount: 19,
      sort: 5,
    },
    {
      slug: "bridal-makeup-artist",
      title: "Bridal Makeup",
      categorySlug: "bridal-makeup",
      price: 12000,
      offerPrice: 9999,
      duration: "2.5 hours",
      image: "/images/packages/complete-bridal-package.jpg",
      shortDescription: "Complete bridal makeover package for your special day with sanitized brushes and luxury brands.",
      features: "Bridal Base; Traditional or Modern Eye Glam; Hair Styling with Accessories; Jewellery Fitting; Draping",
      isPackage: false,
      featured: false,
      leadCount: 14,
      sort: 6,
    },
    {
      slug: "party-makeup-and-hair",
      title: "Party Makeup & Hair Styling",
      categorySlug: "bridal-makeup",
      price: 4999,
      offerPrice: 3499,
      duration: "90 mins",
      image: "/images/packages/sangeet-family-glam-package.jpg",
      shortDescription: "Glamorous party makeover for sangeet, cocktails, receptions, and special family gatherings.",
      features: "Dewy / Matte HD Base; Glam Eye Makeup & Lashes; Creative Hair Styling; Dupatta Draping",
      isPackage: false,
      featured: true,
      leadCount: 18,
      sort: 7,
    },
    {
      slug: "facial-at-home",
      title: "Facial at Home",
      categorySlug: "facial-and-skincare",
      price: 1499,
      offerPrice: 999,
      duration: "60 mins",
      image: "/images/packages/pre-bridal-glow-package.jpg",
      shortDescription: "Relaxing glow facial performed by certified beauticians with organic, skin-nourishing serums.",
      features: "Deep Pore Cleansing & Steaming; Gentle Exfoliation & Blackhead Removal; Relaxing Facial & Neck Massage; Brightening Herbal Peel-Off Mask",
      isPackage: false,
      featured: true,
      leadCount: 25,
      sort: 8,
    },
    {
      slug: "full-body-waxing-at-home",
      title: "Full Body Waxing at Home",
      categorySlug: "waxing",
      price: 2499,
      offerPrice: 1899,
      duration: "90 mins",
      image: "/images/packages/pre-bridal-glow-package.jpg",
      shortDescription: "Hygienic full body waxing service at your home with choice of Honey or Rica wax.",
      features: "Disposable Sheets & Wooden Spatulas; Full Arms, Underarms, Full Legs & Stomach; Pre & Post Wax Soothing Lotions",
      isPackage: false,
      featured: true,
      leadCount: 30,
      sort: 9,
    },
    {
      slug: "gel-nail-extensions",
      title: "Gel Nail Extensions & Custom Art",
      categorySlug: "nail-art",
      price: 2499,
      offerPrice: 1899,
      duration: "90 mins",
      image: "/images/pros/neha-bisht.jpg",
      shortDescription: "Long-lasting gel extensions with custom nail art, chrome, or ombre finishes.",
      features: "Tip or Form Extension; Choice of Ombre / French / Chrome; High-Shine UV Top Coat; Cuticle Care Included",
      isPackage: false,
      featured: true,
      leadCount: 12,
      sort: 10,
    },
    {
      slug: "classic-manicure-pedicure",
      title: "Deluxe Manicure & Pedicure at Home",
      categorySlug: "nail-art",
      price: 1499,
      offerPrice: 999,
      duration: "60 mins",
      image: "/images/packages/pre-bridal-glow-package.jpg",
      shortDescription: "Deep cleansing, organic scrub, massage, and nail shaping in the comfort of your living room.",
      features: "Aromatherapy Foot Soak; Dead Skin Exfoliation; Relaxing Hand & Foot Massage; Choice of Long-Wear Polish",
      isPackage: false,
      featured: false,
      leadCount: 15,
      sort: 11,
    },
    {
      slug: "bridal-hair-styling",
      title: "Bridal & Festive Hair Styling",
      categorySlug: "hair-styling",
      price: 2999,
      offerPrice: 1999,
      duration: "60 mins",
      image: "/images/pros/kritika-sharma.jpg",
      shortDescription: "Intricate buns, Hollywood waves, floral braiding, and traditional Indian wedding hairstyles.",
      features: "Textured Buns / Romantic Waves; Real Flower / Accessory Setting; Heat Protection & Hold Spray; Extension Placement",
      isPackage: false,
      featured: true,
      leadCount: 11,
      sort: 12,
    },
    {
      slug: "hair-spa-at-home",
      title: "Nourishing Hair Spa & Scalp Massage",
      categorySlug: "hair-styling",
      price: 1799,
      offerPrice: 1299,
      duration: "50 mins",
      image: "/images/packages/pre-bridal-glow-package.jpg",
      shortDescription: "Deep conditioning hair mask with warm steam and relaxing head, neck, and shoulder massage.",
      features: "Deep Conditioning Cream Mask; Scalp Stimulation & Head Massage; Steam Therapy; Blow-Dry Finish",
      isPackage: false,
      featured: false,
      leadCount: 9,
      sort: 13,
    },
  ];

  const serviceMap = new Map<string, string>();
  for (const s of services) {
    const row = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        price: s.price,
        offerPrice: s.offerPrice,
        duration: s.duration,
        image: s.image,
        shortDescription: s.shortDescription,
        features: s.features,
        isPackage: s.isPackage,
        featured: s.featured,
        leadCount: s.leadCount,
        sort: s.sort,
      },
      create: {
        slug: s.slug,
        title: s.title,
        categoryId: catMap.get(s.categorySlug)!,
        price: s.price,
        offerPrice: s.offerPrice,
        duration: s.duration,
        image: s.image,
        shortDescription: s.shortDescription,
        features: s.features,
        isPackage: s.isPackage,
        featured: s.featured,
        leadCount: s.leadCount,
        sort: s.sort,
        status: "ACTIVE",
      },
    });
    serviceMap.set(s.slug, row.id);
  }

  // 3. Packages (Package table)
  const packages = [
    {
      slug: "complete-bridal-package",
      title: "Complete Bridal Signature Package",
      price: 24999,
      offerPrice: 19999,
      duration: "4–5 hours",
      image: "/images/packages/complete-bridal-package.jpg",
      shortDescription: "All-inclusive luxury bridal experience: HD/Airbrush makeup, luxury hairstyling, draping, and lashes.",
      description: "Designed for the bride who wants absolute perfection without salon chaos. Our senior artists bring professional lighting, sanitized luxury brushes, and top international brands (Huda Beauty, MAC, NARS, Charlotte Tilbury) directly to your bridal suite.",
      linkedServices: ["hd-bridal-makeup", "bridal-hair-styling"],
    },
    {
      slug: "pre-bridal-glow-package",
      title: "Pre-Bridal Luxury Glow Package",
      price: 10999,
      offerPrice: 7999,
      duration: "3.5 hours",
      image: "/images/packages/pre-bridal-glow-package.jpg",
      shortDescription: "Head-to-toe pre-wedding pampering with luxury facial, full body Rica waxing, body polishing, and mani-pedi.",
      description: "A relaxing head-to-toe pre-wedding regimen executed in total hygiene. We use disposable bedsheets, single-use wax cartridges, and gentle organic exfoliators.",
      linkedServices: ["facial-at-home", "full-body-waxing-at-home", "classic-manicure-pedicure"],
    },
    {
      slug: "sangeet-family-glam-package",
      title: "Sangeet & Family Glam Bundle",
      price: 17999,
      offerPrice: 13999,
      duration: "3 hours",
      image: "/images/packages/sangeet-family-glam-package.jpg",
      shortDescription: "Party & cocktail glam for bride's family or friends (up to 3 persons) with certified senior artists.",
      description: "The easiest way to get the mother of the bride, bridesmaids, and sisters ready together on time with zero rush.",
      linkedServices: ["party-makeup-and-hair"],
    },
  ];

  for (const p of packages) {
    const pkg = await prisma.package.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        price: p.price,
        offerPrice: p.offerPrice,
        duration: p.duration,
        image: p.image,
        shortDescription: p.shortDescription,
        description: p.description,
        status: "ACTIVE",
      },
      create: {
        slug: p.slug,
        title: p.title,
        price: p.price,
        offerPrice: p.offerPrice,
        duration: p.duration,
        image: p.image,
        shortDescription: p.shortDescription,
        description: p.description,
        status: "ACTIVE",
      },
    });

    for (const serviceSlug of p.linkedServices) {
      const sId = serviceMap.get(serviceSlug);
      if (sId) {
        await prisma.packageService.upsert({
          where: { packageId_serviceId: { packageId: pkg.id, serviceId: sId } },
          update: {},
          create: { packageId: pkg.id, serviceId: sId },
        });
      }
    }
  }

  // 4. Cities
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

  // 5. Areas
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

  const areaMap = new Map<string, string>();
  for (const a of areas) {
    const areaRow = await prisma.area.upsert({
      where: { slug: a.slug },
      update: { name: a.name, citySlug: a.citySlug, zone: a.zone },
      create: a,
    });
    areaMap.set(a.slug, areaRow.id);
  }

  // 6. Verified Professionals (Pros) with Watermarked Local Portraits
  // Bio length >= 50 words to meet the production SEO indexability rule
  const pros = [
    {
      slug: "priyanka-verma",
      name: "Priyanka Verma",
      providerType: "MAKEOVER_ARTIST" as const,
      experienceYears: 9,
      specialization: "Celebrity Bridal HD & Airbrush Makeup",
      photo: "/images/pros/priyanka-verma.jpg",
      bio: "Senior Bridal Makeup Specialist certified by London College of Make-up with over 9 years of experience glamming brides across Delhi NCR. Known for flawless skin finishes, customized HD palettes, and long-lasting waterproof looks tailored to traditional and modern Indian weddings. Brings professional lighting, sanitized brushes, and international luxury cosmetics directly to your doorstep.",
      basePrice: 12000,
      coveredAreas: ["sector-62-noida", "sector-18-noida", "sector-50-noida", "gaur-city-1", "gaur-city-2", "pari-chowk"],
      offeredServices: ["hd-bridal-makeup", "airbrush-bridal-makeup", "bridal-makeup-artist", "complete-bridal-package", "party-makeup-and-hair"],
    },
    {
      slug: "mehak-khurana",
      name: "Mehak Khurana",
      providerType: "MAKEOVER_ARTIST" as const,
      experienceYears: 7,
      specialization: "Airbrush Glam & Modern Cocktail Looks",
      photo: "/images/pros/mehak-khurana.jpg",
      bio: "Editorial and bridal makeup artist specializing in high-definition airbrush techniques, soft cut-crease eyes, and modern Bollywood reception glam. With 7 years of on-location bridal experience across South Delhi, Central Noida, and Gurgaon, Mehak brings an exacting standard of hygiene and camera-ready luxury directly to your wedding suite or home.",
      basePrice: 10000,
      coveredAreas: ["south-delhi", "vasant-kunj", "lajpat-nagar", "sector-50-noida", "sector-137-noida"],
      offeredServices: ["airbrush-bridal-makeup", "hd-bridal-makeup", "sangeet-family-glam-package", "party-makeup-and-hair"],
    },
    {
      slug: "sunita-rawat",
      name: "Sunita Rawat",
      providerType: "BEAUTICIAN" as const,
      experienceYears: 11,
      specialization: "Luxury Facials, Rica Waxing & Body Polishing",
      photo: "/images/pros/sunita-rawat.jpg",
      bio: "Master Aesthetician and Skincare Specialist with over 11 years of salon experience. Trained extensively in advanced dermaceutical facials, painless Rica waxing rituals, and pre-bridal organic body polishing. Dedicated to creating a relaxing, spa-grade sanctuary in the comfort and privacy of client homes with hospital-grade sanitization protocols.",
      basePrice: 1500,
      coveredAreas: ["sector-62-noida", "sector-76-noida", "gaur-city-1", "sector-1-greater-noida", "south-delhi", "dwarka"],
      offeredServices: ["facial-at-home", "full-body-waxing-at-home", "pre-bridal-glow-package", "classic-manicure-pedicure"],
    },
    {
      slug: "kritika-sharma",
      name: "Kritika Sharma",
      providerType: "BOTH" as const,
      experienceYears: 8,
      specialization: "Bridal Hair Styling, Draping & Glow Makeovers",
      photo: "/images/pros/kritika-sharma.jpg",
      bio: "Comprehensive bridal stylist trained in both couture hairstyling and HD party makeovers. Renowned across Delhi NCR for intricate textured buns, cascading romantic waves, floral hair accents, and saree draping. Her warm demeanor and meticulous timing ensure a stress-free, luxurious wedding morning for every bride and family.",
      basePrice: 3500,
      coveredAreas: ["dwarka", "rohini", "lajpat-nagar", "sector-18-noida", "pari-chowk"],
      offeredServices: ["bridal-hair-styling", "hair-spa-at-home", "party-makeup-and-hair", "complete-bridal-package", "sangeet-family-glam-package"],
    },
    {
      slug: "neha-bisht",
      name: "Neha Bisht",
      providerType: "BEAUTICIAN" as const,
      experienceYears: 6,
      specialization: "Gel Nail Extensions, Nail Art & Mani-Pedi",
      photo: "/images/pros/neha-bisht.jpg",
      bio: "Certified Nail Artist and hand-care specialist with 6 years of expertise delivering high-fashion gel extensions, 3D embellishments, ombre nail art, and restorative aromatherapy pedicures at home. Uses sterile single-use disposable kits and LED-cured non-toxic formulas for salon-quality results that last for weeks.",
      basePrice: 1800,
      coveredAreas: ["sector-50-noida", "sector-137-noida", "south-delhi", "vasant-kunj", "sector-62-noida"],
      offeredServices: ["gel-nail-extensions", "classic-manicure-pedicure", "facial-at-home", "pre-bridal-glow-package"],
    },
  ];

  for (const p of pros) {
    const pro = await prisma.pro.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        providerType: p.providerType,
        experienceYears: p.experienceYears,
        specialization: p.specialization,
        photo: p.photo,
        bio: p.bio,
        basePrice: p.basePrice,
        status: "ACTIVE",
      },
      create: {
        slug: p.slug,
        name: p.name,
        providerType: p.providerType,
        experienceYears: p.experienceYears,
        specialization: p.specialization,
        photo: p.photo,
        bio: p.bio,
        basePrice: p.basePrice,
        status: "ACTIVE",
      },
    });

    // ProPrivate contact info
    await prisma.proPrivate.upsert({
      where: { proId: pro.id },
      update: { phone: "9876543210", email: `${p.slug}@herrglow.com` },
      create: { proId: pro.id, phone: "9876543210", email: `${p.slug}@herrglow.com` },
    });

    // Coverage in areas
    for (const aSlug of p.coveredAreas) {
      const aId = areaMap.get(aSlug);
      if (aId) {
        await prisma.proCoverage.upsert({
          where: { proId_areaId: { proId: pro.id, areaId: aId } },
          update: {},
          create: { proId: pro.id, areaId: aId },
        });
      }
    }

    // Offered services
    for (const sSlug of p.offeredServices) {
      const sId = serviceMap.get(sSlug);
      if (sId) {
        await prisma.proService.upsert({
          where: { proId_serviceId: { proId: pro.id, serviceId: sId } },
          update: {},
          create: { proId: pro.id, serviceId: sId },
        });
      }
    }

    // Indexable Page record for each pro
    await prisma.page.upsert({
      where: { url: `/artists/${p.slug}` },
      update: {
        type: "PRO",
        entityId: p.slug,
        isIndexable: true,
        inSitemap: true,
        qualityScore: 90,
      },
      create: {
        url: `/artists/${p.slug}`,
        type: "PRO",
        entityId: p.slug,
        isIndexable: true,
        inSitemap: true,
        qualityScore: 90,
      },
    });
  }

  // 7. Testimonials (Customer Reviews)
  const testimonials = [
    {
      name: "Pooja Sharma",
      location: "Sector 62, Noida",
      serviceName: "HD Bridal Makeup",
      rating: 5,
      review: "Booked HerrGlow for my wedding reception. The artist arrived 15 minutes early with a spotless kit and sanitized brushes. The makeup stayed completely fresh and sweat-proof through 6 hours of photos!",
      sort: 1,
    },
    {
      name: "Ananya Verma",
      location: "South Delhi",
      serviceName: "Airbrush Bridal Makeup",
      rating: 5,
      review: "Best at-home bridal experience. No waiting in noisy, crowded parlours. The airbrush finish looked so natural and feather-light under stage lights. Highly recommended!",
      sort: 2,
    },
    {
      name: "Simran Kaur",
      location: "Gaur City 2, Greater Noida",
      serviceName: "Pre-Bridal Luxury Glow",
      rating: 5,
      review: "Got the pre-bridal glow package. The facial massage was incredible and the beautician was polite, gentle and clean. Pure five-star salon luxury right in my living room.",
      sort: 3,
    },
    {
      name: "Meenakshi Joshi",
      location: "Sector 137, Noida",
      serviceName: "Sangeet Family Glam",
      rating: 5,
      review: "We booked the Sangeet family package for myself, my mother and my sister. All 3 of us got ready right on schedule with gorgeous hairstyles and saree draping. Zero rush, zero stress.",
      sort: 4,
    },
    {
      name: "Rhea Malhotra",
      location: "Dwarka, Delhi",
      serviceName: "Full Body Waxing & Facial",
      rating: 5,
      review: "I am extremely particular about hygiene. HerrGlow beauticians used disposable sheets, sealed cartridges and wooden spatulas. 10/10 service quality and punctuality.",
      sort: 5,
    },
    {
      name: "Tanvi Saxena",
      location: "Sector 50, Noida",
      serviceName: "Gel Nail Extensions",
      rating: 5,
      review: "Flawless gel extensions and custom French ombre art right at my dining table! Saved me 3 hours of driving and parking in Noida traffic.",
      sort: 6,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name, serviceName: t.serviceName } });
    if (existing) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: { location: t.location, rating: t.rating, review: t.review, status: "ACTIVE", sort: t.sort },
      });
    } else {
      await prisma.testimonial.create({
        data: { ...t, status: "ACTIVE" },
      });
    }
  }

  // 8. Gallery Items (Portfolio Looks for Homepage)
  const galleryItems = [
    {
      title: "Royal Heritage Bridal Glam",
      alt: "Heritage bridal makeup with traditional gold jewellery and red lehenga",
      mediaPath: "/images/packages/complete-bridal-package.jpg",
      category: "Bridal",
      sort: 1,
    },
    {
      title: "Dewy Cocktail Reception Glow",
      alt: "Dewy soft glam with romantic Hollywood waves and winged liner",
      mediaPath: "/images/packages/sangeet-family-glam-package.jpg",
      category: "Party",
      sort: 2,
    },
    {
      title: "Doorstep Salon Pampering",
      alt: "At-home facial and skincare session with gentle organic creams",
      mediaPath: "/images/packages/pre-bridal-glow-package.jpg",
      category: "Salon",
      sort: 3,
    },
    {
      title: "Modern Minimalist Haldi Look",
      alt: "Natural dewy skin with soft peach lips and floral hair accessories",
      mediaPath: "/images/pros/mehak-khurana.jpg",
      category: "Bridal",
      sort: 4,
    },
  ];

  for (const g of galleryItems) {
    const existing = await prisma.galleryItem.findFirst({ where: { title: g.title } });
    if (existing) {
      await prisma.galleryItem.update({
        where: { id: existing.id },
        data: { alt: g.alt, mediaPath: g.mediaPath, category: g.category, status: "ACTIVE", sort: g.sort },
      });
    } else {
      await prisma.galleryItem.create({
        data: { ...g, status: "ACTIVE" },
      });
    }
  }

  // 9. Site Settings (Contact Info)
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

  // 10. Premium SEO Blogs
  try {
    const { PREMIUM_BLOGS } = await import("./seed-blogs.js").catch(() => import("./seed-blogs.ts"));
    for (const b of PREMIUM_BLOGS) {
      await prisma.blog.upsert({
        where: { slug: b.slug },
        update: {
          title: b.title,
          seoTitle: b.seoTitle,
          seoDescription: b.seoDescription,
          excerpt: b.excerpt,
          content: b.content,
          authorName: b.authorName,
          image: b.image,
          imageAlt: b.imageAlt,
          status: "PUBLISHED",
        },
        create: {
          slug: b.slug,
          title: b.title,
          seoTitle: b.seoTitle,
          seoDescription: b.seoDescription,
          excerpt: b.excerpt,
          content: b.content,
          authorName: b.authorName,
          image: b.image,
          imageAlt: b.imageAlt,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    }
    console.log("✓ Premium SEO blogs seeded successfully!");
  } catch (err) {
    console.warn("Notice: Could not seed premium blogs in seed-dev:", err);
  }

  console.log("✓ Pre-launch seeding with watermarked images completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
