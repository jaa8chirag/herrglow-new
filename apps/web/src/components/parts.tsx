import Link from "next/link";
import { Badge, Card, Price, cn } from "@herrglow/ui";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { getMediaKeys } from "@/lib/data";
import { realImage } from "@/lib/media";
import { Photo } from "@/components/Photo";

/* ───────── Breadcrumbs (UI + schema) ───────── */
export function Breadcrumbs({
  items,
  className,
}: {
  items: { name: string; path: string }[];
  className?: string;
}) {
  // Prevent duplicate 'Home' if already passed in items
  const normalized =
    items[0]?.path === "/" || items[0]?.name?.toLowerCase() === "home" ? items.slice(1) : items;
  const all = [{ name: "Home", path: "/" }, ...normalized];
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("mb-2 text-xs text-ink-soft", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden className="text-gold-500">
                  /
                </span>
              )}
              {i < all.length - 1 ? (
                <Link href={it.path} className="hover:text-rose-700 hover:underline">
                  {it.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-plum-800">
                  {it.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}

/* ───────── FAQ (no JS; schema is added by the page for the same visible FAQs) ───────── */
export function FaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null;
  return (
    <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white/80">
      {faqs.map((f) => (
        <details key={f.question} className="group p-5 open:bg-blush-50/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-plum-900">
            {f.question}
            <span
              aria-hidden
              className="text-xl text-rose-600 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 leading-relaxed text-ink-soft">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

/* ───────── Rich HTML (admin/legacy trusted content; sanitise on save once the editor exists) ───────── */
export function Html({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose-herr max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* ───────── Cards ───────── */
export async function ServiceCard({
  s,
  fromLabel,
}: {
  s: {
    slug: string;
    title: string;
    shortDescription: string | null;
    price: unknown;
    offerPrice: unknown;
    priceLabel?: string | null;
    image?: string | null;
    imageAlt?: string | null;
    categoryId?: string;
    category?: { name: string; slug?: string } | null;
    variants?: { price: unknown; offerPrice: unknown }[];
  };
  fromLabel?: boolean;
}) {
  const keys = await getMediaKeys();
  const src = realImage(keys, s.image);
  const nums = [s.offerPrice ?? s.price, ...(s.variants ?? []).map((v) => v.offerPrice ?? v.price)]
    .map((n) => (n == null ? NaN : Number(n)))
    .filter((n) => Number.isFinite(n) && n > 0);
  const low = nums.length ? Math.min(...nums) : null;
  const high = nums.length > 1 ? Math.max(...nums) : null;
  const hasRange = low != null && high != null && high > low;
  const targetHref = s.category?.slug
    ? `/services/${s.category.slug}/${s.slug}`
    : `/services/${s.slug}`;
  return (
    <Link href={targetHref} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-[4/3] w-full">
          <Photo
            src={src}
            alt={s.imageAlt || s.title}
            kind={s.category?.slug ?? s.categoryId}
            seedKey={s.slug}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          {s.category && <Badge className="self-start">{s.category.name}</Badge>}
          <h3 className="mt-3 group-hover:text-rose-700">{s.title}</h3>
          {s.shortDescription && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
              {s.shortDescription}
            </p>
          )}
          <div className="mt-auto pt-4">
            {low != null &&
              (hasRange ? (
                <span className="font-serif text-base sm:text-lg font-bold text-plum-950">
                  ₹{Math.round(low).toLocaleString("en-IN")} - ₹
                  {Math.round(high!).toLocaleString("en-IN")}
                </span>
              ) : (
                <Price
                  offerPrice={low}
                  label={s.priceLabel === "Starting at" ? "From" : undefined}
                />
              ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ProCard({
  p,
  href,
}: {
  p: {
    name: string;
    photo: string | null;
    specialization: string | null;
    experienceYears: number | null;
    providerType: string;
  };
  href?: string;
}) {
  const inner = (
    <Card className="flex h-full items-center gap-4 p-5">
      <span
        aria-hidden
        className="grid size-14 shrink-0 place-items-center rounded-full bg-linear-to-br from-blush-200 to-blush-100 font-serif text-xl text-plum-800"
      >
        {p.name.trim()[0]?.toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-plum-900">{p.name}</span>
        <span className="block truncate text-sm text-ink-soft">
          {p.specialization ??
            (p.providerType === "MAKEOVER_ARTIST" ? "Makeover artist" : "Beautician")}
        </span>
        {p.experienceYears ? (
          <span className="mt-1 block text-xs text-rose-700">
            {p.experienceYears}+ years experience
          </span>
        ) : null}
      </span>
    </Card>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export const stripTags = (h: string | null | undefined) =>
  (h ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
