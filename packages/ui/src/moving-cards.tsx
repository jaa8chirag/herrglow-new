import type { ReactNode } from "react";
import { Marquee } from "./effects";
import { cn } from "./utils";

/**
 * Infinite moving cards (Aceternity). Two rows moving in opposite directions would be too busy for a handful of
 * reviews, so this is a single slow row. The items are plain server-rendered elements.
 */
export function InfiniteMovingCards({ children, className, duration = 60 }: { children: ReactNode; className?: string; duration?: number }) {
  return <Marquee duration={duration} gap="1.25rem" className={cn("py-2", className)}>{children}</Marquee>;
}
