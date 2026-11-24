import { Compass } from "lucide-react";
import Link from "next/link";
import { Container, buttonStyles, cn } from "@herrglow/ui";

/** Designed 404. Used both inside the site chrome ((site)/not-found) and for unmatched URLs (app/not-found). */
export function NotFoundView({ suggestions }: { suggestions?: { href: string; label: string }[] }) {
  const links = suggestions ?? [
    { href: "/services", label: "Browse services" },
    { href: "/packages", label: "See packages" },
    { href: "/blog", label: "Read the blog" },
    { href: "/contact", label: "Contact us" },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-blush-50 to-ivory py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gold-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="grain pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-multiply"
      />
      <Container className="relative text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full border border-gold-400/60 bg-ivory shadow-soft">
          <Compass className="size-9 text-plum-700" strokeWidth={1.2} />
        </span>
        <p className="mt-8 font-serif text-[clamp(5rem,16vw,10rem)] leading-none text-plum-700/15">
          404
        </p>
        <h1 className="-mt-6 !text-[clamp(2rem,5vw,3.5rem)] sm:-mt-10">This page took a day off</h1>
        <div className="gold-rule mx-auto my-6 w-24" />
        <p className="mx-auto max-w-md text-lg text-ink-soft">
          We could not find what you were looking for. It may have moved, or the link may be old.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonStyles({ variant: "shimmer", size: "lg" })}>
            Back to home
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(buttonStyles({ variant: "outline", size: "lg" }), "bg-white/60")}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
