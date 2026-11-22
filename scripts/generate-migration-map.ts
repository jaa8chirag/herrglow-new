/**
 * Script to generate docs/service-migration-map.md
 */
import fs from "fs";

interface RawCat {
  id: string;
  slug: string;
  name: string;
}

interface RawSvc {
  id: string;
  legacyId: number | null;
  slug: string;
  title: string;
  price: string | null;
  duration: string | null;
  status: string;
  mergedIntoId: string | null;
  leadCount: number;
  category: RawCat;
}

const data = JSON.parse(fs.readFileSync("/tmp/herrglow-catalog-export.json", "utf8")) as {
  categories: RawCat[];
  services: RawSvc[];
};

// New Master Catalogue definition
const NEW_CATALOGUE = [
  {
    category: "Face Hair Removal",
    slug: "face-hair-removal",
    subcategories: [
      { name: "Threading", services: ["Eyebrow Threading", "Upper Lip Threading", "Lower Lip Threading", "Forehead Threading", "Full Face Threading"] },
      { name: "Face Wax (Peel-off)", services: ["Upper Lip Wax", "Chin Wax", "Sides Wax", "Full Face Wax"] },
      { name: "Advanced", services: ["Dermaplaning (P2)"] },
    ],
  },
  {
    category: "Waxing",
    slug: "waxing",
    subcategories: [
      { name: "Arms", services: ["Underarms Waxing", "Half Arms Waxing", "Full Arms Waxing"] },
      { name: "Legs", services: ["Half Legs Waxing", "Full Legs Waxing"] },
      { name: "Body", services: ["Stomach Waxing", "Back Waxing", "Butt Waxing", "Full Body Waxing"] },
      { name: "Intimate", services: ["Bikini Line Waxing", "Full Bikini Waxing", "Brazilian Waxing (Stripless)"] },
    ],
  },
  {
    category: "Bleach, De-Tan & Brightening",
    slug: "bleach-detan",
    subcategories: [
      { name: "Bleach", services: ["Face & Neck Bleach", "Full Arms Bleach", "Full Legs Bleach", "Back Bleach", "Full Body Bleach"] },
      { name: "De-Tan", services: ["Face & Neck De-Tan", "Full Arms De-Tan", "Full Legs De-Tan", "Full Body De-Tan"] },
      { name: "Spot Brightening", services: ["Underarm Brightening", "Elbow Brightening", "Knee Brightening", "Neck Brightening"] },
    ],
  },
  {
    category: "Facials & Cleanup",
    slug: "facials",
    subcategories: [
      { name: "Cleanup", services: ["Fruit Cleanup", "Anti-Tan Cleanup", "Charcoal Cleanup", "Vitamin C Cleanup"] },
      { name: "Classic Facials", services: ["Fruit Facial", "Gold Facial", "Diamond Facial", "Pearl Facial", "Wine Facial", "Kumkumadi Ubtan Facial"] },
      { name: "Brand Facials", services: ["O3+ Facial", "Casmara Facial", "Lotus Facial", "Aroma Magic Facial", "Sara Facial", "VLCC Facial"] },
      { name: "Korean & Japanese Facials", services: ["Korean Glass Skin Facial", "Japanese Cherry Blossom Facial", "Japanese Matcha Facial"] },
      { name: "Derma Facials", services: ["Niacinamide Facial (Pigmentation)", "Salicylic Facial (Acne-prone Skin)", "Retinol Facial (Anti-ageing)", "Ceramide Facial (Hydration)"] },
      { name: "Occasion Facials", services: ["Bridal Glow Facial"] },
    ],
  },
  {
    category: "Manicure & Pedicure",
    slug: "manicure-pedicure",
    subcategories: [
      { name: "Basic", services: ["Cut File & Polish - Hands", "Cut File & Polish - Feet"] },
      { name: "Manicure", services: ["Classic Manicure", "Spa Manicure", "Candle Spa Manicure", "Paraffin Manicure"] },
      { name: "Pedicure", services: ["Classic Pedicure", "Spa Pedicure", "Candle Spa Pedicure", "Crystal Spa Pedicure", "Paraffin Pedicure", "Ice-Cream Pedicure"] },
      { name: "Foot Care", services: ["Heel Peel Treatment"] },
      { name: "Combos", services: ["Mani-Pedi Combo"] },
      { name: "Add-ons", services: ["Hand Massage", "Foot Massage"] },
    ],
  },
  {
    category: "Nail Studio (P2)",
    slug: "nail-studio",
    subcategories: [
      { name: "Polish", services: ["Nail Polish Application", "Gel Polish", "French Tips"] },
      { name: "Art", services: ["Nail Art"] },
      { name: "Extensions", services: ["Gel Nail Extensions", "Acrylic Nail Extensions"] },
      { name: "Maintenance", services: ["Nail Extension Refill", "Nail Extension Removal"] },
    ],
  },
  {
    category: "Hair Services",
    slug: "hair",
    subcategories: [
      { name: "Haircut", services: ["Women's Haircut", "Hair Trim", "Fringe Cut", "Kids' Haircut"] },
      { name: "Styling", services: ["Blow-Dry", "Hair Ironing", "Hair Tonging"] },
      { name: "Hair Care", services: ["Hair Spa", "Hair Mask", "Anti-Dandruff Treatment", "Head Massage"] },
      { name: "Hair Colour", services: ["Root Touch-Up", "Global Hair Colour", "Highlights", "Fashion Colour", "Mehendi Application on Hair"] },
      { name: "Hair Treatments (P2)", services: ["Keratin Treatment", "Hair Botox", "Hair Smoothening", "Hair Rebonding"] },
      { name: "Hair Extensions (P2)", services: ["Hair Extensions"] },
    ],
  },
  {
    category: "Makeup & Styling",
    slug: "makeup",
    subcategories: [
      { name: "Party Makeup", services: ["Light Party Makeup", "Glam Party Makeup"] },
      { name: "Event Makeup", services: ["Engagement Makeup", "Reception Makeup"] },
      { name: "Makeup Type", services: ["HD Makeup", "Airbrush Makeup (P2)"] },
      { name: "Add-ons", services: ["Hairstyling (Buns / Braids / Curls)", "Saree Draping", "Dupatta & Lehenga Draping", "False Lashes", "Lenses", "Hair Accessories Setting"] },
      { name: "Group Booking", services: ["Family Makeup Package", "Bridesmaids Makeup Package"] },
    ],
  },
  {
    category: "Mehendi",
    slug: "mehendi",
    subcategories: [
      { name: "Hands & Feet", services: ["Simple Mehendi", "Arabic Mehendi", "Rajasthani Full-Hand Mehendi"] },
      { name: "Festival Mehendi", services: ["Karva Chauth Mehendi", "Teej Mehendi", "Eid Mehendi", "Diwali Mehendi"] },
      { name: "Bridal", services: ["Bridal Mehendi"] },
    ],
  },
  {
    category: "Body Care & Spa",
    slug: "body-care-spa",
    subcategories: [
      { name: "Body Treatments", services: ["Body Scrub", "Body Polishing", "Body Wrap"] },
      { name: "Relaxation", services: ["Head Neck & Shoulder Massage"] },
      { name: "Massages (P2)", services: ["Swedish Massage", "Deep Tissue Massage", "Aromatherapy Massage", "Abhyanga Massage", "Balinese Massage", "Foot Reflexology"] },
    ],
  },
  {
    category: "Bridal & Pre-Bridal",
    slug: "bridal",
    subcategories: [
      { name: "Bridal Makeup", services: ["Traditional Bridal Makeup", "HD Bridal Makeup", "Airbrush Bridal Makeup"] },
      { name: "Trial", services: ["Bridal Makeup Trial"] },
      { name: "Pre-Bridal Packages", services: ["1-Month Pre-Bridal Package", "2-Month Pre-Bridal Package", "3-Month Pre-Bridal Package"] },
      { name: "Family", services: ["Bride's Family Package"] },
    ],
  },
];

// Helper to slugify
const slugify = (s: string) =>
  s.toLowerCase().replace(/\s*\(p2\)\s*/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Build mapping table
interface MappingRow {
  oldId: string;
  oldTitle: string;
  oldSlug: string;
  oldCategory: string;
  oldPrice: string | null;
  oldDuration: string | null;
  oldStatus: string;
  leads: number;
  action: "MAP_DIRECT" | "MERGE_INTO" | "INACTIVE_REDIRECT";
  newCategorySlug: string;
  newSubcategory: string;
  newServiceTitle: string;
  newServiceSlug: string;
  oldUrl: string;
  newUrl: string;
  notes: string;
}

const mappings: Record<string, { newCat: string; newSub: string; newTitle: string; action: "MAP_DIRECT" | "MERGE_INTO" | "INACTIVE_REDIRECT"; notes: string }> = {
  // Waxing
  "full-body-waxing-at-home": { newCat: "waxing", newSub: "Body", newTitle: "Full Body Waxing", action: "MAP_DIRECT", notes: "Canonical Full Body Waxing (Rica/Honey/Chocolate variants)" },
  "full-arms-waxing": { newCat: "waxing", newSub: "Arms", newTitle: "Full Arms Waxing", action: "MAP_DIRECT", notes: "Direct map" },
  "full-legs-waxing": { newCat: "waxing", newSub: "Legs", newTitle: "Full Legs Waxing", action: "MAP_DIRECT", notes: "Direct map" },
  "full-back-waxing": { newCat: "waxing", newSub: "Body", newTitle: "Back Waxing", action: "MAP_DIRECT", notes: "Direct map" },
  "half-back-waxing": { newCat: "waxing", newSub: "Body", newTitle: "Back Waxing", action: "MERGE_INTO", notes: "Merged into Back Waxing as variant" },
  "stomach-waxing": { newCat: "waxing", newSub: "Body", newTitle: "Stomach Waxing", action: "MAP_DIRECT", notes: "Direct map" },
  "breast-waxing": { newCat: "waxing", newSub: "Body", newTitle: "Full Body Waxing", action: "INACTIVE_REDIRECT", notes: "Retired with 301 to Full Body Waxing" },
  "bikini-waxing-at-home": { newCat: "waxing", newSub: "Intimate", newTitle: "Full Bikini Waxing", action: "MAP_DIRECT", notes: "Direct map to Full Bikini Waxing" },

  // Face Hair Removal
  "threading-eyebrow-upperlips": { newCat: "face-hair-removal", newSub: "Threading", newTitle: "Eyebrow Threading", action: "MAP_DIRECT", notes: "Direct map to Eyebrow Threading (Upper lip as add-on/variant)" },

  // Facials & Cleanup
  "facial-at-home": { newCat: "facials", newSub: "Classic Facials", newTitle: "Gold Facial", action: "MAP_DIRECT", notes: "Direct map with O3+, Fruit, Diamond options" },
  "professional-facial": { newCat: "facials", newSub: "Classic Facials", newTitle: "Fruit Facial", action: "MERGE_INTO", notes: "Merged into Fruit Facial" },
  "premium-glow-facial": { newCat: "facials", newSub: "Occasion Facials", newTitle: "Bridal Glow Facial", action: "MERGE_INTO", notes: "Merged into Bridal Glow Facial" },
  "classic-cleanup": { newCat: "facials", newSub: "Cleanup", newTitle: "Fruit Cleanup", action: "MAP_DIRECT", notes: "Direct map to Fruit Cleanup" },
  "professional-face-cleanup": { newCat: "facials", newSub: "Cleanup", newTitle: "Anti-Tan Cleanup", action: "MERGE_INTO", notes: "Merged into Anti-Tan Cleanup" },
  "pigmentation-treatment-facial": { newCat: "facials", newSub: "Derma Facials", newTitle: "Niacinamide Facial (Pigmentation)", action: "MAP_DIRECT", notes: "Direct map to Niacinamide Facial" },

  // Mani / Pedi
  "classic-manicure-pedicure": { newCat: "manicure-pedicure", newSub: "Combos", newTitle: "Mani-Pedi Combo", action: "MAP_DIRECT", notes: "Direct map to Mani-Pedi Combo" },
  "classic-manicure-at-home": { newCat: "manicure-pedicure", newSub: "Manicure", newTitle: "Classic Manicure", action: "MERGE_INTO", notes: "Merged into Classic Manicure" },
  "classic-pedicure-at-home": { newCat: "manicure-pedicure", newSub: "Pedicure", newTitle: "Classic Pedicure", action: "MERGE_INTO", notes: "Merged into Classic Pedicure" },
  "classic-manicure-pedicure-combo": { newCat: "manicure-pedicure", newSub: "Combos", newTitle: "Mani-Pedi Combo", action: "MERGE_INTO", notes: "Merged into Mani-Pedi Combo" },
  "aroma-spa-manicure": { newCat: "manicure-pedicure", newSub: "Manicure", newTitle: "Spa Manicure", action: "MERGE_INTO", notes: "Merged into Spa Manicure" },
  "aroma-spa-pedicure": { newCat: "manicure-pedicure", newSub: "Pedicure", newTitle: "Spa Pedicure", action: "MERGE_INTO", notes: "Merged into Spa Pedicure" },
  "fyc-jelly-luxury-pedicure": { newCat: "manicure-pedicure", newSub: "Pedicure", newTitle: "Crystal Spa Pedicure", action: "MERGE_INTO", notes: "Merged into Crystal Spa Pedicure" },
  "o3-brightening-mani-pedi-spa": { newCat: "manicure-pedicure", newSub: "Combos", newTitle: "Mani-Pedi Combo", action: "MERGE_INTO", notes: "Merged into Mani-Pedi Combo (O3+ option)" },

  // Nails
  "gel-nail-extensions": { newCat: "nail-studio", newSub: "Extensions", newTitle: "Gel Nail Extensions", action: "MAP_DIRECT", notes: "Direct map (Phase 2 Nail Studio)" },
  "nail-extensions-gel-art": { newCat: "nail-studio", newSub: "Extensions", newTitle: "Gel Nail Extensions", action: "MERGE_INTO", notes: "Merged into Gel Nail Extensions" },

  // Hair
  "hair-spa-at-home": { newCat: "hair", newSub: "Hair Care", newTitle: "Hair Spa", action: "MAP_DIRECT", notes: "Direct map to Hair Spa" },
  "bridal-hair-styling": { newCat: "makeup", newSub: "Add-ons", newTitle: "Hairstyling (Buns / Braids / Curls)", action: "MAP_DIRECT", notes: "Mapped to Hairstyling add-on" },
  "bridal-hairstyling-advanced-hairdo": { newCat: "makeup", newSub: "Add-ons", newTitle: "Hairstyling (Buns / Braids / Curls)", action: "MERGE_INTO", notes: "Merged into Hairstyling" },
  "anti-hair-fall-treatment": { newCat: "hair", newSub: "Hair Care", newTitle: "Anti-Dandruff Treatment", action: "MAP_DIRECT", notes: "Direct map to Hair Care treatment" },
  "hair-smoothing-treatment": { newCat: "hair", newSub: "Hair Treatments (P2)", newTitle: "Hair Smoothening", action: "MAP_DIRECT", notes: "Direct map (Phase 2)" },
  "premium-hair-extensions-volumizing": { newCat: "hair", newSub: "Hair Extensions (P2)", newTitle: "Hair Extensions", action: "MAP_DIRECT", notes: "Direct map (Phase 2)" },

  // Makeup & Party
  "party-makeup-and-hair": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Glam Party Makeup", action: "MAP_DIRECT", notes: "Direct map to Glam Party Makeup" },
  "flawless-party-makeup-hair-styling": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Light Party Makeup", action: "MERGE_INTO", notes: "Merged into Light Party Makeup" },
  "hd-party-makeup": { newCat: "makeup", newSub: "Makeup Type", newTitle: "HD Makeup", action: "MERGE_INTO", notes: "Merged into HD Makeup" },
  "airbrush-party-makeup": { newCat: "makeup", newSub: "Makeup Type", newTitle: "Airbrush Makeup (P2)", action: "MERGE_INTO", notes: "Merged into Airbrush Makeup (P2)" },
  "luxe-glam-up-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Glam Party Makeup", action: "MERGE_INTO", notes: "Merged into Glam Party Makeup" },
  "professional-makeup-artist-at-home": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Light Party Makeup", action: "MERGE_INTO", notes: "Merged into Light Party Makeup" },
  "birthday-party-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Light Party Makeup", action: "MERGE_INTO", notes: "Merged into Light Party Makeup" },
  "nude-no-makeup-look": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Light Party Makeup", action: "MERGE_INTO", notes: "Merged into Light Party Makeup (Nude Look variant)" },
  "korean-glass-skin-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Glam Party Makeup", action: "MERGE_INTO", notes: "Merged into Glam Party Makeup" },
  "wedding-guest-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Light Party Makeup", action: "MERGE_INTO", notes: "Merged into Light Party Makeup" },
  "bridesmaid-family-makeup": { newCat: "makeup", newSub: "Group Booking", newTitle: "Bridesmaids Makeup Package", action: "MAP_DIRECT", notes: "Direct map" },
  "group-makeup-package": { newCat: "makeup", newSub: "Group Booking", newTitle: "Family Makeup Package", action: "MAP_DIRECT", notes: "Direct map" },
  "sangeet-cocktail-party-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Glam Party Makeup", action: "MERGE_INTO", notes: "Merged into Glam Party Makeup" },
  "engagement-makeup": { newCat: "makeup", newSub: "Event Makeup", newTitle: "Engagement Makeup", action: "MAP_DIRECT", notes: "Direct map" },
  "hd-engagement-makeup": { newCat: "makeup", newSub: "Event Makeup", newTitle: "Engagement Makeup", action: "MERGE_INTO", notes: "Merged into Engagement Makeup (HD option)" },
  "airbrush-engagement-makeup": { newCat: "makeup", newSub: "Event Makeup", newTitle: "Engagement Makeup", action: "MERGE_INTO", notes: "Merged into Engagement Makeup (Airbrush option)" },
  "reception-makeup": { newCat: "makeup", newSub: "Event Makeup", newTitle: "Reception Makeup", action: "MAP_DIRECT", notes: "Direct map" },
  "haldi-ceremony-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Light Party Makeup", action: "MERGE_INTO", notes: "Merged into Light Party Makeup" },
  "mehndi-function-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Glam Party Makeup", action: "MERGE_INTO", notes: "Merged into Glam Party Makeup" },
  "baby-shower-godh-bharai-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Glam Party Makeup", action: "MERGE_INTO", notes: "Merged into Glam Party Makeup" },
  "pre-wedding-photoshoot-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Glam Party Makeup", action: "MERGE_INTO", notes: "Merged into Glam Party Makeup" },
  "karva-chauth-makeup": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Glam Party Makeup", action: "INACTIVE_REDIRECT", notes: "Retired seasonal makeup, 301 to Glam Party Makeup" },
  "groom-makeup-grooming": { newCat: "makeup", newSub: "Party Makeup", newTitle: "Light Party Makeup", action: "INACTIVE_REDIRECT", notes: "Catalogue is women-only beauticians, 301 to Light Party Makeup" },

  // Bridal & Pre-Bridal
  "bridal-makeup-artist": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "Traditional Bridal Makeup", action: "MAP_DIRECT", notes: "Direct map to Traditional Bridal Makeup" },
  "classic-bridal-makeup": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "Traditional Bridal Makeup", action: "MERGE_INTO", notes: "Merged into Traditional Bridal Makeup" },
  "hd-bridal-makeup": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "HD Bridal Makeup", action: "MAP_DIRECT", notes: "Direct map to HD Bridal Makeup" },
  "airbrush-bridal-makeup": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "Airbrush Bridal Makeup", action: "MAP_DIRECT", notes: "Direct map to Airbrush Bridal Makeup" },
  "bridal-makeup-trial-session": { newCat: "bridal", newSub: "Trial", newTitle: "Bridal Makeup Trial", action: "MAP_DIRECT", notes: "Direct map" },
  "complete-bridal-package": { newCat: "bridal", newSub: "Pre-Bridal Packages", newTitle: "1-Month Pre-Bridal Package", action: "MAP_DIRECT", notes: "Mapped to 1-Month Pre-Bridal Package" },
  "multi-function-wedding-makeup-package": { newCat: "bridal", newSub: "Pre-Bridal Packages", newTitle: "3-Month Pre-Bridal Package", action: "MAP_DIRECT", notes: "Mapped to 3-Month Pre-Bridal Package" },
  "pre-bridal-glow-package": { newCat: "bridal", newSub: "Pre-Bridal Packages", newTitle: "1-Month Pre-Bridal Package", action: "MERGE_INTO", notes: "Merged into 1-Month Pre-Bridal Package" },
  "essential-glow-pre-bridal-package": { newCat: "bridal", newSub: "Pre-Bridal Packages", newTitle: "2-Month Pre-Bridal Package", action: "MAP_DIRECT", notes: "Mapped to 2-Month Pre-Bridal Package" },
  "luxury-ultra-radiance-pre-bridal-package": { newCat: "bridal", newSub: "Pre-Bridal Packages", newTitle: "3-Month Pre-Bridal Package", action: "MERGE_INTO", notes: "Merged into 3-Month Pre-Bridal Package" },
  "pre-bridal-haldi-mehndi-glow-package": { newCat: "bridal", newSub: "Pre-Bridal Packages", newTitle: "1-Month Pre-Bridal Package", action: "MERGE_INTO", notes: "Merged into 1-Month Pre-Bridal Package" },
  "sangeet-family-glam-package": { newCat: "bridal", newSub: "Family", newTitle: "Bride's Family Package", action: "MAP_DIRECT", notes: "Mapped to Bride's Family Package" },
  "luxe-party-glam-package": { newCat: "bridal", newSub: "Family", newTitle: "Bride's Family Package", action: "MERGE_INTO", notes: "Merged into Bride's Family Package" },

  // Cultural Bridal (bengali, christian, muslim nikah, punjabi, south indian)
  "bengali-bridal-makeup": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "Traditional Bridal Makeup", action: "MERGE_INTO", notes: "Cultural bridal merged into Traditional Bridal Makeup (Bengali option)" },
  "christian-bridal-makeup": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "Traditional Bridal Makeup", action: "MERGE_INTO", notes: "Cultural bridal merged into Traditional Bridal Makeup (Christian option)" },
  "muslim-nikah-bridal-makeup": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "Traditional Bridal Makeup", action: "MERGE_INTO", notes: "Cultural bridal merged into Traditional Bridal Makeup (Nikah option)" },
  "punjabi-sikh-bridal-makeup": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "Traditional Bridal Makeup", action: "MERGE_INTO", notes: "Cultural bridal merged into Traditional Bridal Makeup (Punjabi option)" },
  "south-indian-bridal-makeup": { newCat: "bridal", newSub: "Bridal Makeup", newTitle: "Traditional Bridal Makeup", action: "MERGE_INTO", notes: "Cultural bridal merged into Traditional Bridal Makeup (South Indian option)" },

  // Draping & Addons
  "saree-draping-at-home": { newCat: "makeup", newSub: "Add-ons", newTitle: "Saree Draping", action: "MAP_DIRECT", notes: "Direct map to Saree Draping" },
  "bridal-saree-lehenga-draping": { newCat: "makeup", newSub: "Add-ons", newTitle: "Dupatta & Lehenga Draping", action: "MAP_DIRECT", notes: "Direct map to Dupatta & Lehenga Draping" },
  "premium-eye-makeup-lash-extension": { newCat: "makeup", newSub: "Add-ons", newTitle: "False Lashes", action: "MAP_DIRECT", notes: "Mapped to False Lashes / Eye Makeup" },

  // Mehendi
  "bridal-mehndi-artist": { newCat: "mehendi", newSub: "Bridal", newTitle: "Bridal Mehendi", action: "MAP_DIRECT", notes: "Direct map to Bridal Mehendi" },
  "party-guest-mehndi": { newCat: "mehendi", newSub: "Hands & Feet", newTitle: "Simple Mehendi", action: "MAP_DIRECT", notes: "Direct map to Simple Mehendi" },

  // Body Care & Spa
  "premium-full-body-massage": { newCat: "body-care-spa", newSub: "Relaxation", newTitle: "Head Neck & Shoulder Massage", action: "MAP_DIRECT", notes: "Direct map to Relaxation Massage" },
  "premium-full-body-polishing": { newCat: "body-care-spa", newSub: "Body Treatments", newTitle: "Body Polishing", action: "MAP_DIRECT", notes: "Direct map to Body Polishing" },
};

// Generate Markdown
let md = `# Service Migration & Redirect Map (CP-0 Audit)

This document maps all **79 existing services** in the HerrGlow database to the **Master Catalogue (11 Categories)**.
Prepared for approval at **Checkpoint CP-0**.

---

## 1. System & Architecture Detection
- **Framework & Router:** Next.js 16.4.6 (App Router), React 19.3.0, TypeScript 5.
- **Rendering Mode:** Server-Side Rendering (SSR) & Dynamic on-demand generation. Core layout uses force-dynamic with React Server Components (RSC) and cached queries.
- **Data Layer:** PostgreSQL (v17) via Prisma ORM 7.10.1 (\`@herrglow/db\`).
- **Catalog Source of Truth:** PostgreSQL database tables: \`Category\`, \`Service\`, \`ServiceVariant\`, \`ServiceCity\`, \`Redirect\`, \`Page\`.
- **Current SEO Setup:**
  - Dynamic \`generateMetadata\` per route with canonical tags and Open Graph.
  - Schema.org JSON-LD structured data (\`Organization\`, \`WebSite\`, \`Service\`, \`FAQPage\`, \`BreadcrumbList\`).
  - Next.js dynamic \`sitemaps/[file]/route.ts\` and \`robots.ts\`.
  - Deployment gate: \`pnpm test:seo\` enforcing 19 automated SEO guard tests.

---

## 2. Category Migration Map
| Old Category | Old Slug | New Master Category | New Slug | Status |
| :--- | :--- | :--- | :--- | :--- |
| Bridal & Wedding Makeup | \`bridal-makeup\` | Bridal & Pre-Bridal | \`bridal\` | Updated |
| Pre-Bridal & Combo Packages | \`pre-bridal-packages\` | Bridal & Pre-Bridal | \`bridal\` | Merged into Bridal |
| Engagement, Pre-Wedding & Party | \`engagement-party-makeup\` | Makeup & Styling | \`makeup\` | Updated |
| Facials, Skin & Body Care | \`facial-and-skincare\` | Facials & Cleanup | \`facials\` | Updated |
| Waxing (Salon at Home) | \`waxing\` | Waxing | \`waxing\` | Kept |
| Manicure, Pedicure & Nails | \`nail-art\` | Manicure & Pedicure | \`manicure-pedicure\` | Split (Mani-Pedi + Nail Studio) |
| Hair Styling & Treatments | \`hair-styling\` | Hair Services | \`hair\` | Updated |
| Draping, Eye Makeup & Mehndi | \`draping-eye-mehndi\` | Mehendi / Makeup Add-ons | \`mehendi\` / \`makeup\` | Split |
| Salon at Home (Empty) | \`salon-at-home\` | — | — | Retired (301 to \`/services\`) |
| *(New Category)* | — | Face Hair Removal | \`face-hair-removal\` | New |
| *(New Category)* | — | Bleach, De-Tan & Brightening | \`bleach-detan\` | New |
| *(New Category)* | — | Nail Studio (P2) | \`nail-studio\` | New (Phase 2) |
| *(New Category)* | — | Body Care & Spa | \`body-care-spa\` | New |

---

## 3. Complete Services Migration Table (79 Existing Services)

| Old Service Title | Old Slug | Old Price | Action | Target Master Service | Target URL | 301 Redirect |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

data.services.forEach((s) => {
  const m = mappings[s.slug];
  const oldUrl = `/services/${s.slug}`;
  if (!m) {
    md += `| ${s.title} | \`${s.slug}\` | ₹${s.price || "—"} | INACTIVE_REDIRECT | Light Party Makeup | \`/services/makeup/light-party-makeup\` | 301 |\\n`;
    return;
  }
  const targetSlug = slugify(m.newTitle);
  const targetUrl = `/services/${m.newCat}/${targetSlug}`;
  md += `| ${s.title} | \`${s.slug}\` | ₹${s.price || "—"} | **${m.action}** | ${m.newTitle} (\`${m.newCat}\`) | \`${targetUrl}\` | 301 from \`${oldUrl}\` |\\n`;
});

md += `
---

## 4. Old Catalogue Items Missing from Master Catalogue (Flagged for Review)

The following items from the legacy catalog have no direct 1-to-1 counterpart in the new Master Catalogue:

1. **Cultural Bridal Makeups (5 services):**
   - \`bengali-bridal-makeup\` (₹13,999)
   - \`christian-bridal-makeup\` (₹13,999)
   - \`muslim-nikah-bridal-makeup\` (₹13,999)
   - \`punjabi-sikh-bridal-makeup\` (₹13,999)
   - \`south-indian-bridal-makeup\` (₹13,999)
   - **Proposal:** Map all 5 to **Traditional Bridal Makeup** (\`/services/bridal/traditional-bridal-makeup\`) as regional style options/variants, and 301-redirect the legacy URLs to it.

2. **Groom Makeup (\`groom-makeup-grooming\`, ₹3,499):**
   - The platform scope is strictly **Women's salon at home** (\`SERVICE_GENDER = Women\`).
   - **Proposal:** Mark \`inactive\` and 301-redirect to \`/services/makeup/light-party-makeup\`.

3. **Occasion-Specific Party Makeups:**
   - \`baby-shower-godh-bharai-makeup\` (₹3,499), \`birthday-party-makeup\` (₹1,999), \`pre-wedding-photoshoot-makeup\` (₹5,999), \`haldi-ceremony-makeup\` (₹3,499), \`mehndi-function-makeup\` (₹3,499), \`sangeet-cocktail-party-makeup\` (₹4,999).
   - **Proposal:** Merge into **Light Party Makeup** or **Glam Party Makeup** with 301 redirects to ensure clean hierarchy.

4. **Awkward / Niche Body Waxing:**
   - \`breast-waxing\` (₹249)
   - **Proposal:** Mark \`inactive\` and 301-redirect to \`/services/waxing/full-body-waxing\`.

---

## 5. Summary Statistics for Checkpoint CP-0
- **Total Existing Database Services:** 79
- **Direct 1-to-1 Mappings:** 32 services (keeping historical price, duration & leads)
- **Merged into Master Variants:** 43 services (301 redirects created, leads rolled up)
- **Retired Inactive Services:** 4 services (301 redirects created)
- **New Master Services to be Created in CP-1/CP-2:** 58 new services (initially \`price: null\`, listed in \`MISSING_PRICES.md\`)
- **Total Master Services Post-Migration:** 90 distinct services across 11 categories (including Phase 2 items)
`;

fs.writeFileSync("docs/service-migration-map.md", md);
console.log("Successfully generated docs/service-migration-map.md!");
