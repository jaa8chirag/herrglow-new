import { prisma } from "../src";

interface VariantDef {
  name: string;
  price: number;
  offerPrice?: number;
  duration?: string;
}

const VARIANTS_BY_SERVICE: Record<string, VariantDef[]> = {
  // ── WAXING ──
  "full-body-waxing-at-home": [
    { name: "Honey / Regular Smooth Wax", price: 1799, offerPrice: 1299, duration: "60 mins" },
    { name: "Rica White Chocolate (Painless & Anti-Tan)", price: 2499, offerPrice: 1899, duration: "75 mins" },
    { name: "Rica Aloe Vera (Sensitive Skin)", price: 2699, offerPrice: 2099, duration: "75 mins" },
    { name: "Full Body Rica + Brazilian Peel-off", price: 3299, offerPrice: 2599, duration: "90 mins" },
  ],
  "full-arms-waxing": [
    { name: "Honey Regular Wax", price: 249, offerPrice: 199, duration: "20 mins" },
    { name: "Rica White Chocolate Wax", price: 399, offerPrice: 299, duration: "25 mins" },
    { name: "Rica Full Arms + Underarms Combo", price: 499, offerPrice: 399, duration: "30 mins" },
  ],
  "full-legs-waxing": [
    { name: "Honey Regular Full Legs", price: 449, offerPrice: 349, duration: "30 mins" },
    { name: "Rica White Chocolate Full Legs", price: 699, offerPrice: 549, duration: "35 mins" },
  ],
  "full-back-waxing": [
    { name: "Honey Regular Full Back", price: 499, offerPrice: 399, duration: "25 mins" },
    { name: "Rica White Chocolate Full Back", price: 699, offerPrice: 549, duration: "30 mins" },
  ],
  "half-back-waxing": [
    { name: "Honey Regular Wax", price: 299, offerPrice: 249, duration: "15 mins" },
    { name: "Rica White Chocolate Wax", price: 449, offerPrice: 349, duration: "20 mins" },
  ],
  "stomach-waxing": [
    { name: "Honey Regular Wax", price: 349, offerPrice: 299, duration: "15 mins" },
    { name: "Rica White Chocolate Wax", price: 499, offerPrice: 399, duration: "20 mins" },
  ],
  "breast-waxing": [
    { name: "Honey Regular Wax", price: 299, offerPrice: 249, duration: "15 mins" },
    { name: "Rica Sensitive Wax", price: 449, offerPrice: 349, duration: "20 mins" },
  ],
  "bikini-waxing-at-home": [
    { name: "Bikini Line Only (Honey Wax)", price: 499, offerPrice: 399, duration: "20 mins" },
    { name: "Rica Peel-Off Brazilian (Painless & Hygienic)", price: 1199, offerPrice: 899, duration: "35 mins" },
    { name: "Full Bikini & Buttocks Rica Wax", price: 1599, offerPrice: 1299, duration: "45 mins" },
  ],

  // ── FACIALS & SKINCARE ──
  "facial-at-home": [
    { name: "Cheryl's Tan Clear & Radiance Facial", price: 1499, offerPrice: 999, duration: "60 mins" },
    { name: "O3+ Sea White Brightening Facial", price: 2199, offerPrice: 1499, duration: "65 mins" },
    { name: "Lotus Radiant Gold Luxury Glow Facial", price: 1799, offerPrice: 1299, duration: "60 mins" },
    { name: "O3+ Bridal Power Oxygen Glow Facial", price: 2799, offerPrice: 1999, duration: "75 mins" },
    { name: "Hydra Dew Deep Pore Derma Facial", price: 3500, offerPrice: 2499, duration: "80 mins" },
  ],
  "classic-cleanup": [
    { name: "Fruit & Herbal Instant Glow Cleanup", price: 699, offerPrice: 499, duration: "30 mins" },
    { name: "Sara Oxy Anti-Tan Detox Cleanup", price: 799, offerPrice: 599, duration: "35 mins" },
    { name: "O3+ Deep Pore Purifying Cleanup", price: 1099, offerPrice: 799, duration: "40 mins" },
  ],
  "professional-face-cleanup": [
    { name: "Sara Oxy Radiance Cleanup", price: 899, offerPrice: 700, duration: "40 mins" },
    { name: "Cheryl's Derma Cleanse Cleanup", price: 1099, offerPrice: 850, duration: "45 mins" },
  ],
  "professional-facial": [
    { name: "Cheryl's GloVite Radiance Facial", price: 1499, offerPrice: 999, duration: "60 mins" },
    { name: "O3+ Radiant Shine Facial", price: 1999, offerPrice: 1399, duration: "65 mins" },
  ],
  "threading-eyebrow-upperlips": [
    { name: "Eyebrows & Upper Lip Threading", price: 70, offerPrice: 50, duration: "10 mins" },
    { name: "Eyebrows, Upper Lip & Forehead", price: 100, offerPrice: 70, duration: "15 mins" },
    { name: "Full Face Organic Threading", price: 250, offerPrice: 199, duration: "25 mins" },
    { name: "Full Face Rica Aloe Wax Peel-off", price: 450, offerPrice: 349, duration: "20 mins" },
  ],

  // ── MANICURE, PEDICURE & NAILS ──
  "classic-manicure-pedicure": [
    { name: "Classic Spa Manicure & Pedicure", price: 1199, offerPrice: 799, duration: "60 mins" },
    { name: "Aroma Essential Oils Relaxing Mani-Pedi", price: 1499, offerPrice: 999, duration: "75 mins" },
    { name: "Sara Crystal / Ice Cream Deep Clean Pedicure", price: 1899, offerPrice: 1299, duration: "80 mins" },
    { name: "O3+ Anti-Tan Brightening Mani-Pedi", price: 2199, offerPrice: 1499, duration: "85 mins" },
  ],
  "classic-manicure-at-home": [
    { name: "Classic Manicure (Clean, Cut, File, Polish)", price: 649, offerPrice: 499, duration: "30 mins" },
    { name: "Aroma Hydrating Spa Manicure", price: 899, offerPrice: 699, duration: "40 mins" },
  ],
  "classic-pedicure-at-home": [
    { name: "Classic Pedicure (Heel Scrub & Polish)", price: 749, offerPrice: 599, duration: "40 mins" },
    { name: "Callus Removal & Cracked Heel Therapy Pedicure", price: 1199, offerPrice: 899, duration: "50 mins" },
  ],
  "aroma-spa-manicure": [
    { name: "Lavender Relieving Aroma Spa Manicure", price: 999, offerPrice: 799, duration: "45 mins" },
    { name: "Rose & Almond Oil Nourishing Manicure", price: 1199, offerPrice: 899, duration: "45 mins" },
  ],
  "gel-nail-extensions": [
    { name: "Natural Nail Gel Polish Overlay", price: 1499, offerPrice: 999, duration: "45 mins" },
    { name: "Full Set Acrylic / Gel Tip Extensions", price: 2499, offerPrice: 1899, duration: "90 mins" },
    { name: "Bridal French Ombre & 3D Stone Nail Art", price: 3200, offerPrice: 2499, duration: "105 mins" },
    { name: "Chrome Metallic / Cat-Eye Gel Extensions", price: 2800, offerPrice: 2199, duration: "90 mins" },
  ],
  "fyc-jelly-luxury-pedicure": [
    { name: "Rose Jelly Soothing Pedicure", price: 1599, offerPrice: 1199, duration: "60 mins" },
    { name: "Aloe Vera & Mint Cooling Jelly Pedicure", price: 1799, offerPrice: 1399, duration: "60 mins" },
  ],
  "o3-brightening-mani-pedi-spa": [
    { name: "O3+ Meladerm Hand Brightening Spa", price: 1199, offerPrice: 899, duration: "45 mins" },
    { name: "O3+ Pedilogix Foot De-Tan & Callus Treatment", price: 1499, offerPrice: 1099, duration: "50 mins" },
    { name: "Complete O3+ Luxury Brightening Mani-Pedi Duo", price: 2499, offerPrice: 1799, duration: "90 mins" },
  ],

  // ── HAIR STYLING & TREATMENTS ──
  "bridal-hair-styling": [
    { name: "Classic Blow Dry (Straight / In-Curls / Out-Curls)", price: 999, offerPrice: 699, duration: "30 mins" },
    { name: "Hollywood Glamour Cascading Waves", price: 1699, offerPrice: 1299, duration: "45 mins" },
    { name: "Intricate Textured Bridal Bun with Floral Setting", price: 2499, offerPrice: 1999, duration: "60 mins" },
    { name: "Messy Mermaid Braid with Baby's Breath", price: 2199, offerPrice: 1699, duration: "50 mins" },
  ],
  "hair-spa-at-home": [
    { name: "L'Oréal Mythic Oil Deep Nourishing Spa", price: 1499, offerPrice: 999, duration: "45 mins" },
    { name: "Matrix Biolage Hydrating & Anti-Frizz Spa", price: 1799, offerPrice: 1299, duration: "50 mins" },
    { name: "Olaplex Intensive Bond Repair Treatment", price: 2799, offerPrice: 2199, duration: "60 mins" },
  ],
  "hair-smoothing-treatment": [
    { name: "Keratin Deep Infusion Therapy", price: 3499, offerPrice: 2499, duration: "120 mins" },
    { name: "Protein Hair Botox Smoothing", price: 4499, offerPrice: 3499, duration: "120 mins" },
    { name: "Cysteine Formaldehyde-Free Smoothing", price: 5499, offerPrice: 4499, duration: "150 mins" },
  ],
  "bridal-hairstyling-advanced-hairdo": [
    { name: "Classic Donut Bun with Gajra", price: 1999, offerPrice: 1499, duration: "45 mins" },
    { name: "Royal Textured Sabyasachi Bun", price: 2499, offerPrice: 1799, duration: "60 mins" },
  ],

  // ── BRIDAL & WEDDING MAKEUP ──
  "hd-bridal-makeup": [
    { name: "Classic HD Bridal (MAC/PAC, Lashes, Draping & Hair)", price: 15999, offerPrice: 12999, duration: "150 mins" },
    { name: "Signature HD Bridal Glow (MAC Studio Fix, Bobbi Brown, Kryolan)", price: 18999, offerPrice: 14999, duration: "180 mins" },
    { name: "Celebrity 3D Glass Skin Bridal (Huda Beauty, Dyson Hair Styling)", price: 21999, offerPrice: 16999, duration: "180 mins" },
  ],
  "airbrush-bridal-makeup": [
    { name: "Temptu HD Silicone Airbrush Bridal Makeover", price: 21999, offerPrice: 17999, duration: "180 mins" },
    { name: "Celebrity Ultra-Matte 18hr Sweat-Proof Airbrush", price: 24999, offerPrice: 19999, duration: "180 mins" },
  ],
  "bridal-makeup-artist": [
    { name: "Traditional Indian Bridal Makeover", price: 12999, offerPrice: 9999, duration: "150 mins" },
    { name: "Pre-Wedding Shoot Glow Makeover", price: 8999, offerPrice: 6999, duration: "120 mins" },
  ],
  "classic-bridal-makeup": [
    { name: "Classic Indian Bridal (HD Base & Lashes)", price: 11999, offerPrice: 8999, duration: "150 mins" },
    { name: "Classic Bridal with Hair & Saree Draping", price: 13999, offerPrice: 10499, duration: "180 mins" },
  ],
  "complete-bridal-package": [
    { name: "Standard 1-Day Bridal (Makeup + Hair + Draping)", price: 22999, offerPrice: 18999, duration: "210 mins" },
    { name: "Complete Bridal + Pre-Bridal Glow Package (2 Days)", price: 28999, offerPrice: 23999, duration: "2 Days" },
  ],

  // ── ENGAGEMENT & PARTY MAKEUP ──
  "party-makeup-and-hair": [
    { name: "Day Glow Subtle Party Makeup & Blow Dry", price: 2499, offerPrice: 1999, duration: "60 mins" },
    { name: "Evening HD Cocktail Glam with Mink Lashes & Waves", price: 3799, offerPrice: 2999, duration: "90 mins" },
    { name: "Airbrush High-Definition Waterproof Party Glam", price: 4999, offerPrice: 3999, duration: "90 mins" },
  ],
  "flawless-party-makeup-hair-styling": [
    { name: "Standard Day Party Glam", price: 2499, offerPrice: 1999, duration: "60 mins" },
    { name: "HD Evening Sangeet Look with Hairdo", price: 3499, offerPrice: 2699, duration: "75 mins" },
  ],
  "hd-party-makeup": [
    { name: "Flawless HD Base & Neutral Shimmer Eyes", price: 2999, offerPrice: 2499, duration: "70 mins" },
    { name: "Full Celebrity HD Party Makeover with Mink Lashes", price: 3999, offerPrice: 3199, duration: "90 mins" },
  ],
  "engagement-makeup": [
    { name: "Classic Engagement HD Glow", price: 6999, offerPrice: 5499, duration: "120 mins" },
    { name: "Signature Airbrush Engagement Look & Floral Hairdo", price: 8999, offerPrice: 6999, duration: "150 mins" },
  ],
  "bridesmaid-family-makeup": [
    { name: "Single Guest Standard Glam", price: 2999, offerPrice: 2499, duration: "60 mins" },
    { name: "Family Combo for 2 Members (Save ₹500)", price: 5499, offerPrice: 4499, duration: "100 mins" },
    { name: "Family Combo for 3 Members (Save ₹1,200)", price: 7999, offerPrice: 6299, duration: "150 mins" },
  ],
  "karva-chauth-makeup": [
    { name: "Traditional Red Karva Chauth Glam & Bindi Art", price: 2999, offerPrice: 2499, duration: "60 mins" },
    { name: "HD Karva Chauth Makeover with Floral Hair Bun", price: 3999, offerPrice: 3199, duration: "75 mins" },
  ],

  // ── DRAPING, EYE MAKEUP & MEHNDI ──
  "saree-draping-at-home": [
    { name: "Classic Saree / Dupatta Draping", price: 600, offerPrice: 499, duration: "20 mins" },
    { name: "Heavy Bridal Lehenga & Double Dupatta Setting", price: 1100, offerPrice: 850, duration: "30 mins" },
    { name: "Group Saree Draping (Up to 3 Sarees)", price: 1500, offerPrice: 1199, duration: "50 mins" },
  ],
  "party-guest-mehndi": [
    { name: "Single Side Palm Mehndi (Arabic Pattern)", price: 399, offerPrice: 299, duration: "20 mins" },
    { name: "Both Hands Arabic / Floral Mehndi (Up to Wrist)", price: 699, offerPrice: 499, duration: "35 mins" },
    { name: "Both Hands Traditional Indian Mehndi (Elbow Length)", price: 1199, offerPrice: 899, duration: "60 mins" },
  ],
  "bridal-mehndi-artist": [
    { name: "Bridal Mehndi (Elbow to Palm & Feet Anklet)", price: 7999, offerPrice: 5999, duration: "180 mins" },
    { name: "Royal Portrait & Figurative Bridal Mehndi (Full Arm & Leg)", price: 11999, offerPrice: 8999, duration: "240 mins" },
  ],
  "premium-eye-makeup-lash-extension": [
    { name: "Smokey / Cut-Crease Eye Makeup with Mink Lashes", price: 1899, offerPrice: 1499, duration: "45 mins" },
    { name: "Semi-Permanent Individual Lash Extensions", price: 2999, offerPrice: 2299, duration: "60 mins" },
  ],

  // ── PRE-BRIDAL PACKAGES ──
  "pre-bridal-glow-package": [
    { name: "Silver 1-Day Pre-Bridal Glow", price: 6499, offerPrice: 4999, duration: "180 mins" },
    { name: "Gold 2-Day Complete Pre-Bridal Package", price: 9999, offerPrice: 7999, duration: "2 Days" },
    { name: "Platinum 3-Sitting Bridal Transformation", price: 14999, offerPrice: 11999, duration: "3 Days" },
  ],
  "pre-bridal-haldi-mehndi-glow-package": [
    { name: "Express Haldi Ubtan & Detan Session", price: 3199, offerPrice: 2499, duration: "90 mins" },
    { name: "Haldi & Mehndi Dual Function Beauty Care", price: 4499, offerPrice: 3499, duration: "120 mins" },
  ],
};

async function main() {
  console.log("Seeding Sub-categories (Service Variants) & Area Pricing...");

  let variantsCreated = 0;
  for (const [slug, variants] of Object.entries(VARIANTS_BY_SERVICE)) {
    const service = await prisma.service.findUnique({ where: { slug } });
    if (!service) {
      console.log(`Service with slug ${slug} not found, skipping.`);
      continue;
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]!;
      await prisma.serviceVariant.upsert({
        where: {
          serviceId_name: { serviceId: service.id, name: v.name }
        },
        update: {
          price: v.price,
          offerPrice: v.offerPrice ?? v.price,
          duration: v.duration,
          sortOrder: i,
        },
        create: {
          serviceId: service.id,
          name: v.name,
          price: v.price,
          offerPrice: v.offerPrice ?? v.price,
          duration: v.duration,
          sortOrder: i,
        }
      });
      variantsCreated++;
    }
  }
  console.log(`Successfully upserted ${variantsCreated} ServiceVariant sub-category options!`);

  // 2. Seed ServiceCity links for all active services across Delhi, Noida, Greater Noida
  const cities = await prisma.city.findMany({ where: { isActive: true } });
  const allServices = await prisma.service.findMany({ where: { status: "ACTIVE" } });

  console.log(`Found ${cities.length} active cities and ${allServices.length} active services.`);

  let serviceCitiesCreated = 0;
  for (const service of allServices) {
    for (const city of cities) {
      let priceOverride: number | null = null;
      const baseOffer = service.offerPrice ?? service.price;
      if (baseOffer) {
        const num = Number(baseOffer);
        if (city.slug === "greater-noida") {
          priceOverride = Math.round((num * 0.95) / 10) * 10;
        } else if (city.slug === "delhi") {
          priceOverride = Math.round((num * 1.05) / 10) * 10;
        } else {
          priceOverride = num;
        }
      }

      const localDesc = `Book verified doorstep ${service.title.toLowerCase()} in ${city.name}. Available across all residential societies, gated sectors, and wedding venues in ${city.name} with hospital-grade sanitized kits and 100% verified female artists. Zero travel charges.`;

      await prisma.serviceCity.upsert({
        where: {
          serviceId_cityId: { serviceId: service.id, cityId: city.id }
        },
        update: {
          priceOverride: priceOverride ? priceOverride : undefined,
          localContent: localDesc,
          active: true,
          contentStatus: "PUBLISHED",
        },
        create: {
          serviceId: service.id,
          cityId: city.id,
          priceOverride: priceOverride ? priceOverride : undefined,
          localContent: localDesc,
          active: true,
          contentStatus: "PUBLISHED",
        }
      });
      serviceCitiesCreated++;
    }
  }

  console.log(`Successfully created/updated ${serviceCitiesCreated} ServiceCity links with area-specific pricing!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
