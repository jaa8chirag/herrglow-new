import type { ReactNode } from "react";
import { BlurFade, Container, cn } from "@herrglow/ui";
import { Breadcrumbs } from "@/components/parts";
import { Photo } from "@/components/Photo";

/** Hero for inner pages: soft blush gradient + grain, big serif title, optional image (real photo or designed fallback). */
export function PageHero({ crumbs, eyebrow, title, intro, image, children, className }: {
  crumbs: { name: string; path: string }[]; eyebrow?: string; title: ReactNode; intro?: ReactNode;
  image?: { src: string | null; alt: string; kind?: string; seedKey?: string };
  children?: ReactNode; className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-gradient-to-b from-blush-100 via-blush-50 to-ivory", className)}>
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-gold-300/25 blur-3xl" />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-multiply" />
      <Container className="relative pb-10 pt-8 sm:pb-14 sm:pt-10">
        <Breadcrumbs items={crumbs} />
        <div className={cn("grid items-center gap-8", image && "lg:grid-cols-[1.2fr_0.8fr]")}>
          <div>
            {eyebrow && <BlurFade><p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700"><span aria-hidden className="h-px w-8 bg-gold-400" />{eyebrow}</p></BlurFade>}
            <BlurFade delay={0.06}><h1 className="!text-[clamp(2.25rem,5.5vw,4.25rem)]">{title}</h1></BlurFade>
            {intro && <BlurFade delay={0.12}><p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{intro}</p></BlurFade>}
            {children && <BlurFade delay={0.18} className="mt-6">{children}</BlurFade>}
          </div>
          {image && (
            <BlurFade delay={0.1} className="hidden lg:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border-4 border-ivory shadow-lift"><Photo src={image.src} alt={image.alt} kind={image.kind} seedKey={image.seedKey} priority sizes="40vw" /></div>
            </BlurFade>
          )}
        </div>
      </Container>
    </section>
  );
}
