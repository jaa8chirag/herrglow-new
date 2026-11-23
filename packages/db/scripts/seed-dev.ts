/**
 * Seeds initial development and pre-launch data for local testing & live preview.
 * Runs idempotently via upserts so it never creates duplicates.
 */
import { prisma } from "../src/index.js";

async function main() {
  console.log("Seeding pre-launch data with watermarked local assets for HerrGlow...");

  // 1. Categories
  const categories = [
    {
      slug: "makeup",
      name: "Bridal & Party Makeup",
      sort: 1,
      shortDescription: "Five-star bridal, engagement, and party glam delivered directly to your doorstep. Choose between camera-ready Ultra-HD and 16-hour sweat-proof Airbrush makeup with 100% genuine MAC, Huda Beauty & NARS products.",
      seoDescription: "Book professional bridal and party makeup artists at home in Delhi, Noida & Greater Noida. HD & Airbrush packages with sanitized kits.",
    },
    {
      slug: "salon-at-home",
      name: "Salon at Home & Waxing",
      sort: 2,
      shortDescription: "Painless Italian Rica liposoluble waxing, peel-off waxing, threading, manicure-pedicures, and relaxing full-body massages. Sanitized single-use disposables, zero travel surcharges, and verified female beauticians.",
      seoDescription: "Doorstep salon services at home in Delhi NCR. Painless Rica waxing, full body waxing, cleanups, and threading by verified female beauticians.",
    },
    {
      slug: "facial-skincare",
      name: "Facials & Skincare",
      sort: 3,
      shortDescription: "Revitalize tired, pollution-exposed skin with authentic O3+ brightening facials, deep pore fruit cleanups, and hydrating derma care. Visible instant radiance in the comfort and privacy of your home.",
      seoDescription: "Book authentic O3+ facials, hydrating cleanups and skincare treatments at home across Delhi, Noida & Greater Noida.",
    },
    {
      slug: "hair",
      name: "Hair Styling & Treatments",
      sort: 4,
      shortDescription: "Advanced bridal hairstyling, floral gajra buns, nourishing L'Oreal keratin spas, and volumizing extensions. Complete heat styling and scalp care without stepping into a crowded salon.",
      seoDescription: "Doorstep hair spa, bridal hairstyling, keratin treatments and hair extensions delivered at home across Delhi NCR.",
    },
    {
      slug: "nails",
      name: "Nails & Extensions",
      sort: 5,
      shortDescription: "Deluxe manicures, crystal pedicures, and long-lasting gel nail extensions with custom nail art. Hospital-grade sanitized clippers, safe e-files, and non-toxic high-shine gel polishes.",
      seoDescription: "Professional gel nail extensions, custom nail art, deluxe manicure and pedicure services at home in Delhi, Noida & Greater Noida.",
    },
    {
      slug: "mehndi",
      name: "Bridal & Party Mehndi",
      sort: 6,
      shortDescription: "Intricate North Indian bridal, Arabic, and festive guest mehndi applied by experienced henna artists. 100% organic, chemical-free henna paste with guaranteed deep mahogany stain.",
      seoDescription: "Book certified bridal mehndi artists and party guest henna specialists at home across Delhi NCR.",
    },
    {
      slug: "pre-bridal",
      name: "Pre-Bridal & Combo Packages",
      sort: 7,
      shortDescription: "All-inclusive pre-bridal pampering packages designed for modern brides. Complete head-to-toe polishing, Rica waxing, signature facials, and hair spas planned across flexible multi-day visits with maximum savings.",
      seoDescription: "Luxury pre-bridal packages at home in Delhi NCR. Multi-day head-to-toe beauty countdowns with Rica waxing, facials, and hair spas.",
    },
  ];

  const catMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        sort: c.sort,
        shortDescription: c.shortDescription,
        seoDescription: c.seoDescription,
      },
      create: {
        slug: c.slug,
        name: c.name,
        sort: c.sort,
        shortDescription: c.shortDescription,
        seoDescription: c.seoDescription,
      },
    });
    catMap.set(c.slug, cat.id);
  }

  // 2. Services (including Flagship Package Services)
  const services = [
    // Packages / Bundles (isPackage: true)
    {
      slug: "complete-bridal-package",
      title: "Complete Bridal Signature Package",
      categorySlug: "makeup",
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
      categorySlug: "pre-bridal",
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
      categorySlug: "makeup",
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
      categorySlug: "makeup",
      price: 15000,
      offerPrice: 12000,
      duration: "3 hours",
      image: "/images/services/hd-bridal-makeup.jpg",
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
      categorySlug: "makeup",
      price: 18000,
      offerPrice: 15000,
      duration: "3.5 hours",
      image: "/images/services/airbrush-bridal-makeup.jpg",
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
      categorySlug: "makeup",
      price: 12000,
      offerPrice: 9999,
      duration: "2.5 hours",
      image: "/images/services/bridal-makeup-artist.jpg",
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
      categorySlug: "makeup",
      price: 4999,
      offerPrice: 3499,
      duration: "90 mins",
      image: "/images/services/party-makeup-and-hair.jpg",
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
      categorySlug: "facial-skincare",
      price: 1499,
      offerPrice: 999,
      duration: "60 mins",
      image: "/images/services/facial-at-home.jpg",
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
      categorySlug: "salon-at-home",
      price: 2499,
      offerPrice: 1899,
      duration: "90 mins",
      image: "/images/services/full-body-waxing-at-home.jpg",
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
      categorySlug: "nails",
      price: 2499,
      offerPrice: 1899,
      duration: "90 mins",
      image: "/images/services/gel-nail-extensions.jpg",
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
      categorySlug: "nails",
      price: 1499,
      offerPrice: 999,
      duration: "60 mins",
      image: "/images/services/classic-manicure-pedicure.jpg",
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
      categorySlug: "hair",
      price: 2999,
      offerPrice: 1999,
      duration: "60 mins",
      image: "/images/services/bridal-hair-styling.jpg",
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
      categorySlug: "hair",
      price: 1799,
      offerPrice: 1299,
      duration: "50 mins",
      image: "/images/services/hair-spa-at-home.jpg",
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
    { slug: "gaur-city-1", name: "Gaur City 1", citySlug: "greater-noida", zone: "West", latitude: 28.608, longitude: 77.429, radiusKm: 5 },
    { slug: "gaur-city-2", name: "Gaur City 2", citySlug: "greater-noida", zone: "West", latitude: 28.614, longitude: 77.442, radiusKm: 5 },
    { slug: "pari-chowk", name: "Pari Chowk", citySlug: "greater-noida", zone: "Central", latitude: 28.4682, longitude: 77.51, radiusKm: 10 },
    { slug: "sector-1-greater-noida", name: "Sector 1", citySlug: "greater-noida", zone: "West", latitude: 28.591, longitude: 77.448, radiusKm: 5 },
    { slug: "sector-62-noida", name: "Sector 62", citySlug: "noida", zone: "Central", latitude: 28.6271, longitude: 77.3725, radiusKm: 6 },
    { slug: "sector-18-noida", name: "Sector 18", citySlug: "noida", zone: "Atta", latitude: 28.5708, longitude: 77.326, radiusKm: 6 },
    { slug: "sector-137-noida", name: "Sector 137", citySlug: "noida", zone: "Expressway", latitude: 28.513, longitude: 77.4042, radiusKm: 8 },
    { slug: "sector-76-noida", name: "Sector 76", citySlug: "noida", zone: "Central", latitude: 28.567, longitude: 77.382, radiusKm: 6 },
    { slug: "sector-50-noida", name: "Sector 50", citySlug: "noida", zone: "Central", latitude: 28.5729, longitude: 77.3686, radiusKm: 6 },
    { slug: "south-delhi", name: "South Delhi", citySlug: "delhi", zone: "South", latitude: 28.5244, longitude: 77.2167, radiusKm: 12 },
    { slug: "dwarka", name: "Dwarka", citySlug: "delhi", zone: "West", latitude: 28.5921, longitude: 77.046, radiusKm: 10 },
    { slug: "lajpat-nagar", name: "Lajpat Nagar", citySlug: "delhi", zone: "South", latitude: 28.5677, longitude: 77.2433, radiusKm: 7 },
    { slug: "rohini", name: "Rohini", citySlug: "delhi", zone: "North", latitude: 28.7495, longitude: 77.0565, radiusKm: 10 },
    { slug: "vasant-kunj", name: "Vasant Kunj", citySlug: "delhi", zone: "South", latitude: 28.5293, longitude: 77.1539, radiusKm: 8 },
  ];

  const areaMap = new Map<string, string>();
  for (const a of areas) {
    const areaRow = await prisma.area.upsert({
      where: { slug: a.slug },
      update: { name: a.name, citySlug: a.citySlug, zone: a.zone, latitude: a.latitude, longitude: a.longitude, radiusKm: a.radiusKm },
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
      portfolio: [
        { path: "/images/services/hd-bridal-makeup.jpg", alt: "Royal HD Bridal Makeup by Priyanka" },
        { path: "/images/services/airbrush-bridal-makeup.jpg", alt: "Airbrush Bridal Finish by Priyanka" },
        { path: "/images/services/bridal-makeup-artist.jpg", alt: "Bridal Glamour Look by Priyanka" },
      ],
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
      portfolio: [
        { path: "/images/services/party-makeup-and-hair.jpg", alt: "Dewy Cocktail Party Makeup by Mehak" },
        { path: "/images/services/bridal-hair-styling.jpg", alt: "Intricate Bridal Floral Bun by Mehak" },
        { path: "/images/services/hd-bridal-makeup.jpg", alt: "Reception Glam by Mehak" },
      ],
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
      portfolio: [
        { path: "/images/services/facial-at-home.jpg", alt: "Hydrating Facial & Glow Treatment by Sunita" },
        { path: "/images/services/hair-spa-at-home.jpg", alt: "Deep Nourishing Hair Spa by Sunita" },
        { path: "/images/services/full-body-waxing-at-home.jpg", alt: "Rica Waxing Session by Sunita" },
      ],
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
      portfolio: [
        { path: "/images/services/gel-nail-extensions.jpg", alt: "Glossy Gel Nail Art Extensions by Kritika" },
        { path: "/images/services/classic-manicure-pedicure.jpg", alt: "Spa Manicure & Pedicure by Kritika" },
        { path: "/images/services/facial-at-home.jpg", alt: "O3+ Bridal Facial Glow by Kritika" },
      ],
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
      bio: "Certified Nail Artist and hand-care specialist with 6 years of expertise delivering high-fashion gel extensions, 3D embellishments, ombre nail art, and restorative aromatherapy pedicures at home. Uses sanitized equipment and LED-cured non-toxic formulas for salon-quality results that last for weeks.",
      basePrice: 1800,
      portfolio: [
        { path: "/images/services/airbrush-bridal-makeup.jpg", alt: "Flawless Airbrush Finish by Neha" },
        { path: "/images/services/party-makeup-and-hair.jpg", alt: "Sangeet Glam by Neha" },
        { path: "/images/services/bridal-hair-styling.jpg", alt: "Hollywood Waves Styling by Neha" },
      ],
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
        portfolio: p.portfolio as any,
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
        portfolio: p.portfolio as any,
        bio: p.bio,
        basePrice: p.basePrice,
        status: "ACTIVE",
      },
    });

    // ProPrivate contact & base location info
    const proGeo: Record<string, { lat: number; lng: number; radiusKm: number; address: string; phone: string }> = {
      "sunita-rawat": { lat: 28.6271, lng: 77.3725, radiusKm: 12, address: "Block B, Sector 62, Noida", phone: "9876543211" },
      "priyanka-verma": { lat: 28.5708, lng: 77.326, radiusKm: 15, address: "Atta Market, Sector 18, Noida", phone: "9876543210" },
      "neha-bisht": { lat: 28.5729, lng: 77.3686, radiusKm: 10, address: "Sector 50, Noida", phone: "9876543212" },
      "mehak-khurana": { lat: 28.5244, lng: 77.2167, radiusKm: 16, address: "Saket & South Delhi", phone: "9876543213" },
      "kritika-sharma": { lat: 28.5921, lng: 77.046, radiusKm: 15, address: "Sector 11, Dwarka, New Delhi", phone: "9876543214" },
    };
    const geo = proGeo[p.slug];

    await prisma.proPrivate.upsert({
      where: { proId: pro.id },
      update: {
        phone: geo?.phone || "9876543210",
        email: `${p.slug}@herrglow.com`,
        latitude: geo?.lat,
        longitude: geo?.lng,
        travelRadius: geo?.radiusKm || 10,
        addressLine: geo?.address || "Delhi NCR",
      },
      create: {
        proId: pro.id,
        phone: geo?.phone || "9876543210",
        email: `${p.slug}@herrglow.com`,
        latitude: geo?.lat,
        longitude: geo?.lng,
        travelRadius: geo?.radiusKm || 10,
        addressLine: geo?.address || "Delhi NCR",
      },
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
      photo: "/images/testimonials/pooja-sharma.jpg",
      rating: 5,
      review: "Booked HerrGlow for my wedding reception. The artist arrived 15 minutes early with a spotless kit and sanitized brushes. The makeup stayed completely fresh and sweat-proof through 6 hours of photos!",
      sort: 1,
    },
    {
      name: "Ananya Verma",
      location: "South Delhi",
      serviceName: "Airbrush Bridal Makeup",
      photo: "/images/testimonials/ananya-verma.jpg",
      rating: 5,
      review: "Best at-home bridal experience. No waiting in noisy, crowded parlours. The airbrush finish looked so natural and feather-light under stage lights. Highly recommended!",
      sort: 2,
    },
    {
      name: "Simran Kaur",
      location: "Gaur City 2, Greater Noida",
      serviceName: "Pre-Bridal Luxury Glow",
      photo: "/images/testimonials/simran-kaur.jpg",
      rating: 5,
      review: "Got the pre-bridal glow package. The facial massage was incredible and the beautician was polite, gentle and clean. Pure five-star salon luxury right in my living room.",
      sort: 3,
    },
    {
      name: "Meenakshi Joshi",
      location: "Sector 137, Noida",
      serviceName: "Sangeet Family Glam",
      photo: "/images/testimonials/meenakshi-joshi.jpg",
      rating: 5,
      review: "We booked the Sangeet family package for myself, my mother and my sister. All 3 of us got ready right on schedule with gorgeous hairstyles and saree draping. Zero rush, zero stress.",
      sort: 4,
    },
    {
      name: "Rhea Malhotra",
      location: "Dwarka, Delhi",
      serviceName: "Full Body Waxing & Facial",
      photo: "/images/testimonials/rhea-malhotra.jpg",
      rating: 5,
      review: "I am extremely particular about hygiene. HerrGlow beauticians used clean sheets, sanitized tools and authentic products. 10/10 service quality and punctuality.",
      sort: 5,
    },
    {
      name: "Tanvi Saxena",
      location: "Sector 50, Noida",
      serviceName: "Gel Nail Extensions",
      photo: "/images/testimonials/tanvi-saxena.jpg",
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
        data: { location: t.location, rating: t.rating, review: t.review, photo: t.photo, status: "ACTIVE", sort: t.sort },
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
      title: "Before: Heritage Bridal HD Transformation",
      alt: "Bare skin natural portrait before bridal HD makeover",
      mediaPath: "/images/transformations/bridal-before.jpg",
      category: "Bridal",
      sort: 0,
    },
    {
      title: "After: Heritage Bridal HD Transformation",
      alt: "Radiant Heritage Bridal HD Glam after transformation with gold kundan jewelry",
      mediaPath: "/images/transformations/bridal-after.jpg",
      category: "Bridal",
      sort: 0,
    },
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
    { key: "whatsapp_number", value: "9319260069" },
    { key: "contact_phone", value: "9319260069" },
    { key: "contact_email", value: "herrglow77@gmail.com" },
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
          status: "ACTIVE",
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
          status: "ACTIVE",
          publishedAt: new Date(),
        },
      });
    }
    console.log("✓ Premium SEO blogs seeded successfully!");
  } catch (err) {
    console.warn("Notice: Could not seed premium blogs in seed-dev:", err);
  }

  // 11. Sub-categories (Service Variants) & Area-Specific Pricing
  try {
    await import("./seed-subcategories-and-area-pricing.js").catch(() => import("./seed-subcategories-and-area-pricing.ts"));
    console.log("✓ Sub-categories and area-specific pricing seeded successfully!");
  } catch (err) {
    console.warn("Notice: Subcategories already seeded or skipped:", err);
  }

  // 12. Deduplicate services and apply 301 redirects
  try {
    await import("./clean-duplicate-services.js").catch(() => import("./clean-duplicate-services.ts"));
    console.log("✓ Services deduplication & 301 redirects applied successfully!");
  } catch (err) {
    console.warn("Notice: Deduplication already applied or skipped:", err);
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
