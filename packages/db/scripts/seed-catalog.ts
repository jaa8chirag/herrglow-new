import { prisma } from "../src/index.js";

interface ServiceItem {
  title: string;
  slug: string;
  price: number;
  duration: string;
  short: string;
  isPackage?: boolean;
}

interface CategoryGroup {
  categorySlug: string;
  categoryName: string;
  sortOrder: number;
  items: ServiceItem[];
}

const CATALOG_DATA: CategoryGroup[] = [
  // ─── 1. Bridal & Wedding Makeup ───
  {
    categorySlug: "bridal-makeup",
    categoryName: "Bridal & Wedding Makeup",
    sortOrder: 1,
    items: [
      {
        title: "Classic Bridal Makeup",
        slug: "classic-bridal-makeup",
        price: 7999,
        duration: "2.5 hours",
        short: "Timeless, elegant bridal makeover with flawless base and graceful eye makeup.",
      },
      {
        title: "Muslim Nikah Bridal Makeup",
        slug: "muslim-nikah-bridal-makeup",
        price: 13999,
        duration: "3 hours",
        short:
          "Stunning royal Nikah bridal glam with radiant skin, passah setting, and dramatic eyes.",
      },
      {
        title: "Christian Bridal Makeup",
        slug: "christian-bridal-makeup",
        price: 13999,
        duration: "2.5 hours",
        short: "Sophisticated, glowing natural bridal look with veil draping and soft bridal eyes.",
      },
      {
        title: "South Indian Bridal Makeup",
        slug: "south-indian-bridal-makeup",
        price: 13999,
        duration: "3.5 hours",
        short:
          "Traditional South Indian bridal glam with gold jewellery setting, poola jada hairstyle & saree draping.",
      },
      {
        title: "Bengali Bridal Makeup",
        slug: "bengali-bridal-makeup",
        price: 13999,
        duration: "3 hours",
        short:
          "Authentic Bengali bride look with traditional Chandan artwork, mukut placement and bold eyes.",
      },
      {
        title: "Punjabi & Sikh Bridal Makeup",
        slug: "punjabi-sikh-bridal-makeup",
        price: 13999,
        duration: "3 hours",
        short:
          "Royal Anand Karaj bridal makeover with maang tikka, bridal dupatta setting, and luminous glam.",
      },
      {
        title: "HD Bridal Makeup",
        slug: "hd-bridal-makeup",
        price: 14999,
        duration: "3 hours",
        short:
          "High-definition camera-ready bridal makeover designed for 4K video and photography perfection.",
      },
      {
        title: "Airbrush Bridal Makeup",
        slug: "airbrush-bridal-makeup",
        price: 17999,
        duration: "3 hours",
        short:
          "Ultra-weightless, waterproof, 24-hour transfer-proof airbrush silicone finish for flawless skin.",
      },
      {
        title: "Complete Bridal Package (Makeup, Hair, Draping & Trial)",
        slug: "complete-bridal-package",
        price: 18999,
        isPackage: true,
        duration: "4 hours",
        short:
          "All-inclusive flagship luxury bridal bundle: HD/Airbrush makeup, hair styling, draping, mink lashes & pre-wedding trial.",
      },
      {
        title: "Multi-Function Wedding Makeup Package",
        slug: "multi-function-wedding-makeup-package",
        price: 21999,
        isPackage: true,
        duration: "6 hours",
        short:
          "Comprehensive 2 or 3-function bridal package covering Mehndi, Sangeet, and Wedding Day looks.",
      },
      {
        title: "Bridal Makeup Trial Session",
        slug: "bridal-makeup-trial-session",
        price: 2999,
        duration: "90 mins",
        short:
          "Pre-wedding hands-on makeup & hair consultation to test shades, skin prep, and camera finish.",
      },
      {
        title: "Groom Makeup & Grooming",
        slug: "groom-makeup-grooming",
        price: 3499,
        duration: "60 mins",
        short:
          "Subtle matte grooming for the groom: beard shaping, hair styling, and photo-ready skin correction.",
      },
    ],
  },

  // ─── 2. Engagement, Pre-Wedding & Party Makeup ───
  {
    categorySlug: "engagement-party-makeup",
    categoryName: "Engagement, Pre-Wedding & Party Makeup",
    sortOrder: 2,
    items: [
      {
        title: "Flawless Party Makeup & Hair Styling",
        slug: "flawless-party-makeup-hair-styling",
        price: 1999,
        duration: "75 mins",
        short:
          "Chic doorstep party glam with hairstyle (curls/straightening) and natural radiant base.",
      },
      {
        title: "Birthday Party Makeup",
        slug: "birthday-party-makeup",
        price: 1999,
        duration: "60 mins",
        short: "Fresh, youthful makeover tailored for birthday celebrations and private parties.",
      },
      {
        title: "Nude & No-Makeup Look",
        slug: "nude-no-makeup-look",
        price: 1999,
        duration: "60 mins",
        short:
          "Subtle skin-first minimalist glam with tinted radiance, feathered brows, and nude lips.",
      },
      {
        title: "Karva Chauth Makeup",
        slug: "karva-chauth-makeup",
        price: 2499,
        duration: "75 mins",
        short: "Festive glow with traditional bindi, dupatta draping, and waterproof foundation.",
      },
      {
        title: "Bridesmaid & Family Makeup",
        slug: "bridesmaid-family-makeup",
        price: 2499,
        duration: "75 mins",
        short:
          "Camera-ready elegance for sisters, mothers, and bridesmaids tailored to match ethnic outfits.",
      },
      {
        title: "Wedding Guest Makeup",
        slug: "wedding-guest-makeup",
        price: 2499,
        duration: "75 mins",
        short:
          "Polished celebration makeup for wedding attendees with custom eye look and hair styling.",
      },
      {
        title: "Korean Glass Skin Makeup",
        slug: "korean-glass-skin-makeup",
        price: 2999,
        duration: "75 mins",
        short:
          "Dewy, hyper-hydrated Korean glass skin finish with gradient lips and subtle shimmer eyes.",
      },
      {
        title: "Professional Makeup Artist at Home",
        slug: "professional-makeup-artist-at-home",
        price: 2999,
        duration: "90 mins",
        short: "Senior certified makeup artist visit for customized occasion makeup and styling.",
      },
      {
        title: "Luxe Glam-up Makeup",
        slug: "luxe-glam-up-makeup",
        price: 3499,
        duration: "90 mins",
        short:
          "Luxury evening makeover with sculpted contours, cut-crease eyes, and luxury lashes.",
      },
      {
        title: "HD Party Makeup",
        slug: "hd-party-makeup",
        price: 3499,
        duration: "90 mins",
        short:
          "Long-lasting high-definition party makeup with silicone primer and premium cosmetics.",
      },
      {
        title: "Haldi Ceremony Makeup",
        slug: "haldi-ceremony-makeup",
        price: 3499,
        duration: "75 mins",
        short:
          "Vibrant yellow-tone sweat-resistant glam with waterproof base and floral hair styling.",
      },
      {
        title: "Mehndi Function Makeup",
        slug: "mehndi-function-makeup",
        price: 3499,
        duration: "75 mins",
        short: "Playful boho-chic celebration look with glowing skin and long-wearing eye makeup.",
      },
      {
        title: "Baby Shower & Godh Bharai Makeup",
        slug: "baby-shower-godh-bharai-makeup",
        price: 3499,
        duration: "90 mins",
        short: "Gentle, radiant maternal glow with soothing organic makeup and saree draping.",
      },
      {
        title: "Engagement Makeup",
        slug: "engagement-makeup",
        price: 4499,
        duration: "2 hours",
        short: "Sophisticated ring-ceremony makeover with statement eyes and elegant hairdo.",
      },
      {
        title: "Airbrush Party Makeup",
        slug: "airbrush-party-makeup",
        price: 4499,
        duration: "90 mins",
        short: "Ultra-fine airbrush spray application for 18-hour sweatproof party glam.",
      },
      {
        title: "Sangeet & Cocktail Party Makeup",
        slug: "sangeet-cocktail-party-makeup",
        price: 4999,
        duration: "2 hours",
        short: "High-octane evening glam with smokey glitter eyes and dance-proof foundation.",
      },
      {
        title: "Pre-Wedding Photoshoot Makeup",
        slug: "pre-wedding-photoshoot-makeup",
        price: 5999,
        duration: "2.5 hours",
        short:
          "High-impact outdoor/studio photoshoot makeup with touch-up kit and multi-look flexibility.",
      },
      {
        title: "Reception Makeup",
        slug: "reception-makeup",
        price: 6499,
        duration: "2.5 hours",
        short:
          "Opulent grand reception look with statement contours, gown/lehenga draping and royal hairdo.",
      },
      {
        title: "Group Makeup Package (for 3)",
        slug: "group-makeup-package",
        price: 6499,
        isPackage: true,
        duration: "3 hours",
        short:
          "Special value bundle: Party makeup and hair styling for 3 persons (₹2,166 per person).",
      },
      {
        title: "HD Engagement Makeup",
        slug: "hd-engagement-makeup",
        price: 6999,
        duration: "2 hours",
        short: "Premium HD engagement makeover with flawless 4K finish and intricate hairstyling.",
      },
      {
        title: "Airbrush Engagement Makeup",
        slug: "airbrush-engagement-makeup",
        price: 8999,
        duration: "2.5 hours",
        short:
          "Airbrush engagement glam with micro-fine mist base, mink eyelashes and luxury styling.",
      },
    ],
  },

  // ─── 3. Pre-Bridal & Combo Packages ───
  {
    categorySlug: "pre-bridal-packages",
    categoryName: "Pre-Bridal & Combo Packages",
    sortOrder: 3,
    items: [
      {
        title: "Pre-Bridal Haldi & Mehndi Glow Package",
        slug: "pre-bridal-haldi-mehndi-glow-package",
        price: 2499,
        isPackage: true,
        duration: "2 hours",
        short:
          "Express radiance combo: Face cleanup, de-tan pack, threading, and express manicure.",
      },
      {
        title: "Essential Glow Pre-Bridal Package",
        slug: "essential-glow-pre-bridal-package",
        price: 3499,
        isPackage: true,
        duration: "3 hours",
        short: "Complete head-to-toe grooming: O3+ cleanup, full arms & legs waxing, and pedicure.",
      },
      {
        title: "Luxe Party Glam Package",
        slug: "luxe-party-glam-package",
        price: 3999,
        isPackage: true,
        duration: "2.5 hours",
        short:
          "Full party package: HD party makeup, advanced hairdo, saree draping, and nail polish.",
      },
      {
        title: "Luxury Ultra-Radiance Pre-Bridal Package (Premium)",
        slug: "luxury-ultra-radiance-pre-bridal-package",
        price: 9999,
        isPackage: true,
        duration: "5 hours",
        short:
          "Comprehensive bridal beauty therapy: O3+ bridal facial, full body Rica waxing, body polishing, and spa mani-pedi.",
      },
    ],
  },

  // ─── 4. Draping, Eye Makeup & Mehndi ───
  {
    categorySlug: "draping-eye-mehndi",
    categoryName: "Draping, Eye Makeup & Mehndi",
    sortOrder: 4,
    items: [
      {
        title: "Party & Guest Mehndi",
        slug: "party-guest-mehndi",
        price: 499,
        duration: "45 mins",
        short: "Quick, graceful Arabic or floral mehndi patterns for one or both hands.",
      },
      {
        title: "Saree Draping at Home",
        slug: "saree-draping-at-home",
        price: 850,
        duration: "30 mins",
        short:
          "Professional pleating and pin-up for Kanjeevaram, chiffon, silk, or Bengali style sarees.",
      },
      {
        title: "Premium Eye Makeup & Lash Extension",
        slug: "premium-eye-makeup-lash-extension",
        price: 1499,
        duration: "45 mins",
        short:
          "Dramatic eye glam with cut-crease eyeshadow, winged eyeliner and natural lash extensions.",
      },
      {
        title: "Bridal Saree & Lehenga Draping",
        slug: "bridal-saree-lehenga-draping",
        price: 1999,
        duration: "45 mins",
        short:
          "Heavy bridal lehenga dupatta double-draping, can-can setting, and waistband pinning.",
      },
      {
        title: "Bridal Mehndi Artist",
        slug: "bridal-mehndi-artist",
        price: 5999,
        duration: "4 hours",
        short:
          "Intricate bridal mehndi up to elbows and calves with personalized wedding motifs and dark herbal stain.",
      },
    ],
  },

  // ─── 5. Hair Styling & Treatments ───
  {
    categorySlug: "hair-styling",
    categoryName: "Hair Styling & Treatments",
    sortOrder: 5,
    items: [
      {
        title: "Anti-Hair Fall Treatment",
        slug: "anti-hair-fall-treatment",
        price: 1499,
        duration: "60 mins",
        short:
          "Scalp detoxification, follicle strengthening serum therapy, and deep pressure massage.",
      },
      {
        title: "Bridal Hairstyling & Advanced Hairdo",
        slug: "bridal-hairstyling-advanced-hairdo",
        price: 1799,
        duration: "60 mins",
        short:
          "Elaborate bridal bun, textured braid, or Hollywood waves with floral and accessory pinning.",
      },
      {
        title: "Hair Smoothing Treatment",
        slug: "hair-smoothing-treatment",
        price: 1999,
        duration: "90 mins",
        short:
          "Keratin protein smoothing therapy for frizz-free, silky soft, and mirror-shine hair.",
      },
      {
        title: "Premium Hair Extensions & Volumizing Service",
        slug: "premium-hair-extensions-volumizing",
        price: 3999,
        duration: "60 mins",
        short:
          "Seamless 100% human hair extension clip-in, blending, and heat styling for maximum volume.",
      },
    ],
  },

  // ─── 6. Facials, Skin & Body Care (Salon at Home) ───
  {
    categorySlug: "facial-and-skincare",
    categoryName: "Facials, Skin & Body Care (Salon at Home)",
    sortOrder: 6,
    items: [
      {
        title: "Eyebrow, Upper Lips & Forehead Threading",
        slug: "threading-eyebrow-upperlips",
        price: 70,
        duration: "20 mins",
        short: "Precise organic cotton thread shaping for clean brows, upper lips, and forehead.",
      },
      {
        title: "Classic Cleanup",
        slug: "classic-cleanup",
        price: 599,
        duration: "40 mins",
        short:
          "Deep pore cleansing, gentle exfoliation, blackhead removal, and soothing fruit pack.",
      },
      {
        title: "Professional Face Cleanup",
        slug: "professional-face-cleanup",
        price: 700,
        duration: "45 mins",
        short:
          "Targeted deep-cleansing facial cleanup with ultrasonic scrubbing and herbal de-tan pack.",
      },
      {
        title: "Professional Facial",
        slug: "professional-facial",
        price: 999,
        duration: "60 mins",
        short:
          "Rejuvenating skin facial with 5-step massage, steam extraction, and nourishing face mask.",
      },
      {
        title: "Premium Glow Facial",
        slug: "premium-glow-facial",
        price: 1000,
        duration: "60 mins",
        short:
          "O3+ brightening facial formulated to eliminate dullness and restore glass-skin glow.",
      },
      {
        title: "Pigmentation Treatment Facial",
        slug: "pigmentation-treatment-facial",
        price: 1999,
        duration: "75 mins",
        short:
          "Specialized clinical derma-facial targeting dark spots, blemish scars, and uneven tone.",
      },
      {
        title: "Premium Full Body Massage",
        slug: "premium-full-body-massage",
        price: 2000,
        duration: "60 mins",
        short:
          "Holistic full-body Swedish or aroma oil massage by female therapist for deep relaxation.",
      },
      {
        title: "Premium Full Body Polishing",
        slug: "premium-full-body-polishing",
        price: 2000,
        duration: "75 mins",
        short:
          "Whole-body walnut/sugar scrub exfoliation followed by nourishing cream moisture wrap.",
      },
    ],
  },

  // ─── 7. Waxing (Salon at Home) ───
  {
    categorySlug: "waxing",
    categoryName: "Waxing (Salon at Home)",
    sortOrder: 7,
    items: [
      {
        title: "Half Back Waxing",
        slug: "half-back-waxing",
        price: 249,
        duration: "20 mins",
        short:
          "Gentle honey or chocolate wax hair removal for upper/lower half back with soothing gel.",
      },
      {
        title: "Breast Waxing",
        slug: "breast-waxing",
        price: 249,
        duration: "20 mins",
        short: "Hygienic, private waxing service using skin-friendly wax and disposable supplies.",
      },
      {
        title: "Full Arms Waxing",
        slug: "full-arms-waxing",
        price: 299,
        duration: "30 mins",
        short: "Complete arms and underarms waxing with post-wax skin soothing lotion.",
      },
      {
        title: "Stomach Waxing",
        slug: "stomach-waxing",
        price: 299,
        duration: "25 mins",
        short:
          "Clean, painless stomach hair removal with disposable bedsheets and wooden spatulas.",
      },
      {
        title: "Full Legs Waxing",
        slug: "full-legs-waxing",
        price: 300,
        duration: "40 mins",
        short: "Smooth, thorough full leg waxing from thighs to ankles with antiseptic post-care.",
      },
      {
        title: "Full Back Waxing",
        slug: "full-back-waxing",
        price: 349,
        duration: "30 mins",
        short: "Complete back waxing for deep cleansing, hair removal, and silky smooth skin.",
      },
      {
        title: "Bikini & Brazilian Waxing",
        slug: "bikini-waxing-at-home",
        price: 999,
        duration: "45 mins",
        short: "Hygienic, painless peel-off Rica/Liposoluble wax for delicate intimate areas.",
      },
      {
        title: "Full Body Waxing at Home",
        slug: "full-body-waxing-at-home",
        price: 1899,
        duration: "90 mins",
        short:
          "Complete full body waxing package (arms, underarms, full legs, stomach & full back).",
      },
    ],
  },

  // ─── 8. Manicure, Pedicure & Nails (Salon at Home) ───
  {
    categorySlug: "nail-art",
    categoryName: "Manicure, Pedicure & Nails (Salon at Home)",
    sortOrder: 8,
    items: [
      {
        title: "Classic Manicure at Home",
        slug: "classic-manicure-at-home",
        price: 499,
        duration: "40 mins",
        short:
          "Nail shaping, cuticle trimming, exfoliating hand scrub, relaxing massage, and polish.",
      },
      {
        title: "Classic Pedicure at Home",
        slug: "classic-pedicure-at-home",
        price: 599,
        duration: "45 mins",
        short: "Warm herbal foot soak, dead-skin buffing, heel softening scrub, and nail filing.",
      },
      {
        title: "Aroma Spa Manicure",
        slug: "aroma-spa-manicure",
        price: 799,
        duration: "50 mins",
        short:
          "Essential oil infused hand spa with deep cuticle treatment and hydrating glove mask.",
      },
      {
        title: "Aroma Spa Pedicure",
        slug: "aroma-spa-pedicure",
        price: 899,
        duration: "60 mins",
        short:
          "Aromatherapy foot bath, crack-heel smoothing, exfoliating scrub, and reflexology massage.",
      },
      {
        title: "FYC Jelly Luxury Pedicure",
        slug: "fyc-jelly-luxury-pedicure",
        price: 999,
        duration: "60 mins",
        short: "Indulgent warm jelly foot spa bath that locks in moisture and relieves tired feet.",
      },
      {
        title: "Nail Extensions & Gel Art",
        slug: "nail-extensions-gel-art",
        price: 1099,
        duration: "90 mins",
        short: "Long-lasting acrylic, gel or soft gel extensions with custom nail art styling.",
      },
      {
        title: "Classic Manicure & Pedicure Combo",
        slug: "classic-manicure-pedicure-combo",
        price: 1199,
        isPackage: true,
        duration: "80 mins",
        short: "Complete hands and feet pampering combo with scrub, massage, and nail paint.",
      },
      {
        title: "O3+ Luxury Brightening Mani-Pedi Spa",
        slug: "o3-brightening-mani-pedi-spa",
        price: 1499,
        isPackage: true,
        duration: "90 mins",
        short:
          "Premium O3+ de-tan and brightening manicure & pedicure spa for radiant hands and feet.",
      },
    ],
  },
];

async function seedCatalog() {
  console.log("Seeding all 8 service categories and comprehensive service catalog...");

  let totalServicesCreated = 0;

  for (const group of CATALOG_DATA) {
    const category = await prisma.category.upsert({
      where: { slug: group.categorySlug },
      update: {
        name: group.categoryName,
        sort: group.sortOrder,
      },
      create: {
        slug: group.categorySlug,
        name: group.categoryName,
        sort: group.sortOrder,
      },
    });

    console.log(`[Category] ${group.sortOrder}. ${group.categoryName} (${group.categorySlug})`);

    let itemSort = 1;
    for (const item of group.items) {
      const longDescription = `<p>${item.short} Delivered right to your doorstep by verified, background-checked female beauticians and makeup artists across Delhi, Noida, and Greater Noida.</p><p>We use sanitized tools, single-use disposable bedsheets, and authentic branded products. Pay securely after service completion.</p>`;

      await prisma.service.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          categoryId: category.id,
          price: item.price,
          offerPrice: item.price,
          priceLabel: "Starting from",
          duration: item.duration,
          shortDescription: item.short,
          description: longDescription,
          isPackage: item.isPackage ?? false,
          status: "ACTIVE",
          sort: itemSort,
          seoTitle: `${item.title} at Home | HerrGlow`,
          seoDescription: `Book ${item.title} at home starting from ₹${item.price.toLocaleString("en-IN")}. Verified artists, clear prices, doorstep salon service in Delhi NCR.`,
        },
        create: {
          slug: item.slug,
          title: item.title,
          categoryId: category.id,
          price: item.price,
          offerPrice: item.price,
          priceLabel: "Starting from",
          duration: item.duration,
          shortDescription: item.short,
          description: longDescription,
          isPackage: item.isPackage ?? false,
          status: "ACTIVE",
          sort: itemSort,
          seoTitle: `${item.title} at Home | HerrGlow`,
          seoDescription: `Book ${item.title} at home starting from ₹${item.price.toLocaleString("en-IN")}. Verified artists, clear prices, doorstep salon service in Delhi NCR.`,
        },
      });

      totalServicesCreated++;
      itemSort++;
    }
  }

  console.log(`Successfully seeded ${totalServicesCreated} services across 8 categories!`);
}

seedCatalog()
  .catch((e) => {
    console.error("Error seeding catalog:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
