import { BookOpen, Brush, Crown, Droplets, Flower2, Gem, MapPin, Palette, Scissors, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "./utils";

/** Line-icon per category/kind. Used when a real photo is missing: a designed placeholder, never bare text. */
const ICONS: Record<string, LucideIcon> = {
  makeup: Palette, bridal: Crown, "pre-bridal": Crown, "salon-at-home": Sparkles, "facial-skincare": Droplets,
  hair: Scissors, nails: Gem, mehndi: Flower2, artist: UserRound, city: MapPin, blog: BookOpen, package: Crown, brush: Brush,
};

const VARIANTS = [
  "from-blush-200 via-blush-100 to-ivory",
  "from-blush-100 via-ivory to-gold-300/30",
  "from-ivory via-blush-100 to-blush-300/60",
  "from-gold-300/40 via-blush-100 to-ivory",
];

/**
 * Fills its (relatively positioned) parent. Soft brand gradient (blush → ivory), faint gold/rose glows,
 * subtle grain and a large thin line icon. Same box as a photo, so there is no layout shift when a photo is added later.
 */
export function FallbackArt({ kind = "makeup", seed = 0, className }: { kind?: string; seed?: number; className?: string }) {
  const Icon = ICONS[kind] ?? Sparkles;
  const v = VARIANTS[Math.abs(seed) % VARIANTS.length];
  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden bg-gradient-to-br", v, className)}>
      <div className="absolute -left-1/4 -top-1/4 size-3/4 rounded-full bg-rose-600/10 blur-3xl" />
      <div className="absolute -bottom-1/3 -right-1/4 size-3/4 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="grain absolute inset-0 opacity-[0.35] mix-blend-multiply" />
      <div className="absolute inset-0 grid place-items-center text-plum-700/25">
        <Icon strokeWidth={0.9} className="size-1/3 min-h-12 min-w-12 max-h-40 max-w-40" />
      </div>
    </div>
  );
}

/** Stable small integer from a string, so each card keeps the same gradient across renders. */
export const seedOf = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
