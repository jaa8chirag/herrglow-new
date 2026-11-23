import Image from "next/image";
import { FallbackArt, cn, seedOf } from "@herrglow/ui";

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  makeup: "/hero/bridal-glam.jpg",
  "bridal-makeup": "/hero/bridal-glam.jpg",
  "salon-at-home": "/images/services/full-body-waxing-at-home.jpg",
  waxing: "/images/services/full-body-waxing-at-home.jpg",
  "facial-skincare": "/images/services/facial-at-home.jpg",
  facials: "/images/services/facial-at-home.jpg",
  hair: "/images/services/hair-spa-at-home.jpg",
  nails: "/images/services/gel-nail-extensions.jpg",
  mehndi: "/images/packages/complete-bridal-package.jpg",
  "pre-bridal": "/images/packages/pre-bridal-glow-package.jpg",
  packages: "/images/packages/pre-bridal-glow-package.jpg",
  blog: "/hero/bridal-glam.jpg",
};

/**
 * A photo that never degrades to a text box. With a real image: next/image (lazy unless `priority`).
 * When no image is provided: falls back to category-specific photo first, then designed fallback art.
 */
export function Photo({ src, alt, kind, seedKey, sizes = "(min-width: 1024px) 33vw, 100vw", priority = false, className, imgClassName }: {
  src: string | null | undefined; alt: string; kind?: string; seedKey?: string; sizes?: string; priority?: boolean; className?: string; imgClassName?: string;
}) {
  const resolvedSrc = src || (kind ? CATEGORY_DEFAULT_IMAGES[kind] : null) || "/hero/doorstep-salon.jpg";

  return (
    <div className={cn("relative size-full overflow-hidden bg-blush-100", className)}>
      {resolvedSrc ? (
        <Image src={resolvedSrc} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover transition-transform duration-700 ease-out group-hover:scale-105", imgClassName)} />
      ) : (
        <FallbackArt kind={kind} seed={seedOf(seedKey ?? alt)} />
      )}
    </div>
  );
}
