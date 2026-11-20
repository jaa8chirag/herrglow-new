"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonStyles, cn } from "@herrglow/ui";

/** "Book Now": scrolls to the page's booking form when there is one, otherwise opens the contact page's form. */
export function BookLink({ className, label = "Book Now" }: { className?: string; label?: string }) {
  const router = useRouter();
  return (
    <Link
      href="/contact#book"
      className={cn(buttonStyles({ variant: "shimmer", size: "md" }), className)}
      onClick={(e) => {
        e.preventDefault();
        const el = document.getElementById("book");
        if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(() => el.querySelector<HTMLElement>("input,select,textarea")?.focus({ preventScroll: true }), 600); }
        else router.push("/contact#book");
      }}
    >
      {label}
    </Link>
  );
}
