/**
 * Seeds realistic, competitive doorstep salon prices, durations, and features
 * for all newly added Master Catalogue services in Delhi NCR.
 */

import { prisma, Status } from "../src/index.js";

interface ServicePriceDef {
  price: number;
  offerPrice: number;
  duration: string;
  durationMins: number;
  features?: string[];
}

const SERVICE_PRICING: Record<string, ServicePriceDef> = {
  // Face Hair Removal
  "eyebrow-threading": {
    price: 69,
    offerPrice: 49,
    duration: "10 mins",
    durationMins: 10,
    features: [
      "Cotton thread hair removal",
      "Precise arch shaping",
      "Soothing aloe vera massage",
      "Single-use sanitized thread",
    ],
  },
  "upper-lip-threading": {
    price: 49,
    offerPrice: 29,
    duration: "5 mins",
    durationMins: 5,
    features: [
      "Quick upper lip hair removal",
      "Minimal redness formula",
      "Calming lotion application",
      "Gentle on sensitive skin",
    ],
  },
  "lower-lip-threading": {
    price: 39,
    offerPrice: 19,
    duration: "5 mins",
    durationMins: 5,
    features: ["Fine lower lip hair removal", "Smooth chin transition", "Aloe vera touch-up"],
  },
  "forehead-threading": {
    price: 59,
    offerPrice: 39,
    duration: "10 mins",
    durationMins: 10,
    features: ["Forehead fuzz removal", "Hairline definition", "Post-threading cool wipe"],
  },
  "full-face-threading": {
    price: 249,
    offerPrice: 179,
    duration: "25 mins",
    durationMins: 25,
    features: [
      "Eyebrows, upper lip, chin & forehead",
      "Complete face contouring",
      "Rosewater cooling mist",
      "Anti-rash soothing cream",
    ],
  },
  "upper-lip-wax": {
    price: 69,
    offerPrice: 49,
    duration: "10 mins",
    durationMins: 10,
    features: [
      "Painless Rica peel-off wax",
      "No strip tearing",
      "Root-level removal",
      "Post-wax soothing gel",
    ],
  },
  "chin-wax": {
    price: 69,
    offerPrice: 49,
    duration: "10 mins",
    durationMins: 10,
    features: ["Targeted chin hair removal", "Gentle hard wax", "Calming chamomile lotion"],
  },
  "sides-wax": {
    price: 119,
    offerPrice: 89,
    duration: "15 mins",
    durationMins: 15,
    features: ["Sideburn fuzz removal", "Smooth makeup application base", "Skin-calming treatment"],
  },
  "full-face-wax": {
    price: 349,
    offerPrice: 279,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Full face Rica peel-off wax",
      "Dead cell exfoliation",
      "Instantly brighter complexion",
      "Sanitized tools & clean setup",
    ],
  },

  // Waxing
  "underarms-waxing": {
    price: 149,
    offerPrice: 99,
    duration: "15 mins",
    durationMins: 15,
    features: [
      "Anti-tan underarm waxing",
      "Odor reduction touch-up",
      "No skin darkening",
      "Post-wax soothing oil",
    ],
  },
  "half-arms-waxing": {
    price: 249,
    offerPrice: 199,
    duration: "20 mins",
    durationMins: 20,
    features: [
      "Elbow to wrist hair removal",
      "Choice of Rica or Honey wax",
      "Skin-hydrating lotion",
    ],
  },
  "full-arms-waxing": {
    price: 349,
    offerPrice: 299,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Full arms including underarms",
      "Rica / Chocolate wax options",
      "Tan-removing nourishment",
      "Disposable bedsheet & spatulas",
    ],
  },
  "half-legs-waxing": {
    price: 299,
    offerPrice: 249,
    duration: "25 mins",
    durationMins: 25,
    features: [
      "Knee to ankle smooth waxing",
      "Ingrown hair prevention",
      "Cooling post-wax aloe massage",
    ],
  },
  "full-legs-waxing": {
    price: 449,
    offerPrice: 349,
    duration: "40 mins",
    durationMins: 40,
    features: [
      "Full legs from thigh to toe",
      "Silky finish for up to 4 weeks",
      "Tan reduction formula",
      "Sanitized equipment & clean setup",
    ],
  },
  "stomach-waxing": {
    price: 349,
    offerPrice: 299,
    duration: "25 mins",
    durationMins: 25,
    features: [
      "Gentle stomach fuzz removal",
      "Safe for sensitive skin",
      "Non-sticky hydrating wipe",
    ],
  },
  "back-waxing": {
    price: 449,
    offerPrice: 349,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Full back waxing with Rica/Honey",
      "Deep exfoliation finish",
      "Calming anti-redness toner",
    ],
  },
  "butt-waxing": {
    price: 399,
    offerPrice: 299,
    duration: "25 mins",
    durationMins: 25,
    features: ["Discreet and hygienic waxing", "Stripless warm wax", "100% verified female expert"],
  },
  "full-body-waxing": {
    price: 2499,
    offerPrice: 1899,
    duration: "90 mins",
    durationMins: 90,
    features: [
      "Full arms, full legs, underarms, back, stomach",
      "Choice of premium Rica White Chocolate",
      "Complete body de-tan",
      "Complete sanitization & hygiene setup",
    ],
  },
  "bikini-line-waxing": {
    price: 499,
    offerPrice: 399,
    duration: "20 mins",
    durationMins: 20,
    features: [
      "Precise swimsuit line cleanup",
      "Gentle hard wax",
      "Strict private hygiene protocols",
    ],
  },
  "full-bikini-waxing": {
    price: 1199,
    offerPrice: 999,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Complete intimate area hair removal",
      "Painless stripless hard wax",
      "100% female certified specialist",
      "Single-use disposable gown & sheet",
    ],
  },
  "brazilian-waxing-stripless": {
    price: 1499,
    offerPrice: 1299,
    duration: "50 mins",
    durationMins: 50,
    features: [
      "Full front & back intimate wax",
      "High-grade stripless film wax",
      "Minimum discomfort technique",
      "Post-wax soothing skin oil",
    ],
  },

  // Bleach, De-Tan & Brightening
  "face-neck-bleach": {
    price: 399,
    offerPrice: 299,
    duration: "25 mins",
    durationMins: 25,
    features: [
      "Oxy / Gold bleach options",
      "Matches facial hair to skin tone",
      "Instant radiant golden glow",
      "Pre-bleach patch test done",
    ],
  },
  "full-arms-bleach": {
    price: 499,
    offerPrice: 399,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Shoulder to wrist bleach pack",
      "Even skin tone boost",
      "Cooling cucumber compress",
    ],
  },
  "full-legs-bleach": {
    price: 599,
    offerPrice: 499,
    duration: "40 mins",
    durationMins: 40,
    features: ["Full legs golden glow formula", "Hydrating finish", "Tan lightening effect"],
  },
  "back-bleach": {
    price: 499,
    offerPrice: 399,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Deep back brightening bleach",
      "Ideal for deep-back blouses",
      "Post-bleach moisturizing wrap",
    ],
  },
  "full-body-bleach": {
    price: 1999,
    offerPrice: 1499,
    duration: "75 mins",
    durationMins: 75,
    features: [
      "Head to toe radiant bleach",
      "Even skin tone all over",
      "Luxurious floral aroma",
      "Hygienic setup & sanitized tools",
    ],
  },
  "face-neck-de-tan": {
    price: 499,
    offerPrice: 399,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Raaga / Sara professional de-tan",
      "Kojic acid & milk enzyme pack",
      "Removes deep sun pigmentation",
      "Zero ammonia or bleach chemical",
    ],
  },
  "full-arms-de-tan": {
    price: 599,
    offerPrice: 499,
    duration: "35 mins",
    durationMins: 35,
    features: [
      "Two-step arms de-tan therapy",
      "Sun damage repair",
      "Skin brightening antioxidant massage",
    ],
  },
  "full-legs-de-tan": {
    price: 699,
    offerPrice: 599,
    duration: "45 mins",
    durationMins: 45,
    features: ["Intense leg tan reversal", "Exfoliating scrub & mask", "Smooth hydrated texture"],
  },
  "full-body-de-tan": {
    price: 2399,
    offerPrice: 1799,
    duration: "80 mins",
    durationMins: 80,
    features: [
      "Full body de-tan wrap & steam",
      "Restores natural complexion",
      "Dead cell sloughing",
      "Rich shea butter hydration",
    ],
  },
  "underarm-brightening": {
    price: 349,
    offerPrice: 249,
    duration: "20 mins",
    durationMins: 20,
    features: [
      "Targeted underarm pigment scrub",
      "Glycolic & niacinamide serum pack",
      "Reduces friction darkness",
    ],
  },
  "elbow-brightening": {
    price: 299,
    offerPrice: 199,
    duration: "15 mins",
    durationMins: 15,
    features: [
      "Rough elbow skin softening",
      "Gentle micro-exfoliation",
      "Intense urea moisture pack",
    ],
  },
  "knee-brightening": {
    price: 299,
    offerPrice: 199,
    duration: "15 mins",
    durationMins: 15,
    features: ["Dark knee lightening pack", "Dead skin polishing", "Even-toned leg appearance"],
  },
  "neck-brightening": {
    price: 349,
    offerPrice: 249,
    duration: "20 mins",
    durationMins: 20,
    features: [
      "Targeted back & front neck de-tan",
      "Lactic acid brightening wipe",
      "Sun band removal",
    ],
  },

  // Facials & Cleanup
  "fruit-cleanup": {
    price: 699,
    offerPrice: 599,
    duration: "35 mins",
    durationMins: 35,
    features: [
      "Gentle fruit enzyme cleansing",
      "Blackhead & whitehead extraction",
      "Pore-tightening fruit mask",
      "Relaxing face massage",
    ],
  },
  "anti-tan-cleanup": {
    price: 799,
    offerPrice: 699,
    duration: "40 mins",
    durationMins: 40,
    features: [
      "Tan-dissolving cleanser",
      "Walnut & mint micro-scrub",
      "Detoxifying clay pack",
      "Rosewater hydration toner",
    ],
  },
  "charcoal-cleanup": {
    price: 899,
    offerPrice: 749,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Activated bamboo charcoal cleanse",
      "Deep suction of pollution & oil",
      "Blackhead removal & steam",
      "Matte pore-refining mask",
    ],
  },
  "vitamin-c-cleanup": {
    price: 999,
    offerPrice: 799,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Pure Vitamin C antioxidant boost",
      "Instant radiance & glow",
      "Hydrating sheet mask",
      "Brightening serum infusion",
    ],
  },
  "fruit-facial": {
    price: 1199,
    offerPrice: 999,
    duration: "55 mins",
    durationMins: 55,
    features: [
      "6-step organic fruit nourishment",
      "Papaya, apple & orange extracts",
      "Pressure point face & neck massage",
      "Skin elasticity boost",
    ],
  },
  "gold-facial": {
    price: 1699,
    offerPrice: 1399,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "24K pure gold dust particles",
      "Restores cellular luminosity",
      "15-minute lymphatic drainage massage",
      "Gold peel-off brightening mask",
    ],
  },
  "diamond-facial": {
    price: 1899,
    offerPrice: 1599,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Diamond ash micro-dermabrasion",
      "Clears dull dead skin layers",
      "Deep glow for party & weddings",
      "Collagen booster pack",
    ],
  },
  "pearl-facial": {
    price: 1799,
    offerPrice: 1499,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Natural pearl powder & minerals",
      "Controls excessive oil & tan",
      "Cooling pearl algae mask",
      "Fair & radiant glow",
    ],
  },
  "wine-facial": {
    price: 1999,
    offerPrice: 1699,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Red grape & resveratrol antioxidants",
      "Firms sagging skin texture",
      "Anti-ageing glow formula",
      "Hydrating wine gel massage",
    ],
  },
  "kumkumadi-ubtan-facial": {
    price: 2199,
    offerPrice: 1799,
    duration: "65 mins",
    durationMins: 65,
    features: [
      "Traditional Kashmiri saffron & Kumkumadi oil",
      "Deep Ayurvedic radiance",
      "Herbal ubtan polish",
      "Pure brass Kansa wand massage",
    ],
  },
  "o3-facial": {
    price: 2499,
    offerPrice: 1999,
    duration: "70 mins",
    durationMins: 70,
    features: [
      "Authentic O3+ Sea White / Meladerm kit",
      "Medical-grade pigmentation clearance",
      "Active oxygen infusion",
      "Iconic O3+ peel-off rubber mask",
    ],
  },
  "casmara-facial": {
    price: 2999,
    offerPrice: 2499,
    duration: "75 mins",
    durationMins: 75,
    features: [
      "Imported Spanish Casmara algae kit",
      "-5°C skin cooling rubber mask",
      "Eye & lip contour coverage",
      "Glass-like luxury hydration",
    ],
  },
  "lotus-facial": {
    price: 1799,
    offerPrice: 1499,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Lotus Professional organic botanicals",
      "Rebalances sensitive barrier",
      "Aroma therapeutic facial massage",
    ],
  },
  "aroma-magic-facial": {
    price: 1599,
    offerPrice: 1299,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Blossom Kochhar essential oils",
      "Zero chemical or paraben formula",
      "Calms stressed city skin",
    ],
  },
  "sara-facial": {
    price: 1699,
    offerPrice: 1399,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Sara Premium whitening formula",
      "Orange & berry extract polish",
      "Long-lasting weekend glow",
    ],
  },
  "vlcc-facial": {
    price: 1499,
    offerPrice: 1199,
    duration: "55 mins",
    durationMins: 55,
    features: [
      "Classic VLCC Gold / Diamond kit",
      "Deep tissue facial stimulation",
      "Purifying herbal skin pack",
    ],
  },
  "korean-glass-skin-facial": {
    price: 3499,
    offerPrice: 2999,
    duration: "75 mins",
    durationMins: 75,
    features: [
      "7-step K-Beauty glass glow protocol",
      "Snail mucin & hyaluronic acid layering",
      "Rice water ferment brightening",
      "Ultra-reflective dewy skin finish",
    ],
  },
  "japanese-cherry-blossom-facial": {
    price: 3199,
    offerPrice: 2699,
    duration: "70 mins",
    durationMins: 70,
    features: [
      "Sakura blossom floral brightening",
      "Japanese jade roller facial massage",
      "Silky moisture barrier lock",
    ],
  },
  "japanese-matcha-facial": {
    price: 2999,
    offerPrice: 2499,
    duration: "70 mins",
    durationMins: 70,
    features: [
      "Ceremonial Uji matcha antioxidants",
      "Deep pore detox & sebum regulation",
      "Soothes acne inflammation",
    ],
  },
  "niacinamide-facial-pigmentation": {
    price: 2499,
    offerPrice: 1999,
    duration: "65 mins",
    durationMins: 65,
    features: [
      "10% pure Niacinamide serum push",
      "Fades dark spots & melasma patches",
      "Zinc PCA barrier reinforcement",
      "Dermatologist-recommended grade",
    ],
  },
  "salicylic-facial-acne-prone-skin": {
    price: 2499,
    offerPrice: 1999,
    duration: "65 mins",
    durationMins: 65,
    features: [
      "2% BHA Salicylic peel cleanser",
      "Unclogs stubborn sebum & blackheads",
      "Tea tree soothing anti-bacterial pack",
      "Calms active breakouts",
    ],
  },
  "retinol-facial-anti-ageing": {
    price: 2799,
    offerPrice: 2299,
    duration: "70 mins",
    durationMins: 70,
    features: [
      "Encapsulated Retinol & peptide complex",
      "Boosts natural skin collagen",
      "Smooths fine lines on forehead & smile zone",
      "Youthful plump radiance",
    ],
  },
  "ceramide-facial-hydration": {
    price: 2499,
    offerPrice: 1999,
    duration: "65 mins",
    durationMins: 65,
    features: [
      "Essential Ceramide 1, 3 & 6 complex",
      "Rebuilds compromised skin moisture barrier",
      "Cures seasonal dryness & flaking",
      "Velvety soft touch",
    ],
  },
  "bridal-glow-facial": {
    price: 3999,
    offerPrice: 3299,
    duration: "80 mins",
    durationMins: 80,
    features: [
      "Multi-phase bridal luminance therapy",
      "Deep exfoliation, de-tan & 24K gold serum",
      "Lymphatic drainage face & collarbone massage",
      "Bridal glow lasting for wedding week",
    ],
  },

  // Manicure & Pedicure
  "cut-file-polish-hands": {
    price: 249,
    offerPrice: 199,
    duration: "20 mins",
    durationMins: 20,
    features: [
      "Nail shaping & buffing",
      "Cuticle pushing & oiling",
      "Choice of premium nail polish",
      "Hygienic sterilized tools",
    ],
  },
  "cut-file-polish-feet": {
    price: 299,
    offerPrice: 249,
    duration: "20 mins",
    durationMins: 20,
    features: ["Toenail trimming & filing", "Cuticle cleanup", "Smooth buffing & fresh polish"],
  },
  "classic-manicure": {
    price: 599,
    offerPrice: 499,
    duration: "35 mins",
    durationMins: 35,
    features: [
      "Warm rose water hand soak",
      "Cuticle grooming & dead skin scrub",
      "Hydrating hand cream massage",
      "Nail buff & polish application",
    ],
  },
  "spa-manicure": {
    price: 899,
    offerPrice: 749,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Aromatherapy essential oil soak",
      "Detoxifying scrub up to elbows",
      "Deep moisturizing mask & warm wrap",
      "15-min hand & arm massage",
    ],
  },
  "candle-spa-manicure": {
    price: 1099,
    offerPrice: 899,
    duration: "50 mins",
    durationMins: 50,
    features: [
      "Warm soy butter candle wax massage",
      "Intense cuticle repair",
      "Thermal glove wrap",
      "Ultra-luxurious softening",
    ],
  },
  "paraffin-manicure": {
    price: 1199,
    offerPrice: 999,
    duration: "50 mins",
    durationMins: 50,
    features: [
      "Warm medical-grade paraffin wax dip",
      "Relieves dry joints & rough hands",
      "Locks in deep moisture for weeks",
    ],
  },
  "classic-pedicure": {
    price: 699,
    offerPrice: 599,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Warm antiseptic herbal foot soak",
      "Callus filing & cuticle grooming",
      "Exfoliating foot scrub",
      "Calf massage & nail polish",
    ],
  },
  "spa-pedicure": {
    price: 999,
    offerPrice: 849,
    duration: "50 mins",
    durationMins: 50,
    features: [
      "Lavender Epsom salt bubbling soak",
      "Pumice stone heel smoothing",
      "De-tan foot mask with warm towels",
      "20-min acupressure foot massage",
    ],
  },
  "candle-spa-pedicure": {
    price: 1199,
    offerPrice: 999,
    duration: "55 mins",
    durationMins: 55,
    features: [
      "Melted shea butter candle massage",
      "Deep heel crack restoration",
      "Heated foot booties wrap",
    ],
  },
  "crystal-spa-pedicure": {
    price: 1299,
    offerPrice: 1099,
    duration: "55 mins",
    durationMins: 55,
    features: [
      "FYC jelly crystal soak transform",
      "Retains heat 4x longer than water",
      "Draws out foot fatigue & toxins",
      "Silky foot texture",
    ],
  },
  "paraffin-pedicure": {
    price: 1399,
    offerPrice: 1199,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Heated paraffin wax dip for feet",
      "Cures severe winter cracked heels",
      "Deep joint warmth & relief",
    ],
  },
  "ice-cream-pedicure": {
    price: 1299,
    offerPrice: 1099,
    duration: "55 mins",
    durationMins: 55,
    features: [
      "Fun strawberry/chocolate bath bomb soak",
      "Vanilla bean sugar scrub",
      "Chocolate cream foot massage",
    ],
  },
  "heel-peel-treatment": {
    price: 899,
    offerPrice: 699,
    duration: "40 mins",
    durationMins: 40,
    features: [
      "AHA/BHA callus dissolving peel",
      "Removes thick hardened yellow skin",
      "Zero blade, completely painless",
      "Baby soft heels in 1 session",
    ],
  },
  "mani-pedi-combo": {
    price: 1299,
    offerPrice: 1099,
    duration: "75 mins",
    durationMins: 75,
    features: [
      "Complete Classic Manicure + Pedicure",
      "Double relaxation soak & scrub",
      "Cuticle grooming & dual massages",
      "Sanitized tools & clean setup",
    ],
  },
  "hand-massage": {
    price: 349,
    offerPrice: 249,
    duration: "20 mins",
    durationMins: 20,
    features: [
      "Pressure point palm & wrist massage",
      "Relieves typing & phone strain",
      "Warm almond oil application",
    ],
  },
  "foot-massage": {
    price: 399,
    offerPrice: 299,
    duration: "25 mins",
    durationMins: 25,
    features: [
      "Reflexology foot & calf massage",
      "Improves circulation & foot aches",
      "Cooling peppermint cream",
    ],
  },

  // Hair Services
  "womens-haircut": {
    price: 599,
    offerPrice: 499,
    duration: "40 mins",
    durationMins: 40,
    features: [
      "Professional face-shape consultation",
      "Precision haircut (Layers, Step, Feather, Bob)",
      "Light blow-dry finish",
      "Clean floor sheet provided",
    ],
  },
  "hair-trim": {
    price: 399,
    offerPrice: 299,
    duration: "25 mins",
    durationMins: 25,
    features: ["Split end removal", "Length maintenance", "Neat hemline finishing"],
  },
  "fringe-cut": {
    price: 249,
    offerPrice: 199,
    duration: "15 mins",
    durationMins: 15,
    features: ["Bangs & curtain fringe styling", "Frames face structure", "Instant look refresh"],
  },
  "kids-haircut": {
    price: 349,
    offerPrice: 249,
    duration: "25 mins",
    durationMins: 25,
    features: [
      "Gentle, patient haircut for girls",
      "Fun and tear-free experience",
      "Cute styling touch",
    ],
  },
  "blow-dry": {
    price: 499,
    offerPrice: 399,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Straight, bouncy curls or beach waves",
      "Heat protectant serum applied",
      "All-day volume hold",
    ],
  },
  "hair-ironing": {
    price: 599,
    offerPrice: 499,
    duration: "35 mins",
    durationMins: 35,
    features: [
      "Poker straight glass hair finish",
      "Ceramic ionic temperature control",
      "Zero frizz guarantee",
    ],
  },
  "hair-tonging": {
    price: 699,
    offerPrice: 549,
    duration: "40 mins",
    durationMins: 40,
    features: [
      "Hollywood glam waves & tight curls",
      "Long-lasting event hold spray",
      "Heat shield protection",
    ],
  },
  "hair-spa": {
    price: 1499,
    offerPrice: 1199,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "L'Oreal Professionnel / Biolage spa cream",
      "Deep scalp detox & steaming",
      "20-min tension-melting scalp massage",
      "Restores shine & softness",
    ],
  },
  "hair-mask": {
    price: 1199,
    offerPrice: 899,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Intense argan oil moisture therapy",
      "Smoothes chemically treated hair",
      "Thermal towel wrap",
    ],
  },
  "anti-dandruff-treatment": {
    price: 1699,
    offerPrice: 1399,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Zinc pyrithione & tea tree scrub",
      "Purifies itchy flaking scalp",
      "High-frequency micro-stimulation",
      "Prevents recurring dandruff",
    ],
  },
  "head-massage": {
    price: 499,
    offerPrice: 399,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Warm bhringraj or almond oil",
      "Relieves headaches & stress",
      "Promotes deep sleep & hair growth",
    ],
  },
  "root-touch-up": {
    price: 1199,
    offerPrice: 899,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "100% grey coverage up to 2 inches",
      "Ammonia-free branded colour (L'Oreal/Matrix)",
      "Even root blending",
      "Post-colour conditioning",
    ],
  },
  "global-hair-colour": {
    price: 2999,
    offerPrice: 2499,
    duration: "90 mins",
    durationMins: 90,
    features: [
      "Complete root to tip transformation",
      "Shade matching consultation",
      "L'Oreal Inoa / Majirel range",
      "Vibrant shine lock",
    ],
  },
  highlights: {
    price: 3499,
    offerPrice: 2899,
    duration: "100 mins",
    durationMins: 100,
    features: [
      "Classic foil highlights (up to 10 streaks)",
      "Caramel, honey, or blonde tones",
      "Includes toner application",
    ],
  },
  "fashion-colour": {
    price: 3999,
    offerPrice: 3299,
    duration: "120 mins",
    durationMins: 120,
    features: [
      "Burgundy, copper, violet, or balayage",
      "Custom lightening & toning",
      "Intense gloss treatment",
    ],
  },
  "mehendi-application-on-hair": {
    price: 599,
    offerPrice: 449,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Client's prepared henna application",
      "Even scalp to end coverage",
      "Protective plastic shower cap included",
      "No mess guarantee",
    ],
  },

  // Makeup & Styling
  "light-party-makeup": {
    price: 2499,
    offerPrice: 1999,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Dewy natural day/evening base",
      "Subtle eye makeup & liner",
      "Nude lipstick & blush touch",
      "Hairstyling included",
    ],
  },
  "glam-party-makeup": {
    price: 4499,
    offerPrice: 3499,
    duration: "75 mins",
    durationMins: 75,
    features: [
      "Flawless full-coverage party base",
      "Smokey/shimmer eye glam & lashes",
      "Highlighter sculpting & setting spray",
      "Designer hairstyle (curls/bun)",
    ],
  },
  "engagement-makeup": {
    price: 5499,
    offerPrice: 4499,
    duration: "90 mins",
    durationMins: 90,
    features: [
      "HD engagement base with 12-hr wear",
      "Custom mink lashes & lens placement",
      "Intricate floral hairstyle & draping",
      "MAC / Huda Beauty kit",
    ],
  },
  "reception-makeup": {
    price: 7499,
    offerPrice: 5999,
    duration: "90 mins",
    durationMins: 90,
    features: [
      "Red carpet reception glamour",
      "Glow-from-within highlighting",
      "Sophisticated updo or open waves",
      "Lehenga/gown draping included",
    ],
  },
  "hd-makeup": {
    price: 4999,
    offerPrice: 3999,
    duration: "75 mins",
    durationMins: 75,
    features: [
      "Camera-ready HD silicon foundation",
      "Pore-minimizing photo finish",
      "Waterproof & sweat-resistant",
      "Includes luxury hairstyling",
    ],
  },
  "hairstyling-buns-braids-curls": {
    price: 1499,
    offerPrice: 1199,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Bridal messy buns, Dutch braids, or waves",
      "Hair padding & extension setting",
      "Floral jewelry & accessory pinning",
      "All-day hold spray",
    ],
  },
  "saree-draping": {
    price: 699,
    offerPrice: 499,
    duration: "25 mins",
    durationMins: 25,
    features: [
      "Flawless pleat setting & pin-up",
      "Styles: Nivi, Bengali, Gujarati, Mermaid",
      "Comfortable, walk-tested drape",
    ],
  },
  "dupatta-lehenga-draping": {
    price: 799,
    offerPrice: 599,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Heavy bridal dupatta double-pinning",
      "Lehenga cancan puff setting",
      "Secure waist tucking",
    ],
  },
  "false-lashes": {
    price: 599,
    offerPrice: 399,
    duration: "15 mins",
    durationMins: 15,
    features: [
      "Natural or 3D volume mink lashes",
      "Latex-free waterproof lash adhesive",
      "All-day secure hold",
    ],
  },
  lenses: {
    price: 599,
    offerPrice: 449,
    duration: "15 mins",
    durationMins: 15,
    features: [
      "Color cosmetic contact lenses",
      "Safe hygienic application",
      "Enhances eye look in photos",
    ],
  },
  "hair-accessories-setting": {
    price: 499,
    offerPrice: 299,
    duration: "20 mins",
    durationMins: 20,
    features: [
      "Gajra, mathapatti, or passa pinning",
      "Firm grip with no hair pulling",
      "Ensures zero slip throughout the event",
    ],
  },
  "family-makeup-package": {
    price: 7999,
    offerPrice: 6499,
    duration: "150 mins",
    durationMins: 150,
    features: [
      "Complete makeup & hair for 3 family members",
      "Coordinated event ready timing",
      "Includes saree draping & lash add-ons",
    ],
  },
  "bridesmaids-makeup-package": {
    price: 6999,
    offerPrice: 5499,
    duration: "120 mins",
    durationMins: 120,
    features: [
      "Glam party makeover for 2 bridesmaids",
      "Photo-ready HD finish",
      "Hairstyling & dupatta setting",
    ],
  },

  // Mehendi
  "simple-mehendi": {
    price: 599,
    offerPrice: 499,
    duration: "30 mins",
    durationMins: 30,
    features: [
      "Single side floral or bell design",
      "100% natural organic sojat henna",
      "Rich dark mahogany stain guarantee",
      "No chemical burning",
    ],
  },
  "arabic-mehendi": {
    price: 999,
    offerPrice: 799,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Bold Arabic floral & trail vines",
      "Both hands front & back up to wrist",
      "Clove oil stain enhancer applied",
    ],
  },
  "rajasthani-full-hand-mehendi": {
    price: 1899,
    offerPrice: 1499,
    duration: "90 mins",
    durationMins: 90,
    features: [
      "Intricate traditional peacock & jaal work",
      "Elbow-length heavy coverage",
      "Fine line detailed craftsmanship",
    ],
  },
  "karva-chauth-mehendi": {
    price: 1499,
    offerPrice: 1199,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Front & back heavy festival pattern",
      "Chandra & couple silhouette motifs",
      "Special doorstep priority slot",
    ],
  },
  "teej-mehendi": {
    price: 1299,
    offerPrice: 999,
    duration: "50 mins",
    durationMins: 50,
    features: [
      "Traditional Teej swing & floral patterns",
      "Both hands front & back",
      "Guaranteed dark stain",
    ],
  },
  "eid-mehendi": {
    price: 1299,
    offerPrice: 999,
    duration: "50 mins",
    durationMins: 50,
    features: [
      "Delicate Pakistani & Arabic fusion",
      "Fingertip mandala detailing",
      "Quick-drying natural paste",
    ],
  },
  "diwali-mehendi": {
    price: 1299,
    offerPrice: 999,
    duration: "50 mins",
    durationMins: 50,
    features: ["Diya & festive geometric patterns", "Both hands elegant finish"],
  },
  "bridal-mehendi": {
    price: 6999,
    offerPrice: 5499,
    duration: "180 mins",
    durationMins: 180,
    features: [
      "Both hands up to elbows + both feet",
      "Custom bride & groom portrait motifs",
      "Baraat, doli & personalized wedding dates",
      "Special eucalyptus & clove aftercare oil",
    ],
  },

  // Body Care & Spa
  "body-scrub": {
    price: 1899,
    offerPrice: 1499,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Choice of Coffee, Walnut or Sugar scrub",
      "Removes dead skin & ingrown hair",
      "Promotes blood circulation",
      "Silky smooth skin feel",
    ],
  },
  "body-polishing": {
    price: 2499,
    offerPrice: 1999,
    duration: "75 mins",
    durationMins: 75,
    features: [
      "Full body exfoliation & hydration pack",
      "Tan reversal and glow restoration",
      "Warm towel therapy",
      "Relaxing lymphatic strokes",
    ],
  },
  "body-wrap": {
    price: 2199,
    offerPrice: 1699,
    duration: "60 mins",
    durationMins: 60,
    features: [
      "Detoxifying clay & herbal body wrap",
      "Tightens skin texture & flushes water retention",
      "Deep thermal cocoon wrap",
    ],
  },
  "head-neck-shoulder-massage": {
    price: 1199,
    offerPrice: 899,
    duration: "45 mins",
    durationMins: 45,
    features: [
      "Focused upper body stress release",
      "Eases computer neck & shoulder knots",
      "Warm essential oil therapy",
      "100% verified female therapist",
    ],
  },

  // Bridal & Pre-Bridal
  "traditional-bridal-makeup": {
    price: 12000,
    offerPrice: 9999,
    duration: "150 mins",
    durationMins: 150,
    features: [
      "Authentic royal Indian bridal makeover",
      "16-hr sweat & tear proof HD base",
      "Luxury bridal eye glam, 3D lashes & lenses",
      "Complete lehenga, jewelry & dupatta draping",
      "MAC, Huda Beauty & NARS kit",
    ],
  },
  "hd-bridal-makeup": {
    price: 16000,
    offerPrice: 13999,
    duration: "180 mins",
    durationMins: 180,
    features: [
      "Ultra-high definition 4K bridal base",
      "Flawless close-up camera finish",
      "Advanced contouring & highlighting",
      "Designer hairstyle with fresh florals/jewelry",
      "Premium bridal touch-up kit included",
    ],
  },
  "airbrush-bridal-makeup": {
    price: 20000,
    offerPrice: 17999,
    duration: "180 mins",
    durationMins: 180,
    features: [
      "Temptu USA airbrush silicone base",
      "Weightless, waterproof & zero flashback",
      "Lasts 24 hours through wedding tears & sweat",
      "Signature bridal hair & lehenga styling",
      "International bridal kit",
    ],
  },
  "bridal-makeup-trial": {
    price: 3499,
    offerPrice: 2999,
    duration: "90 mins",
    durationMins: 90,
    features: [
      "Full face skin tone & foundation match",
      "Eye makeup styling trial on one side",
      "Hairstyle consultation & jewelry placement",
      "Advance credited toward wedding booking",
    ],
  },
  "1-month-pre-bridal-package": {
    price: 14999,
    offerPrice: 11999,
    duration: "360 mins",
    durationMins: 360,
    features: [
      "2 Full Body Waxing + De-Tan sessions",
      "2 Luxury O3+ / Gold Facials",
      "2 Spa Mani-Pedi Combos",
      "1 Full Body Polishing + Hair Spa",
      "Complete wedding-ready head-to-toe glow",
    ],
  },
  "2-month-pre-bridal-package": {
    price: 21999,
    offerPrice: 17999,
    duration: "600 mins",
    durationMins: 600,
    features: [
      "3 Full Body Rica Waxing + De-Tan",
      "3 Derma / Korean Glass Skin Facials",
      "3 Candle Spa Mani-Pedi sessions",
      "2 Body Polishings + 2 Hair Spas",
      "Bi-weekly scheduled doorstep sessions",
    ],
  },
  "3-month-pre-bridal-package": {
    price: 28999,
    offerPrice: 23999,
    duration: "900 mins",
    durationMins: 900,
    features: [
      "Complete 12-week comprehensive bridal transformation",
      "Monthly Rica waxing, de-tan & skin brightening",
      "4 Casmara & O3+ bespoke facials",
      "4 Luxury Mani-Pedi treatments",
      "Bridal Glow Facial before wedding week",
    ],
  },
  "bride-s-family-package": {
    price: 19999,
    offerPrice: 15999,
    duration: "240 mins",
    durationMins: 240,
    features: [
      "Makeovers for Bride's Mother + Sister + 2 Relatives (4 persons)",
      "HD party glam with lashes & hair",
      "Complete saree/lehenga draping",
      "Dedicated team of 2 verified artists",
    ],
  },
};

async function main() {
  console.log("Updating service pricing, durations, and features across master catalogue...");
  let updatedCount = 0;

  for (const [slug, data] of Object.entries(SERVICE_PRICING)) {
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (!existing) continue;

    // Only update if currently price is null or if active
    const featuresStr = data.features ? data.features.join("\n") : existing.features;
    await prisma.service.update({
      where: { id: existing.id },
      data: {
        price: data.price,
        offerPrice: data.offerPrice,
        duration: data.duration,
        durationMins: data.durationMins,
        features: featuresStr,
        whatsIncluded: data.features ?? [],
      },
    });
    updatedCount++;
    console.log(
      `  ✓ Updated ${existing.title} (${slug}) -> ₹${data.offerPrice} (was ₹${existing.price ?? "null"})`
    );
  }

  console.log(
    `\nSuccessfully updated ${updatedCount} services with realistic doorstep prices and durations!`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
