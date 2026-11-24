/**
 * Seeds comprehensive 4-5 high-converting bullet points ("What's Included")
 * across all active services in HerrGlow.
 * Also retires seasonal karva-chauth-makeup cleanly into party makeup with 301.
 */
import { prisma } from "../src/index.js";

const FEATURE_TEMPLATES: Record<string, string[]> = {
  // Bridal
  "hd-bridal-makeup": [
    "Full-face HD bridal base with 16-hr sweat-proof finish",
    "Signature bridal eye makeup with mink lashes & lens placement",
    "Intricate bridal hairstyle with fresh floral/accessory setting",
    "Complete lehenga, dupatta draping & bridal jewelry setting",
    "100% authentic international kit (MAC, Huda Beauty, Kryolan, NARS)",
  ],
  "airbrush-bridal-makeup": [
    "Ultra-fine Temptu / Silicon airbrush base application",
    "Weightless, waterproof & zero-flashback finish for 4K video",
    "Luxury bridal eye glam, custom lashes & lens placement",
    "Designer bridal hair styling & dupatta/veil pin-up",
    "Hospital-grade sanitized brushes and single-use beauty sponges",
  ],
  "bridal-makeup-artist": [
    "Classic radiant bridal base calibrated for Indian skin tones",
    "Traditional or contemporary eye glam with eyelashes included",
    "Bridal hairdo (floral bun, traditional braid, or modern waves)",
    "Saree / Lehenga draping & bridal jewelry placement",
    "Premium authentic cosmetic brands with zero irritation guarantee",
  ],
  "bridal-makeup-trial-session": [
    "Full 90-minute customized bridal makeup & skin consultation",
    "Testing 2 distinct eye looks & base match under camera lights",
    "Hairstyle trial & dupatta drape angle planning",
    "Personalized pre-bridal skincare recommendation guide",
    "Advance slot adjustment against the final wedding booking",
  ],
  "complete-bridal-package": [
    "HD or Airbrush Bridal Makeup with false lashes & lens application",
    "Luxury bridal hair styling with floral & accessory placement",
    "Lehenga / Saree draping & jewelry setting included",
    "Complimentary pre-bridal glow skin prep on the wedding day",
    "Advance makeup trial session included in package",
  ],
  "multi-function-wedding-makeup-package": [
    "Complete bridal & function looks for 2 to 3 wedding ceremonies",
    "Distinct hairstyles & eye themes for each function (Sangeet/Cocktail/Wedding)",
    "High-definition camera-ready finish with lashes & draping each time",
    "Dedicated senior bridal artist assigned across all functions",
    "Flexible doorstep timing coordinated with your wedding muhurat",
  ],

  // Cultural Bridal
  "bengali-bridal-makeup": [
    "Traditional Bengali bridal base with radiant velvet glow",
    "Intricate Chandan art (Kalka design) on forehead & temples",
    "Bold winged Bengali eyes with dramatic lashes",
    "Topor & Mukut placement, Benarasi saree pleating & draping",
    "Authentic long-wear cosmetics suited for warm mandap lighting",
  ],
  "muslim-nikah-bridal-makeup": [
    "Royal dewy Nikah base with soft-focus radiance",
    "Dramatic Arabic/Smokey cut-crease eyes with premium lashes",
    "Passa / Jhumar & Maang Tikka placement with floral styling",
    "Sharara / Gharara & Dupatta styling with secure pin-up",
    "Transfer-resistant, sweat-proof formulation for long celebrations",
  ],
  "punjabi-sikh-bridal-makeup": [
    "High-glam Punjabi bridal base with illuminated cheekbones",
    "Bold glitter or cut-crease eye makeup with premium lashes",
    "Elaborate floral bridal bun with Paranda / accessory setting",
    "Heavy Dupatta double-draping & jewelry pinning",
    "16-hour sweat-proof wear for Anand Karaj & vibrant reception",
  ],
  "south-indian-bridal-makeup": [
    "Flawless matte/satin base suited for humid temple ceremonies",
    "Classic winged liner, gold shimmer eyes & lash enhancement",
    "Traditional South Indian Poolajada / floral hair braid styling",
    "Kanjivaram silk saree pleating, waist belt (Vaddanam) & jewelry setting",
    "Authentic long-wear products resistant to oil & humidity",
  ],
  "christian-bridal-makeup": [
    "Sophisticated European-style daylight radiant glass skin",
    "Soft nude or rose-gold shimmer eyes with natural wispy lashes",
    "Classic textured updo, romantic waves, or Hollywood curls",
    "Bridal veil & tiara/headpiece placement with pristine pin-up",
    "Lightweight, breathable luxury cosmetics with zero cakey feel",
  ],

  // Party & Occasion Makeup
  "party-makeup-and-hair": [
    "Flawless HD party base suited for evening lights & photography",
    "Custom eye glam (Smokey, Shimmer, or Nude) with lashes included",
    "Trending hairstyle (Textured Curls, Hollywood Waves, or Chic Bun)",
    "Saree / Dupatta / Lehenga draping assistance included",
    "100% authentic international cosmetics (MAC, Huda, Kryolan)",
  ],
  "engagement-makeup": [
    "Radiant HD or Airbrush base for ring ceremony photography",
    "Romantic rose-gold or bronze smoky eyes with fluttery lashes",
    "Contemporary bridal hairstyle with baby's breath or hair accessory",
    "Engagement gown / lehenga draping & dupatta styling",
    "Long-lasting, smudge-proof formulation for 10+ hours",
  ],
  "reception-makeup": [
    "High-definition glamorous reception base with sculptured contouring",
    "Sultry evening eye glam with dramatic lashes",
    "Voluminous Hollywood waves, sleek updo, or textured messy bun",
    "Gown / heavy lehenga draping & jewelry placement",
    "High-shine glass finish that dazzles under stage spotlights",
  ],
  "sangeet-cocktail-party-makeup": [
    "Glitter / metallic smoky eyes designed for dance & cocktail parties",
    "Sweat-resistant, dance-proof HD base that stays intact all night",
    "Dynamic hairstyle (high ponytail, textured curls, or boho braid)",
    "Dupatta & outfit pin-up designed for active dancing",
    "False eyelashes & setting spray lock included",
  ],
  "haldi-ceremony-makeup": [
    "Fresh, dewy yellow-toned sun-kissed morning base",
    "Waterproof & smudge-resistant eye makeup that survives floral splash",
    "Boho floral hairdo with real or artificial yellow floral pins",
    "Light dupatta drape suited for comfortable sitting",
    "Non-greasy, breathable makeup that won't run with Haldi paste",
  ],
  "mehndi-function-makeup": [
    "Vibrant, colorful eye glam matching your Mehndi outfit",
    "Dewy glass-skin base with natural highlighted radiance",
    "Messy side braid or floral bun suited for sitting through mehndi",
    "Dupatta pin-up keeping hands completely free for henna application",
    "Featherweight formula that feels comfortable for 4+ hours",
  ],
  "baby-shower-godh-bharai-makeup": [
    "Soft, glowing maternal radiance base with gentle skin-safe products",
    "Subtle, flattering eye makeup with soft natural lashes",
    "Comfortable festive hairstyle (soft curls or neat floral bun)",
    "Traditional Godh Bharai saree or lehenga draping",
    "Safe, fragrance-free, non-comedogenic luxury cosmetics",
  ],
  "birthday-party-makeup": [
    "Youthful, radiant party base matching your birthday party vibe",
    "Trendy graphic liner, soft shimmer, or Korean glass glow eyes",
    "Bouncy blow-dry, beach waves, or sleek straight hair styling",
    "Outfit styling & touch-up tips before your celebration starts",
    "Lightweight, photogenic finish with zero white cast",
  ],
  "wedding-guest-makeup": [
    "Elegant, camera-ready festive makeup that complements your outfit",
    "Classic eye glam with natural falsies included",
    "Quick and chic hair styling (curls, waves, or neat blow-dry)",
    "Saree or dupatta draping assistance",
    "Quick 45–60 minute service so you're ready right on schedule",
  ],
  "bridesmaid-family-makeup": [
    "Polished HD festive makeup coordinating with the bridal party",
    "Soft glam eyes with false lashes included",
    "Hairstyle of your choice (soft curls, half-up half-down, or bun)",
    "Saree, lehenga, or anarkali dupatta draping",
    "Premium authentic cosmetics that last throughout the wedding",
  ],
  "korean-glass-skin-makeup": [
    "Ultra-hydrated, translucent glass-skin base application",
    "Aegyo-sal subtle eye shimmer & natural feathery brows",
    "Soft gradient gradient-lip tint & peach/coral cream blush",
    "Minimalist Korean straight waves or soft curtain bangs styling",
    "Imported K-beauty skincare prep and hydrating skin mists",
  ],
  "nude-no-makeup-look": [
    "Barely-there sheer coverage base that looks like real glowing skin",
    "Defined feathery brows, subtle mascara & neutral tone shading",
    "Natural tinted lip balm & healthy cheek stain",
    "Natural textured blow-dry or effortless daily waves",
    "Ideal for corporate events, daylight brunches, and casual shoots",
  ],
  "groom-makeup-grooming": [
    "Invisible beard grooming, hairline cleanup & stray hair trim",
    "Oil-control anti-shine HD matte skin prep (zero visible makeup)",
    "Undereye dark circle correction & skin tone evening",
    "Turban / Safa pin-up & brooch alignment assistance",
    "100% natural, undetectable finish calibrated for HD photography",
  ],
  "pre-wedding-photoshoot-makeup": [
    "Weather-resistant, daylight-calibrated HD camera base",
    "2 distinct lip & eye tone touch-up adjustments for outfit changes",
    "Wind-resistant hair setting that holds through outdoor breezes",
    "Touch-up sponge & blot paper kit provided for the shoot",
    "Zero flashback under direct sunlight and high-flash lenses",
  ],
  "group-makeup-package": [
    "Complete HD makeup & hair styling for up to 3 family members",
    "False lashes & dupatta/saree draping included for all 3 guests",
    "Multiple artists dispatched to finish all looks simultaneously",
    "International cosmetic kits with separate sanitized brushes",
    "Coordinated doorstep arrival at your hotel or residence",
  ],
  "professional-makeup-artist-at-home": [
    "Consultation on skin tone, undertone & event lighting",
    "Complete customized makeup base with contouring & blush",
    "Eye makeup with false lashes & brows filled",
    "Hairstyling of your preference with heat protection spray",
    "Doorstep travel with vanity lights and professional makeup chair",
  ],

  // Facials & Skincare
  "facial-at-home": [
    "Deep double pore cleansing with steam & blackhead/whitehead removal",
    "Gentle scrub exfoliation & anti-tan skin polish",
    "15-minute relaxing pressure-point face, neck & shoulder massage",
    "Targeted brightening peel-off mask (O3+, Cheryl's, or Fruit)",
    "Fresh disposable gown, bedsheet, cotton pads & sanitized tools",
  ],
  "classic-cleanup": [
    "Herbal face wash & steam softening of congested pores",
    "Blackhead extraction using sterile, disposable extractor",
    "Gentle exfoliation scrub to remove dead surface skin cells",
    "Soothing skin purifying pack & cooling rosewater mist",
    "Moisturizing sunscreen application to seal fresh skin",
  ],
  "pigmentation-treatment-facial": [
    "Derma-grade skin analysis for hyperpigmentation & sun damage",
    "Vitamin-C & Kojic acid antioxidant deep infusion serum",
    "Gentle ultrasonic skin peeling & micro-exfoliation",
    "Melanin-inhibiting whitening peel-off rubber mask",
    "Targeted post-facial pigmentation home-care advice",
  ],
  "threading-eyebrow-upperlips": [
    "Organic cotton anti-bacterial thread used for precise arch shaping",
    "Upper lips & forehead hair removal with minimal sting",
    "Post-threading cooling aloe vera gel application",
    "Strict single-use thread discarded immediately after service",
    "Fast 15-minute doorstep service with zero redness",
  ],
  "premium-full-body-massage": [
    "Full body Swedish / Aroma relaxing massage by certified female masseuse",
    "Warm therapeutic essential oils (Lavender / Eucalyptus / Almond)",
    "Targeted relief for backache, tight shoulders & tired legs",
    "Disposable waterproof bedsheet & hygienic disposable undergarments",
    "Hot towel wipe-down leaving skin refreshed and non-sticky",
  ],
  "premium-full-body-polishing": [
    "Full-body walnut & argan oil exfoliating body scrub",
    "Removal of dead skin, tan & rough patches on elbows, knees & back",
    "Deep hydrating body butter wrap & relaxing body massage",
    "Skin brightening serum treatment for illuminated bridal glow",
    "Disposable single-use linen & warm sponge cleanup included",
  ],

  // Waxing
  "full-body-waxing-at-home": [
    "Full arms, full legs, underarms, back, stomach & choice of bikini",
    "Choice of painless Rica Wax or gentle Honey / Aloe Vera wax",
    "Pre-wax cleansing to remove sweat, oils & bacteria",
    "Post-wax soothing lotion & cooling oil to prevent bumps",
    "Disposable bedsheets & 100% single-use wooden spatulas (zero double-dipping)",
  ],
  "bikini-waxing-at-home": [
    "Choice of Rica Brazilian peel-off wax or soothing chocolate wax",
    "Complete privacy & hygienic service by experienced senior beautician",
    "Pre-wax numbing/soothing spray & sanitized area prep",
    "Post-wax anti-inflammatory cooling oil & aloe vera application",
    "Fresh disposable sheet & disposable undergarments provided",
  ],
  "full-arms-waxing": [
    "Full arms waxing from shoulders to wrists including underarms",
    "Painless strip pull technique that minimizes skin stretching",
    "Pre-wax powder prep & post-wax calming lotion",
    "Removal of fine hair, dead skin & surface tanning",
    "Single-use wooden spatulas and disposable wax strips",
  ],
  "full-legs-waxing": [
    "Full legs waxing from upper thighs to ankles & toes",
    "Effective removal of coarse ingrown hair & stubborn tan",
    "Rica / Honey wax options suited for sensitive skin",
    "Post-wax massage with soothing tea tree oil lotion",
    "Hygienic disposable floor mat and bedsheet setup",
  ],
  "full-back-waxing": [
    "Upper and lower back hair removal with smooth even finish",
    "Anti-bacterial pre-wax cleansing for acne-prone back skin",
    "Gentle peel-off wax that prevents red bumps & irritation",
    "Soothing calamine / aloe vera post-wax application",
    "Disposable sheet setup to keep your mattress completely clean",
  ],

  // Hair & Nails
  "hair-spa-at-home": [
    "Scalp analysis & clarifying shampoo wash",
    "Intense nourishing hair spa cream (L'Oreal Professional / Keratin)",
    "15-minute relaxing pressure-point head, neck & shoulder massage",
    "Warm steam towel wrap for deep follicular moisture lock",
    "Quick blast dry and anti-frizz shine serum application",
  ],
  "bridal-hair-styling": [
    "Heat protection prep & volume crimping/teasing for lasting hold",
    "Choice of Floral Bridal Bun, Hollywood Glam Waves, or Messy Braid",
    "Fresh flower (Gajra / Baby's breath) or jewelry pin-up",
    "Hair donut padding & premium U-pins that stay secure for 12+ hrs",
    "Strong-hold humidity-resistant setting spray finish",
  ],
  "anti-hair-fall-treatment": [
    "Scalp micro-circulation massage with targeted herbal concentrates",
    "High-frequency scalp stimulation / peptide hair root therapy",
    "Strengthening hair mask that reduces breakage & split ends",
    "Gentle leave-in scalp tonic application",
    "Expert maintenance tips and personalized hair-care routine",
  ],
  "hair-smoothing-treatment": [
    "Deep cleansing clarifying wash to prepare hair cuticles",
    "Formaldehyde-free keratin / botox smoothing cream application",
    "Precision flat-iron sealing lock at safe temperature",
    "Deep moisture mask rinse and silky blow-dry finish",
    "Eliminates 95% frizz and provides salon-smooth hair for 3+ months",
  ],
  "premium-hair-extensions-volumizing": [
    "100% natural human hair extensions matched to your hair texture",
    "Seamless clip-in or micro-ring fitting with zero damage to roots",
    "Cut, blend & styling (curls or straightening) with your natural hair",
    "Lightweight, secure hold that won't slip during dancing or events",
    "Safe removal guidance and storage pouch included",
  ],
  "classic-manicure-pedicure": [
    "Warm aromatic herbal foot & hand soak with bath salts",
    "Cuticle softening, precision trimming & nail filing",
    "Dead skin scrub, heel pumice filing & calloused patch buffing",
    "Relaxing 15-minute hand & foot massage with nourishing cream",
    "Sanitized tools, clean setup & disposable tub liner",
  ],
  "gel-nail-extensions": [
    "Nail prep, cuticle care & tip/form sculpting (Gel / Acrylic / Polygel)",
    "Choice of shape (Almond, Coffin, Square, or Stiletto)",
    "Gel polish shade of your choice with high-shine top coat",
    "UV/LED light curing that lasts chip-free for 3 to 4 weeks",
    "Nourishing cuticle oil massage to finish",
  ],

  // Draping & Mehndi
  "saree-draping-at-home": [
    "Professional pleating & height alignment for a flattering fall",
    "Choice of Classic Nivi, Gujarati, Bengali, or Modern Dhoti drape",
    "Secure concealed safety pinning that prevents fabric tears",
    "Pallu pleating & brooch positioning for easy movement",
    "Fast 15-minute doorstep service by expert draping artist",
  ],
  "bridal-saree-lehenga-draping": [
    "Heavy bridal lehenga skirt positioning with cancan fluffing",
    "Double-dupatta draping (head veil pin-up + shoulder diagonal drape)",
    "Jewelry weight balancing (Kamarbandh, Maang Tikka & Nath support)",
    "Extra secure pinning that withstands walking, sitting & stage photos",
    "Experienced bridal drapist ensuring zero discomfort",
  ],
  "bridal-mehndi-artist": [
    "Full traditional bridal mehndi up to elbows & mid-calf on feet",
    "Choice of Marwari, Arabic, Mandala, or Portrait figure designs",
    "100% chemical-free natural organic henna (deep mahogany stain guarantee)",
    "Eucalyptus oil prep & complimentary lemon-sugar sealant spray",
    "Senior bridal mehndi artist with clean, intricate line work",
  ],
  "party-guest-mehndi": [
    "Beautiful single or double-sided Arabic / Mandala design on hands",
    "Quick drying, rich staining natural organic henna cones",
    "Fast 10-15 minute application per hand for busy party schedules",
    "Lemon-sugar sealant spray applied after completion",
    "Doorstep booking available for individuals or family groups",
  ],
  "premium-eye-makeup-lash-extension": [
    "Smokey, glitter, or cut-crease eye makeup customized to eye shape",
    "Precision eyeliner & eyebrow sculpting with waterproof pomade",
    "Single-use Mink / 3D silk false lash application with safe glue",
    "Undereye brightening concealer with zero creasing",
    "Smudge-proof 12-hour wear formula",
  ],

  // Packages
  "pre-bridal-glow-package": [
    "O3+ Bridal Glow Facial & De-Tan Therapy",
    "Full Body Rica Waxing & Underarms",
    "Full Body Walnut Scrub & Skin Polishing",
    "Crystal Spa Manicure & Pedicure",
    "Deep Conditioning Hair Spa with Steam",
  ],
  "essential-glow-pre-bridal-package": [
    "Cheryl's Cosmeceuticals Radiance Facial",
    "Full Arms & Full Legs Rica Waxing",
    "Classic Rose Spa Manicure & Pedicure",
    "De-Tan Pack for Neck, Hands & Feet",
    "Threading (Eyebrow & Upper Lip) Included",
  ],
  "luxury-ultra-radiance-pre-bridal-package": [
    "24K Gold Luxury Facial with Ultrasonic Deep Infusion",
    "Full Body Chocolate / Rica Waxing with Bikini option",
    "Full Body Scrub, Milk Polish & Body Butter Wrap",
    "O3+ Luxury Mani-Pedi with Paraffin Wax Treatment",
    "L'Oreal Keratin Hair Spa & Blow-Dry",
  ],
  "pre-bridal-haldi-mehndi-glow-package": [
    "Instant Brightening Fruit/Herbal Facial & De-Tan",
    "Arms & Legs Waxing with gentle soothing wax",
    "Express Mani-Pedi with Nail Buff & Polish",
    "Eyebrow & Upper Lip Threading",
    "Quick 2-hour doorstep session 1 day before ceremonies",
  ],
  "luxe-party-glam-package": [
    "Complete HD Party Makeup with false lashes included",
    "Trending Hair Styling (Curls, Waves, or Festive Bun)",
    "Saree or Dupatta Draping with secure pin-up",
    "Express Nail Polish Application",
    "Doorstep artist travel included across Delhi NCR",
  ],
  "sangeet-family-glam-package": [
    "Party & Cocktail HD Makeup for 3 family members",
    "Hair Styling (Blowdry, Curls, or Bun) for all 3 guests",
    "Saree / Dupatta Draping for all 3 guests",
    "False Lashes included for everyone",
    "Multiple artists dispatched to save time before the event",
  ],
};

async function main() {
  console.log("Seeding 4-5 bullet points ('What is included') across all services...");

  // 1. Retire karva-chauth-makeup (seasonal off-season) into party makeup with 301
  const karva = await prisma.service.findUnique({ where: { slug: "karva-chauth-makeup" } });
  const party = await prisma.service.findUnique({ where: { slug: "party-makeup-and-hair" } });

  if (karva && party) {
    await prisma.service.update({
      where: { id: karva.id },
      data: {
        status: "INACTIVE",
        mergedIntoId: party.id,
      },
    });

    await prisma.redirect.upsert({
      where: { fromPath: "/services/karva-chauth-makeup" },
      update: {
        toPath: "/services/party-makeup-and-hair",
        code: "MOVED_301",
        note: "Karva Chauth seasonal service retired into Party Makeup",
      },
      create: {
        fromPath: "/services/karva-chauth-makeup",
        toPath: "/services/party-makeup-and-hair",
        code: "MOVED_301",
        note: "Karva Chauth seasonal service retired into Party Makeup",
      },
    });

    console.log(
      "✓ karva-chauth-makeup retired into /services/party-makeup-and-hair with 301 redirect!"
    );
  }

  // 2. Populate features for each active service
  const activeServices = await prisma.service.findMany({
    where: { status: "ACTIVE", mergedIntoId: null },
    select: { id: true, slug: true, title: true, category: { select: { slug: true } } },
  });

  let updatedCount = 0;

  for (const s of activeServices) {
    let items = FEATURE_TEMPLATES[s.slug];

    if (!items || items.length === 0) {
      // Fallback based on category
      if (s.category.slug === "bridal-makeup") {
        items = FEATURE_TEMPLATES["bridal-makeup-artist"];
      } else if (s.category.slug === "engagement-party-makeup") {
        items = FEATURE_TEMPLATES["party-makeup-and-hair"];
      } else if (s.category.slug === "facial-and-skincare") {
        items = FEATURE_TEMPLATES["facial-at-home"];
      } else if (s.category.slug === "waxing") {
        items = FEATURE_TEMPLATES["full-body-waxing-at-home"];
      } else if (s.category.slug === "hair-styling") {
        items = FEATURE_TEMPLATES["hair-spa-at-home"];
      } else if (s.category.slug === "nail-art") {
        items = FEATURE_TEMPLATES["classic-manicure-pedicure"];
      } else if (s.category.slug === "draping-eye-mehndi") {
        items = FEATURE_TEMPLATES["saree-draping-at-home"];
      } else {
        items = [
          "Consultation with senior verified beauty professional",
          "100% authentic luxury products & sterilized tools",
          "Clean hygienic setup & disinfected equipment provided",
          "Complete post-service cleanup leaving your home spotless",
          "Zero travel charges across Noida, Greater Noida & Delhi",
        ];
      }
    }

    const featuresText = items.join("; ");

    await prisma.service.update({
      where: { id: s.id },
      data: { features: featuresText },
    });

    updatedCount++;
    console.log(`✓ Features added for [${s.slug}]: ${items.length} bullet points`);
  }

  console.log(`\n=======================================================`);
  console.log(`✓ Successfully updated ${updatedCount} services with 4-5 bullet points!`);
  console.log(`=======================================================\n`);
}

main()
  .catch((e) => {
    console.error("Error seeding features:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
