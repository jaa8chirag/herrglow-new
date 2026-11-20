import Image from "next/image";
import { FallbackArt, cn, seedOf } from "@herrglow/ui";

/**
 * A photo that never degrades to a text box. With a real image: next/image (Cloudflare loader, lazy unless `priority`).
 * Without one: the designed fallback, in the same box. The parent must be `relative` with a fixed aspect ratio.
 */
export function Photo({ src, alt, kind, seedKey, sizes = "(min-width: 1024px) 33vw, 100vw", priority = false, className, imgClassName }: {
  src: string | null | undefined; alt: string; kind?: string; seedKey?: string; sizes?: string; priority?: boolean; className?: string; imgClassName?: string;
}) {
  return (
    <div className={cn("relative size-full overflow-hidden bg-blush-100", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover transition-transform duration-700 ease-out group-hover:scale-105", imgClassName)} />
      ) : (
        <FallbackArt kind={kind} seed={seedOf(seedKey ?? alt)} />
      )}
    </div>
  );
}
