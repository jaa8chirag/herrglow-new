/**
 * Checkpoint CP-2: Seed Master Catalogue & Migrate Services
 * - Seeds 11 master categories
 * - Seeds all subcategories
 * - Seeds all master services with options (Phase 2 marked COMING_SOON)
 * - Migrates existing service data (prices, durations, leads, features, images)
 * - Creates 301 redirects for all legacy service URLs and category URLs
 * - Deactivates deprecated/merged services (status: INACTIVE)
 * - Generates MISSING_PRICES.md
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma, Status, RedirectCode } from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");

interface MasterCategoryDef {
  slug: string;
  name: string;
  icon: string;
  displayOrder: number;
  shortDescription: string;
  subcategories: MasterSubcategoryDef[];
}

interface MasterSubcategoryDef {
  slug: string;
  name: string;
  displayOrder: number;
  options?: Record<string, string[]>;
  services: MasterServiceDef[];
}

interface MasterServiceDef {
  title: string;
  slug: string;
  isP2?: boolean;
  options?: Record<string, string[]>;
}

// ───────── MASTER CATALOGUE DEFINITIONS (Single Source of Truth) ─────────
const MASTER_CATALOGUE: MasterCategoryDef[] = [
  {
    slug: "face-hair-removal",
    name: "Face Hair Removal",
    icon: "sparkles",
    displayOrder: 1,
    shortDescription: "Precise threading, gentle peel-off face waxing, and dermaplaning at home by certified female beauticians.",
    subcategories: [
      {
        slug: "threading",
        name: "Threading",
        displayOrder: 1,
        services: [
          { title: "Eyebrow Threading", slug: "eyebrow-threading" },
          { title: "Upper Lip Threading", slug: "upper-lip-threading" },
          { title: "Lower Lip Threading", slug: "lower-lip-threading" },
          { title: "Forehead Threading", slug: "forehead-threading" },
          { title: "Full Face Threading", slug: "full-face-threading" },
        ],
      },
      {
        slug: "face-wax-peel-off",
        name: "Face Wax (Peel-off)",
        displayOrder: 2,
        services: [
          { title: "Upper Lip Wax", slug: "upper-lip-wax" },
          { title: "Chin Wax", slug: "chin-wax" },
          { title: "Sides Wax", slug: "sides-wax" },
          { title: "Full Face Wax", slug: "full-face-wax" },
        ],
      },
      {
        slug: "advanced",
        name: "Advanced",
        displayOrder: 3,
        services: [
          { title: "Dermaplaning", slug: "dermaplaning", isP2: true },
        ],
      },
    ],
  },
  {
    slug: "waxing",
    name: "Waxing",
    icon: "sparkles",
    displayOrder: 2,
    shortDescription: "Silky smooth waxing for arms, legs, body and bikini using premium Rica, Honey, and Chocolate waxes.",
    subcategories: [
      {
        slug: "arms",
        name: "Arms",
        displayOrder: 1,
        options: {
          wax_type: ["Regular/Honey", "Rica", "Rica Roll-on", "Rica Peel-off", "Chocolate", "Aloe Vera", "Hard Wax (sensitive skin / pregnancy)"],
        },
        services: [
          { title: "Underarms Waxing", slug: "underarms-waxing" },
          { title: "Half Arms Waxing", slug: "half-arms-waxing" },
          { title: "Full Arms Waxing", slug: "full-arms-waxing" },
        ],
      },
      {
        slug: "legs",
        name: "Legs",
        displayOrder: 2,
        options: {
          wax_type: ["Regular/Honey", "Rica", "Rica Roll-on", "Rica Peel-off", "Chocolate", "Aloe Vera", "Hard Wax (sensitive skin / pregnancy)"],
        },
        services: [
          { title: "Half Legs Waxing", slug: "half-legs-waxing" },
          { title: "Full Legs Waxing", slug: "full-legs-waxing" },
        ],
      },
      {
        slug: "body",
        name: "Body",
        displayOrder: 3,
        options: {
          wax_type: ["Regular/Honey", "Rica", "Rica Roll-on", "Rica Peel-off", "Chocolate", "Aloe Vera", "Hard Wax (sensitive skin / pregnancy)"],
        },
        services: [
          { title: "Stomach Waxing", slug: "stomach-waxing" },
          { title: "Back Waxing", slug: "back-waxing" },
          { title: "Butt Waxing", slug: "butt-waxing" },
          { title: "Full Body Waxing", slug: "full-body-waxing" },
        ],
      },
      {
        slug: "intimate",
        name: "Intimate",
        displayOrder: 4,
        options: {
          wax_type: ["Rica Peel-off", "Hard Wax (sensitive skin / pregnancy)"],
        },
        services: [
          { title: "Bikini Line Waxing", slug: "bikini-line-waxing" },
          { title: "Full Bikini Waxing", slug: "full-bikini-waxing" },
          { title: "Brazilian Waxing (Stripless)", slug: "brazilian-waxing-stripless" },
        ],
      },
    ],
  },
  {
    slug: "bleach-detan",
    name: "Bleach, De-Tan & Brightening",
    icon: "sun",
    displayOrder: 3,
    shortDescription: "Sun tan removal, oxy & gold bleach, and targeted spot brightening for face, neck, and body.",
    subcategories: [
      {
        slug: "bleach",
        name: "Bleach",
        displayOrder: 1,
        options: { bleach_type: ["Oxy Bleach", "Vitamin C Bleach", "Gold Bleach"] },
        services: [
          { title: "Face & Neck Bleach", slug: "face-neck-bleach" },
          { title: "Full Arms Bleach", slug: "full-arms-bleach" },
          { title: "Full Legs Bleach", slug: "full-legs-bleach" },
          { title: "Back Bleach", slug: "back-bleach" },
          { title: "Full Body Bleach", slug: "full-body-bleach" },
        ],
      },
      {
        slug: "de-tan",
        name: "De-Tan",
        displayOrder: 2,
        services: [
          { title: "Face & Neck De-Tan", slug: "face-neck-de-tan" },
          { title: "Full Arms De-Tan", slug: "full-arms-de-tan" },
          { title: "Full Legs De-Tan", slug: "full-legs-de-tan" },
          { title: "Full Body De-Tan", slug: "full-body-de-tan" },
        ],
      },
      {
        slug: "spot-brightening",
        name: "Spot Brightening",
        displayOrder: 3,
        services: [
          { title: "Underarm Brightening", slug: "underarm-brightening" },
          { title: "Elbow Brightening", slug: "elbow-brightening" },
          { title: "Knee Brightening", slug: "knee-brightening" },
          { title: "Neck Brightening", slug: "neck-brightening" },
        ],
      },
    ],
  },
  {
    slug: "facials",
    name: "Facials & Cleanup",
    icon: "sparkles",
    displayOrder: 4,
    shortDescription: "Deep pore cleanups, brand facials (O3+, Casmara), Korean glass skin, and targeted derma solutions.",
    subcategories: [
      {
        slug: "cleanup",
        name: "Cleanup",
        displayOrder: 1,
        services: [
          { title: "Fruit Cleanup", slug: "fruit-cleanup" },
          { title: "Anti-Tan Cleanup", slug: "anti-tan-cleanup" },
          { title: "Charcoal Cleanup", slug: "charcoal-cleanup" },
          { title: "Vitamin C Cleanup", slug: "vitamin-c-cleanup" },
        ],
      },
      {
        slug: "classic-facials",
        name: "Classic Facials",
        displayOrder: 2,
        services: [
          { title: "Fruit Facial", slug: "fruit-facial" },
          { title: "Gold Facial", slug: "gold-facial" },
          { title: "Diamond Facial", slug: "diamond-facial" },
          { title: "Pearl Facial", slug: "pearl-facial" },
          { title: "Wine Facial", slug: "wine-facial" },
          { title: "Kumkumadi Ubtan Facial", slug: "kumkumadi-ubtan-facial" },
        ],
      },
      {
        slug: "brand-facials",
        name: "Brand Facials",
        displayOrder: 3,
        services: [
          { title: "O3+ Facial", slug: "o3-facial" },
          { title: "Casmara Facial", slug: "casmara-facial" },
          { title: "Lotus Facial", slug: "lotus-facial" },
          { title: "Aroma Magic Facial", slug: "aroma-magic-facial" },
          { title: "Sara Facial", slug: "sara-facial" },
          { title: "VLCC Facial", slug: "vlcc-facial" },
        ],
      },
      {
        slug: "korean-japanese-facials",
        name: "Korean & Japanese Facials",
        displayOrder: 4,
        services: [
          { title: "Korean Glass Skin Facial", slug: "korean-glass-skin-facial" },
          { title: "Japanese Cherry Blossom Facial", slug: "japanese-cherry-blossom-facial" },
          { title: "Japanese Matcha Facial", slug: "japanese-matcha-facial" },
        ],
      },
      {
        slug: "derma-facials",
        name: "Derma Facials",
        displayOrder: 5,
        services: [
          { title: "Niacinamide Facial (Pigmentation)", slug: "niacinamide-facial-pigmentation" },
          { title: "Salicylic Facial (Acne-prone Skin)", slug: "salicylic-facial-acne-prone-skin" },
          { title: "Retinol Facial (Anti-ageing)", slug: "retinol-facial-anti-ageing" },
          { title: "Ceramide Facial (Hydration)", slug: "ceramide-facial-hydration" },
        ],
      },
      {
        slug: "occasion-facials",
        name: "Occasion Facials",
        displayOrder: 6,
        services: [
          { title: "Bridal Glow Facial", slug: "bridal-glow-facial" },
        ],
      },
    ],
  },
  {
    slug: "manicure-pedicure",
    name: "Manicure & Pedicure",
    icon: "hand",
    displayOrder: 5,
    shortDescription: "Relaxing foot and hand spas, crystal pedicure, paraffin treatment, and hygienic mani-pedi combos.",
    subcategories: [
      {
        slug: "basic",
        name: "Basic",
        displayOrder: 1,
        services: [
          { title: "Cut File & Polish - Hands", slug: "cut-file-polish-hands" },
          { title: "Cut File & Polish - Feet", slug: "cut-file-polish-feet" },
        ],
      },
      {
        slug: "manicure",
        name: "Manicure",
        displayOrder: 2,
        services: [
          { title: "Classic Manicure", slug: "classic-manicure" },
          { title: "Spa Manicure", slug: "spa-manicure" },
          { title: "Candle Spa Manicure", slug: "candle-spa-manicure" },
          { title: "Paraffin Manicure", slug: "paraffin-manicure" },
        ],
      },
      {
        slug: "pedicure",
        name: "Pedicure",
        displayOrder: 3,
        services: [
          { title: "Classic Pedicure", slug: "classic-pedicure" },
          { title: "Spa Pedicure", slug: "spa-pedicure" },
          { title: "Candle Spa Pedicure", slug: "candle-spa-pedicure" },
          { title: "Crystal Spa Pedicure", slug: "crystal-spa-pedicure" },
          { title: "Paraffin Pedicure", slug: "paraffin-pedicure" },
          { title: "Ice-Cream Pedicure", slug: "ice-cream-pedicure" },
        ],
      },
      {
        slug: "foot-care",
        name: "Foot Care",
        displayOrder: 4,
        services: [
          { title: "Heel Peel Treatment", slug: "heel-peel-treatment" },
        ],
      },
      {
        slug: "combos",
        name: "Combos",
        displayOrder: 5,
        services: [
          { title: "Mani-Pedi Combo", slug: "mani-pedi-combo" },
        ],
      },
      {
        slug: "add-ons",
        name: "Add-ons",
        displayOrder: 6,
        services: [
          { title: "Hand Massage", slug: "hand-massage" },
          { title: "Foot Massage", slug: "foot-massage" },
        ],
      },
    ],
  },
  {
    slug: "nail-studio",
    name: "Nail Studio",
    icon: "sparkles",
    displayOrder: 6,
    shortDescription: "Salon-grade gel extensions, acrylic nail art, French tips, and refills delivered at your doorstep.",
    subcategories: [
      {
        slug: "polish",
        name: "Polish",
        displayOrder: 1,
        services: [
          { title: "Nail Polish Application", slug: "nail-polish-application", isP2: true },
          { title: "Gel Polish", slug: "gel-polish", isP2: true },
          { title: "French Tips", slug: "french-tips", isP2: true },
        ],
      },
      {
        slug: "art",
        name: "Art",
        displayOrder: 2,
        services: [
          { title: "Nail Art", slug: "nail-art", isP2: true },
        ],
      },
      {
        slug: "extensions",
        name: "Extensions",
        displayOrder: 3,
        services: [
          { title: "Gel Nail Extensions", slug: "gel-nail-extensions", isP2: true },
          { title: "Acrylic Nail Extensions", slug: "acrylic-nail-extensions", isP2: true },
        ],
      },
      {
        slug: "maintenance",
        name: "Maintenance",
        displayOrder: 4,
        services: [
          { title: "Nail Extension Refill", slug: "nail-extension-refill", isP2: true },
          { title: "Nail Extension Removal", slug: "nail-extension-removal", isP2: true },
        ],
      },
    ],
  },
  {
    slug: "hair",
    name: "Hair Services",
    icon: "scissors",
    displayOrder: 7,
    shortDescription: "Expert haircuts, blow-drys, hair spa, root touch-ups, global colour, and salon smoothening.",
    subcategories: [
      {
        slug: "haircut",
        name: "Haircut",
        displayOrder: 1,
        services: [
          { title: "Women's Haircut", slug: "womens-haircut" },
          { title: "Hair Trim", slug: "hair-trim" },
          { title: "Fringe Cut", slug: "fringe-cut" },
          { title: "Kids' Haircut", slug: "kids-haircut" },
        ],
      },
      {
        slug: "styling",
        name: "Styling",
        displayOrder: 2,
        options: { blow_dry_style: ["Straight", "Curls", "Waves"] },
        services: [
          { title: "Blow-Dry", slug: "blow-dry" },
          { title: "Hair Ironing", slug: "hair-ironing" },
          { title: "Hair Tonging", slug: "hair-tonging" },
        ],
      },
      {
        slug: "hair-care",
        name: "Hair Care",
        displayOrder: 3,
        services: [
          { title: "Hair Spa", slug: "hair-spa" },
          { title: "Hair Mask", slug: "hair-mask" },
          { title: "Anti-Dandruff Treatment", slug: "anti-dandruff-treatment" },
          { title: "Head Massage", slug: "head-massage" },
        ],
      },
      {
        slug: "hair-colour",
        name: "Hair Colour",
        displayOrder: 4,
        services: [
          { title: "Root Touch-Up", slug: "root-touch-up" },
          { title: "Global Hair Colour", slug: "global-hair-colour" },
          { title: "Highlights", slug: "highlights" },
          { title: "Fashion Colour", slug: "fashion-colour" },
          { title: "Mehendi Application on Hair", slug: "mehendi-application-on-hair" },
        ],
      },
      {
        slug: "hair-treatments",
        name: "Hair Treatments (P2)",
        displayOrder: 5,
        services: [
          { title: "Keratin Treatment", slug: "keratin-treatment", isP2: true },
          { title: "Hair Botox", slug: "hair-botox", isP2: true },
          { title: "Hair Smoothening", slug: "hair-smoothening", isP2: true },
          { title: "Hair Rebonding", slug: "hair-rebonding", isP2: true },
        ],
      },
      {
        slug: "hair-extensions",
        name: "Hair Extensions (P2)",
        displayOrder: 6,
        services: [
          { title: "Hair Extensions", slug: "hair-extensions", isP2: true },
        ],
      },
    ],
  },
  {
    slug: "makeup",
    name: "Makeup & Styling",
    icon: "brush",
    displayOrder: 8,
    shortDescription: "HD party makeup, engagement & reception glam, saree draping, and customized family styling packages.",
    subcategories: [
      {
        slug: "party-makeup",
        name: "Party Makeup",
        displayOrder: 1,
        services: [
          { title: "Light Party Makeup", slug: "light-party-makeup" },
          { title: "Glam Party Makeup", slug: "glam-party-makeup" },
        ],
      },
      {
        slug: "event-makeup",
        name: "Event Makeup",
        displayOrder: 2,
        services: [
          { title: "Engagement Makeup", slug: "engagement-makeup" },
          { title: "Reception Makeup", slug: "reception-makeup" },
        ],
      },
      {
        slug: "makeup-type",
        name: "Makeup Type",
        displayOrder: 3,
        services: [
          { title: "HD Makeup", slug: "hd-makeup" },
          { title: "Airbrush Makeup", slug: "airbrush-makeup", isP2: true },
        ],
      },
      {
        slug: "add-ons",
        name: "Add-ons",
        displayOrder: 4,
        services: [
          { title: "Hairstyling (Buns / Braids / Curls)", slug: "hairstyling-buns-braids-curls" },
          { title: "Saree Draping", slug: "saree-draping" },
          { title: "Dupatta & Lehenga Draping", slug: "dupatta-lehenga-draping" },
          { title: "False Lashes", slug: "false-lashes" },
          { title: "Lenses", slug: "lenses" },
          { title: "Hair Accessories Setting", slug: "hair-accessories-setting" },
        ],
      },
      {
        slug: "group-booking",
        name: "Group Booking",
        displayOrder: 5,
        services: [
          { title: "Family Makeup Package", slug: "family-makeup-package" },
          { title: "Bridesmaids Makeup Package", slug: "bridesmaids-makeup-package" },
        ],
      },
    ],
  },
  {
    slug: "mehendi",
    name: "Mehendi",
    icon: "flower2",
    displayOrder: 9,
    shortDescription: "Chemical-free dark organic stain mehendi for festivals, party guests, and intricate bridal designs.",
    subcategories: [
      {
        slug: "hands-feet",
        name: "Hands & Feet",
        displayOrder: 1,
        services: [
          { title: "Simple Mehendi", slug: "simple-mehendi" },
          { title: "Arabic Mehendi", slug: "arabic-mehendi" },
          { title: "Rajasthani Full-Hand Mehendi", slug: "rajasthani-full-hand-mehendi" },
        ],
      },
      {
        slug: "festival-mehendi",
        name: "Festival Mehendi",
        displayOrder: 2,
        services: [
          { title: "Karva Chauth Mehendi", slug: "karva-chauth-mehendi" },
          { title: "Teej Mehendi", slug: "teej-mehendi" },
          { title: "Eid Mehendi", slug: "eid-mehendi" },
          { title: "Diwali Mehendi", slug: "diwali-mehendi" },
        ],
      },
      {
        slug: "bridal",
        name: "Bridal",
        displayOrder: 3,
        services: [
          { title: "Bridal Mehendi", slug: "bridal-mehendi" },
        ],
      },
    ],
  },
  {
    slug: "body-care-spa",
    name: "Body Care & Spa",
    icon: "heart",
    displayOrder: 10,
    shortDescription: "Exfoliating body polishing, coffee body scrubs, and rejuvenating head, neck & shoulder therapy.",
    subcategories: [
      {
        slug: "body-treatments",
        name: "Body Treatments",
        displayOrder: 1,
        options: { scrub_type: ["Coffee", "Walnut", "Sugar"] },
        services: [
          { title: "Body Scrub", slug: "body-scrub" },
          { title: "Body Polishing", slug: "body-polishing" },
          { title: "Body Wrap", slug: "body-wrap" },
        ],
      },
      {
        slug: "relaxation",
        name: "Relaxation",
        displayOrder: 2,
        services: [
          { title: "Head Neck & Shoulder Massage", slug: "head-neck-shoulder-massage" },
        ],
      },
      {
        slug: "massages",
        name: "Massages (P2)",
        displayOrder: 3,
        services: [
          { title: "Swedish Massage", slug: "swedish-massage", isP2: true },
          { title: "Deep Tissue Massage", slug: "deep-tissue-massage", isP2: true },
          { title: "Aromatherapy Massage", slug: "aromatherapy-massage", isP2: true },
          { title: "Abhyanga Massage", slug: "abhyanga-massage", isP2: true },
          { title: "Balinese Massage", slug: "balinese-massage", isP2: true },
          { title: "Foot Reflexology", slug: "foot-reflexology", isP2: true },
        ],
      },
    ],
  },
  {
    slug: "bridal",
    name: "Bridal & Pre-Bridal",
    icon: "crown",
    displayOrder: 11,
    shortDescription: "Luxury doorstep bridal transformations, HD & airbrush makeup, and bespoke 1-to-3 month pre-bridal packages.",
    subcategories: [
      {
        slug: "bridal-makeup",
        name: "Bridal Makeup",
        displayOrder: 1,
        services: [
          { title: "Traditional Bridal Makeup", slug: "traditional-bridal-makeup" },
          { title: "HD Bridal Makeup", slug: "hd-bridal-makeup" },
          { title: "Airbrush Bridal Makeup", slug: "airbrush-bridal-makeup" },
        ],
      },
      {
        slug: "trial",
        name: "Trial",
        displayOrder: 2,
        services: [
          { title: "Bridal Makeup Trial", slug: "bridal-makeup-trial" },
        ],
      },
      {
        slug: "pre-bridal-packages",
        name: "Pre-Bridal Packages",
        displayOrder: 3,
        services: [
          { title: "1-Month Pre-Bridal Package", slug: "1-month-pre-bridal-package" },
          { title: "2-Month Pre-Bridal Package", slug: "2-month-pre-bridal-package" },
          { title: "3-Month Pre-Bridal Package", slug: "3-month-pre-bridal-package" },
        ],
      },
      {
        slug: "family",
        name: "Family",
        displayOrder: 4,
        services: [
          { title: "Bride's Family Package", slug: "bride-s-family-package" },
        ],
      },
    ],
  },
];

// ───────── MIGRATION MAPPINGS FROM CP-0 ─────────
// Maps legacy service slug -> target master service info
interface LegacyMapping {
  targetCat: string;
  targetSubcat: string;
  targetSlug: string;
  action: "MAP_DIRECT" | "MERGE_INTO" | "INACTIVE_REDIRECT";
}

const LEGACY_MAP: Record<string, LegacyMapping> = {
  // Bridal
  "classic-bridal-makeup": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "traditional-bridal-makeup", action: "MERGE_INTO" },
  "muslim-nikah-bridal-makeup": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "traditional-bridal-makeup", action: "MERGE_INTO" },
  "christian-bridal-makeup": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "traditional-bridal-makeup", action: "MERGE_INTO" },
  "south-indian-bridal-makeup": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "traditional-bridal-makeup", action: "MERGE_INTO" },
  "bengali-bridal-makeup": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "traditional-bridal-makeup", action: "MERGE_INTO" },
  "punjabi-sikh-bridal-makeup": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "traditional-bridal-makeup", action: "MERGE_INTO" },
  "bridal-makeup-artist": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "traditional-bridal-makeup", action: "MAP_DIRECT" },
  "hd-bridal-makeup": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "hd-bridal-makeup", action: "MAP_DIRECT" },
  "airbrush-bridal-makeup": { targetCat: "bridal", targetSubcat: "bridal-makeup", targetSlug: "airbrush-bridal-makeup", action: "MAP_DIRECT" },
  "bridal-makeup-trial-session": { targetCat: "bridal", targetSubcat: "trial", targetSlug: "bridal-makeup-trial", action: "MAP_DIRECT" },
  "complete-bridal-package": { targetCat: "bridal", targetSubcat: "pre-bridal-packages", targetSlug: "1-month-pre-bridal-package", action: "MAP_DIRECT" },
  "pre-bridal-glow-package": { targetCat: "bridal", targetSubcat: "pre-bridal-packages", targetSlug: "1-month-pre-bridal-package", action: "MERGE_INTO" },
  "pre-bridal-haldi-mehndi-glow-package": { targetCat: "bridal", targetSubcat: "pre-bridal-packages", targetSlug: "1-month-pre-bridal-package", action: "MERGE_INTO" },
  "essential-glow-pre-bridal-package": { targetCat: "bridal", targetSubcat: "pre-bridal-packages", targetSlug: "2-month-pre-bridal-package", action: "MAP_DIRECT" },
  "multi-function-wedding-makeup-package": { targetCat: "bridal", targetSubcat: "pre-bridal-packages", targetSlug: "3-month-pre-bridal-package", action: "MAP_DIRECT" },
  "luxury-ultra-radiance-pre-bridal-package": { targetCat: "bridal", targetSubcat: "pre-bridal-packages", targetSlug: "3-month-pre-bridal-package", action: "MERGE_INTO" },
  "sangeet-family-glam-package": { targetCat: "bridal", targetSubcat: "family", targetSlug: "bride-s-family-package", action: "MAP_DIRECT" },
  "luxe-party-glam-package": { targetCat: "bridal", targetSubcat: "family", targetSlug: "bride-s-family-package", action: "MERGE_INTO" },

  // Makeup
  "party-makeup-and-hair": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "glam-party-makeup", action: "MAP_DIRECT" },
  "luxe-glam-up-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "glam-party-makeup", action: "MERGE_INTO" },
  "korean-glass-skin-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "glam-party-makeup", action: "MERGE_INTO" },
  "sangeet-cocktail-party-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "glam-party-makeup", action: "MERGE_INTO" },
  "pre-wedding-photoshoot-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "glam-party-makeup", action: "MERGE_INTO" },
  "mehndi-function-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "glam-party-makeup", action: "MERGE_INTO" },
  "baby-shower-godh-bharai-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "glam-party-makeup", action: "MERGE_INTO" },
  "karva-chauth-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "glam-party-makeup", action: "INACTIVE_REDIRECT" },

  "flawless-party-makeup-hair-styling": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "light-party-makeup", action: "MERGE_INTO" },
  "birthday-party-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "light-party-makeup", action: "MERGE_INTO" },
  "nude-no-makeup-look": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "light-party-makeup", action: "MERGE_INTO" },
  "wedding-guest-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "light-party-makeup", action: "MERGE_INTO" },
  "professional-makeup-artist-at-home": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "light-party-makeup", action: "MERGE_INTO" },
  "haldi-ceremony-makeup": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "light-party-makeup", action: "MERGE_INTO" },
  "groom-makeup-grooming": { targetCat: "makeup", targetSubcat: "party-makeup", targetSlug: "light-party-makeup", action: "INACTIVE_REDIRECT" },

  "engagement-makeup": { targetCat: "makeup", targetSubcat: "event-makeup", targetSlug: "engagement-makeup", action: "MAP_DIRECT" },
  "hd-engagement-makeup": { targetCat: "makeup", targetSubcat: "event-makeup", targetSlug: "engagement-makeup", action: "MERGE_INTO" },
  "airbrush-engagement-makeup": { targetCat: "makeup", targetSubcat: "event-makeup", targetSlug: "engagement-makeup", action: "MERGE_INTO" },
  "reception-makeup": { targetCat: "makeup", targetSubcat: "event-makeup", targetSlug: "reception-makeup", action: "MAP_DIRECT" },

  "hd-party-makeup": { targetCat: "makeup", targetSubcat: "makeup-type", targetSlug: "hd-makeup", action: "MAP_DIRECT" },
  "airbrush-party-makeup": { targetCat: "makeup", targetSubcat: "makeup-type", targetSlug: "airbrush-makeup", action: "MAP_DIRECT" },

  "saree-draping-at-home": { targetCat: "makeup", targetSubcat: "add-ons", targetSlug: "saree-draping", action: "MAP_DIRECT" },
  "bridal-saree-lehenga-draping": { targetCat: "makeup", targetSubcat: "add-ons", targetSlug: "dupatta-lehenga-draping", action: "MAP_DIRECT" },
  "premium-eye-makeup-lash-extension": { targetCat: "makeup", targetSubcat: "add-ons", targetSlug: "false-lashes", action: "MAP_DIRECT" },
  "bridal-hairstyling-advanced-hairdo": { targetCat: "makeup", targetSubcat: "add-ons", targetSlug: "hairstyling-buns-braids-curls", action: "MERGE_INTO" },
  "bridal-hair-styling": { targetCat: "makeup", targetSubcat: "add-ons", targetSlug: "hairstyling-buns-braids-curls", action: "MAP_DIRECT" },

  "group-makeup-package": { targetCat: "makeup", targetSubcat: "group-booking", targetSlug: "family-makeup-package", action: "MAP_DIRECT" },
  "bridesmaid-family-makeup": { targetCat: "makeup", targetSubcat: "group-booking", targetSlug: "bridesmaids-makeup-package", action: "MAP_DIRECT" },

  // Mehendi
  "party-guest-mehndi": { targetCat: "mehendi", targetSubcat: "hands-feet", targetSlug: "simple-mehendi", action: "MAP_DIRECT" },
  "bridal-mehndi-artist": { targetCat: "mehendi", targetSubcat: "bridal", targetSlug: "bridal-mehendi", action: "MAP_DIRECT" },

  // Face Hair Removal
  "threading-eyebrow-upperlips": { targetCat: "face-hair-removal", targetSubcat: "threading", targetSlug: "eyebrow-threading", action: "MAP_DIRECT" },

  // Waxing
  "full-arms-waxing": { targetCat: "waxing", targetSubcat: "arms", targetSlug: "full-arms-waxing", action: "MAP_DIRECT" },
  "full-legs-waxing": { targetCat: "waxing", targetSubcat: "legs", targetSlug: "full-legs-waxing", action: "MAP_DIRECT" },
  "stomach-waxing": { targetCat: "waxing", targetSubcat: "body", targetSlug: "stomach-waxing", action: "MAP_DIRECT" },
  "full-back-waxing": { targetCat: "waxing", targetSubcat: "body", targetSlug: "back-waxing", action: "MAP_DIRECT" },
  "half-back-waxing": { targetCat: "waxing", targetSubcat: "body", targetSlug: "back-waxing", action: "MERGE_INTO" },
  "bikini-waxing-at-home": { targetCat: "waxing", targetSubcat: "intimate", targetSlug: "full-bikini-waxing", action: "MAP_DIRECT" },
  "full-body-waxing-at-home": { targetCat: "waxing", targetSubcat: "body", targetSlug: "full-body-waxing", action: "MAP_DIRECT" },
  "breast-waxing": { targetCat: "waxing", targetSubcat: "body", targetSlug: "full-body-waxing", action: "INACTIVE_REDIRECT" },

  // Facials
  "classic-cleanup": { targetCat: "facials", targetSubcat: "cleanup", targetSlug: "fruit-cleanup", action: "MAP_DIRECT" },
  "professional-face-cleanup": { targetCat: "facials", targetSubcat: "cleanup", targetSlug: "anti-tan-cleanup", action: "MAP_DIRECT" },
  "professional-facial": { targetCat: "facials", targetSubcat: "classic-facials", targetSlug: "fruit-facial", action: "MAP_DIRECT" },
  "facial-at-home": { targetCat: "facials", targetSubcat: "classic-facials", targetSlug: "gold-facial", action: "MAP_DIRECT" },
  "pigmentation-treatment-facial": { targetCat: "facials", targetSubcat: "derma-facials", targetSlug: "niacinamide-facial-pigmentation", action: "MAP_DIRECT" },
  "premium-glow-facial": { targetCat: "facials", targetSubcat: "occasion-facials", targetSlug: "bridal-glow-facial", action: "MAP_DIRECT" },

  // Manicure & Pedicure
  "classic-manicure-at-home": { targetCat: "manicure-pedicure", targetSubcat: "manicure", targetSlug: "classic-manicure", action: "MAP_DIRECT" },
  "classic-pedicure-at-home": { targetCat: "manicure-pedicure", targetSubcat: "pedicure", targetSlug: "classic-pedicure", action: "MAP_DIRECT" },
  "aroma-spa-manicure": { targetCat: "manicure-pedicure", targetSubcat: "manicure", targetSlug: "spa-manicure", action: "MAP_DIRECT" },
  "aroma-spa-pedicure": { targetCat: "manicure-pedicure", targetSubcat: "pedicure", targetSlug: "spa-pedicure", action: "MAP_DIRECT" },
  "fyc-jelly-luxury-pedicure": { targetCat: "manicure-pedicure", targetSubcat: "pedicure", targetSlug: "crystal-spa-pedicure", action: "MAP_DIRECT" },
  "classic-manicure-pedicure-combo": { targetCat: "manicure-pedicure", targetSubcat: "combos", targetSlug: "mani-pedi-combo", action: "MAP_DIRECT" },
  "classic-manicure-pedicure": { targetCat: "manicure-pedicure", targetSubcat: "combos", targetSlug: "mani-pedi-combo", action: "MERGE_INTO" },
  "o3-brightening-mani-pedi-spa": { targetCat: "manicure-pedicure", targetSubcat: "combos", targetSlug: "mani-pedi-combo", action: "MERGE_INTO" },

  // Nail Studio
  "nail-extensions-gel-art": { targetCat: "nail-studio", targetSubcat: "extensions", targetSlug: "gel-nail-extensions", action: "MERGE_INTO" },
  "gel-nail-extensions": { targetCat: "nail-studio", targetSubcat: "extensions", targetSlug: "gel-nail-extensions", action: "MAP_DIRECT" },

  // Hair
  "anti-hair-fall-treatment": { targetCat: "hair", targetSubcat: "hair-care", targetSlug: "anti-dandruff-treatment", action: "MAP_DIRECT" },
  "hair-spa-at-home": { targetCat: "hair", targetSubcat: "hair-care", targetSlug: "hair-spa", action: "MAP_DIRECT" },
  "hair-smoothing-treatment": { targetCat: "hair", targetSubcat: "hair-treatments", targetSlug: "hair-smoothening", action: "MAP_DIRECT" },
  "premium-hair-extensions-volumizing": { targetCat: "hair", targetSubcat: "hair-extensions", targetSlug: "hair-extensions", action: "MAP_DIRECT" },

  // Body Care & Spa
  "premium-full-body-massage": { targetCat: "body-care-spa", targetSubcat: "relaxation", targetSlug: "head-neck-shoulder-massage", action: "MAP_DIRECT" },
  "premium-full-body-polishing": { targetCat: "body-care-spa", targetSubcat: "body-treatments", targetSlug: "body-polishing", action: "MAP_DIRECT" },
};

// Old categories to 301 redirect
const OLD_CAT_REDIRECTS: Record<string, string> = {
  "/services/bridal-makeup": "/services/bridal",
  "/services/pre-bridal-packages": "/services/bridal",
  "/services/engagement-party-makeup": "/services/makeup",
  "/services/facial-and-skincare": "/services/facials",
  "/services/nail-art": "/services/manicure-pedicure",
  "/services/hair-styling": "/services/hair",
  "/services/draping-eye-mehndi": "/services/mehendi",
  "/services/salon-at-home": "/services",
};

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🚀 CP-2: SEED MASTER CATALOGUE & SERVICE MIGRATION");
  console.log("═══════════════════════════════════════════════════════\n");

  // Step 1: Fetch all current categories & services in DB
  const existingCategories = await prisma.category.findMany();
  const existingServices = await prisma.service.findMany({
    include: { variants: true, addons: true },
  });
  console.log(`Found ${existingCategories.length} existing categories and ${existingServices.length} existing services.`);

  const existingServiceBySlug = new Map(existingServices.map((s) => [s.slug, s]));

  // Step 2: Upsert 11 Master Categories
  console.log("\n📦 Upserting 11 Master Categories...");
  const catMap = new Map<string, string>(); // slug -> id
  for (const cat of MASTER_CATALOGUE) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
        sort: cat.displayOrder,
        shortDescription: cat.shortDescription,
        status: Status.ACTIVE,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
        sort: cat.displayOrder,
        shortDescription: cat.shortDescription,
        status: Status.ACTIVE,
      },
    });
    catMap.set(cat.slug, upserted.id);
    console.log(`  ✓ Category: ${cat.name} (${cat.slug}) -> ${upserted.id}`);
  }

  // Step 3: Upsert All Subcategories
  console.log("\n📁 Upserting Subcategories...");
  const subcatMap = new Map<string, string>(); // `${catSlug}:${subcatSlug}` -> id
  for (const cat of MASTER_CATALOGUE) {
    const catId = catMap.get(cat.slug)!;
    for (const subcat of cat.subcategories) {
      const upserted = await prisma.subCategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: catId,
            slug: subcat.slug,
          },
        },
        update: {
          name: subcat.name,
          displayOrder: subcat.displayOrder,
          status: Status.ACTIVE,
        },
        create: {
          categoryId: catId,
          slug: subcat.slug,
          name: subcat.name,
          displayOrder: subcat.displayOrder,
          status: Status.ACTIVE,
        },
      });
      const key = `${cat.slug}:${subcat.slug}`;
      subcatMap.set(key, upserted.id);
      console.log(`  ✓ Subcategory: ${cat.slug} / ${subcat.name} (${subcat.slug}) -> ${upserted.id}`);
    }
  }

  // Step 4: Upsert Master Services & Apply Migration Map
  console.log("\n💆 Upserting Master Services and Migrating Assets...");
  const missingPricesList: Array<{
    category: string;
    subcategory: string;
    service: string;
    options: string;
    status: string;
  }> = [];

  let directMapCount = 0;
  let newServiceCount = 0;

  for (const cat of MASTER_CATALOGUE) {
    const catId = catMap.get(cat.slug)!;
    for (const subcat of cat.subcategories) {
      const subcatId = subcatMap.get(`${cat.slug}:${subcat.slug}`)!;

      for (const sDef of subcat.services) {
        // Find if any existing service maps directly to this slug or is mapped via LEGACY_MAP
        let matchingLegacy = existingServiceBySlug.get(sDef.slug);

        if (!matchingLegacy) {
          // Check if any legacy service is configured to MAP_DIRECT into this service
          for (const [oldSlug, mapping] of Object.entries(LEGACY_MAP)) {
            if (mapping.targetSlug === sDef.slug && mapping.action === "MAP_DIRECT") {
              const candidate = existingServiceBySlug.get(oldSlug);
              if (candidate) {
                matchingLegacy = candidate;
                break;
              }
            }
          }
        }

        // Determine price, duration, image, etc.
        const serviceStatus = sDef.isP2 ? Status.COMING_SOON : Status.ACTIVE;
        const price = matchingLegacy?.price ?? null;
        const offerPrice = matchingLegacy?.offerPrice ?? null;
        const duration = matchingLegacy?.duration ?? null;
        const durationMins = matchingLegacy?.durationMins ?? (duration ? parseInt(duration, 10) || null : null);
        const image = matchingLegacy?.image ?? null;
        const imageAlt = matchingLegacy?.imageAlt ?? `${sDef.title} at home by HerrGlow`;
        const features = matchingLegacy?.features ?? null;
        const shortDescription = matchingLegacy?.shortDescription ?? `${sDef.title} at home in Delhi, Noida & Greater Noida. 100% verified female professionals with sealed hygienic kits.`;
        const leadCount = matchingLegacy?.leadCount ?? 0;

        // Upsert service
        const upsertedService = await prisma.service.upsert({
          where: { slug: sDef.slug },
          update: {
            title: sDef.title,
            categoryId: catId,
            subCategoryId: subcatId,
            status: serviceStatus,
            price,
            offerPrice,
            duration,
            durationMins,
            image: image || undefined,
            imageAlt,
            features: features || undefined,
            shortDescription,
          },
          create: {
            slug: sDef.slug,
            title: sDef.title,
            categoryId: catId,
            subCategoryId: subcatId,
            status: serviceStatus,
            price,
            offerPrice,
            duration,
            durationMins,
            image,
            imageAlt,
            features,
            shortDescription,
            leadCount,
          },
        });

        if (price === null) {
          newServiceCount++;
          const optsList = subcat.options
            ? Object.entries(subcat.options).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" | ")
            : "None";
          missingPricesList.push({
            category: cat.name,
            subcategory: subcat.name,
            service: sDef.title,
            options: optsList,
            status: sDef.isP2 ? "COMING_SOON (P2)" : "ACTIVE",
          });
        } else {
          directMapCount++;
        }

        // Handle subcategory options as ServiceVariants if defined
        if (subcat.options) {
          for (const [optGroup, optValues] of Object.entries(subcat.options)) {
            for (let idx = 0; idx < optValues.length; idx++) {
              const optVal = optValues[idx];
              await prisma.serviceVariant.upsert({
                where: {
                  serviceId_name: {
                    serviceId: upsertedService.id,
                    name: optVal,
                  },
                },
                update: {
                  sortOrder: idx,
                  displayOrder: idx,
                },
                create: {
                  serviceId: upsertedService.id,
                  name: optVal,
                  sortOrder: idx,
                  displayOrder: idx,
                },
              });
            }
          }
        }
      }
    }
  }

  // Step 5: Process Legacy Merges, Deprecations & 301 Redirects
  console.log("\n🔀 Processing Legacy Merges, Inactivations & 301 Redirects...");
  let redirectCount = 0;

  // Add category 301 redirects
  for (const [fromUrl, toUrl] of Object.entries(OLD_CAT_REDIRECTS)) {
    await prisma.redirect.upsert({
      where: { fromPath: fromUrl },
      update: { toPath: toUrl, code: RedirectCode.MOVED_301 },
      create: { fromPath: fromUrl, toPath: toUrl, code: RedirectCode.MOVED_301 },
    });
    redirectCount++;
  }

  // Process each legacy service in LEGACY_MAP
  for (const [oldSlug, mapping] of Object.entries(LEGACY_MAP)) {
    const legacyService = existingServiceBySlug.get(oldSlug);
    const targetService = await prisma.service.findUnique({ where: { slug: mapping.targetSlug } });

    // Target URL path
    const targetUrl = `/services/${mapping.targetCat}/${mapping.targetSlug}`;
    const legacyOldPath = `/services/${oldSlug}`;

    // Add 301 redirect if old path != targetUrl
    if (legacyOldPath !== targetUrl) {
      await prisma.redirect.upsert({
        where: { fromPath: legacyOldPath },
        update: { toPath: targetUrl, code: RedirectCode.MOVED_301 },
        create: { fromPath: legacyOldPath, toPath: targetUrl, code: RedirectCode.MOVED_301 },
      });
      redirectCount++;
    }

    if (legacyService) {
      if (mapping.action === "MERGE_INTO" || mapping.action === "INACTIVE_REDIRECT") {
        // Mark legacy service as INACTIVE and set mergedIntoId
        if (legacyService.slug !== mapping.targetSlug) {
          await prisma.service.update({
            where: { id: legacyService.id },
            data: {
              status: Status.INACTIVE,
              mergedIntoId: targetService?.id ?? null,
            },
          });
          console.log(`  ↪ Inactivated legacy: ${oldSlug} -> 301 to ${targetUrl}`);
        }
      }
    }
  }

  // Also ensure /services/{service-slug} 301 redirects to /services/{category-slug}/{service-slug}
  for (const cat of MASTER_CATALOGUE) {
    for (const subcat of cat.subcategories) {
      for (const s of subcat.services) {
        const flatPath = `/services/${s.slug}`;
        const nestedPath = `/services/${cat.slug}/${s.slug}`;
        if (flatPath !== nestedPath) {
          await prisma.redirect.upsert({
            where: { fromPath: flatPath },
            update: { toPath: nestedPath, code: RedirectCode.MOVED_301 },
            create: { fromPath: flatPath, toPath: nestedPath, code: RedirectCode.MOVED_301 },
          });
          redirectCount++;
        }
      }
    }
  }

  // Inactivate unused legacy categories (e.g. salon-at-home)
  const masterCatSlugs = new Set(MASTER_CATALOGUE.map((c) => c.slug));
  for (const ec of existingCategories) {
    if (!masterCatSlugs.has(ec.slug)) {
      await prisma.category.update({
        where: { id: ec.id },
        data: { status: Status.INACTIVE },
      });
      console.log(`  ↪ Inactivated legacy category: ${ec.name} (${ec.slug})`);
    }
  }

  // Step 6: Generate MISSING_PRICES.md
  console.log(`\n📋 Generating MISSING_PRICES.md with ${missingPricesList.length} unpriced new services...`);
  const missingPricesPath = path.join(rootDir, "MISSING_PRICES.md");
  let mdContent = `# MISSING_PRICES.md — Master Catalogue Unpriced Services\n\n`;
  mdContent += `> Generated at Checkpoint **CP-2**.\n`;
  mdContent += `> **Rule 2:** Existing prices were carried over from mapped legacy services. New services without legacy counterpart have \`price = null\` and are listed below. Do not invent prices.\n\n`;
  mdContent += `| # | Category | Sub-category | Service | Options | Status |\n`;
  mdContent += `| :- | :--- | :--- | :--- | :--- | :--- |\n`;

  missingPricesList.forEach((item, idx) => {
    mdContent += `| ${idx + 1} | ${item.category} | ${item.subcategory} | **${item.service}** | ${item.options} | \`${item.status}\` |\n`;
  });

  mdContent += `\n---\n\n`;
  mdContent += `### Summary\n`;
  mdContent += `- **Total Master Services Created:** ${directMapCount + newServiceCount}\n`;
  mdContent += `- **Services with Preserved Historical Prices:** ${directMapCount}\n`;
  mdContent += `- **Services Requiring Price Input:** ${missingPricesList.length}\n`;
  mdContent += `- **Phase 2 (Coming Soon) Services:** ${missingPricesList.filter((m) => m.status.includes("P2")).length}\n`;

  await fs.writeFile(missingPricesPath, mdContent, "utf8");
  console.log(`  ✓ Written to ${missingPricesPath}`);

  // Step 7: Final Counts Verification
  const finalCategories = await prisma.category.findMany({ where: { status: Status.ACTIVE } });
  const finalSubcategories = await prisma.subCategory.count();
  const finalActiveServices = await prisma.service.count({ where: { status: Status.ACTIVE } });
  const finalP2Services = await prisma.service.count({ where: { status: Status.COMING_SOON } });
  const finalInactiveServices = await prisma.service.count({ where: { status: Status.INACTIVE } });
  const finalRedirects = await prisma.redirect.count();

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("✅ CP-2 SEED & MIGRATION SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`• Active Categories:       ${finalCategories.length} (Target: 11)`);
  console.log(`• Total Subcategories:     ${finalSubcategories}`);
  console.log(`• Active Master Services:  ${finalActiveServices}`);
  console.log(`• Phase 2 (P2) Services:   ${finalP2Services}`);
  console.log(`• Inactive Legacy Services:${finalInactiveServices}`);
  console.log(`• Total Redirects:         ${finalRedirects}`);
  console.log(`• Unpriced Services in doc:${missingPricesList.length}`);
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("Error running CP-2 migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
