import { Award, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findPage, urls } from "@herrglow/core";
import {
  Badge,
  BlurFade,
  Card,
  Container,
  FallbackArt,
  Price,
  Section,
  SectionHeading,
  buttonStyles,
  cn,
} from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { PortfolioGallery } from "@/components/page/Lightbox";
import { Breadcrumbs, Html } from "@/components/parts";
import { getLiveCities, getProPage } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { JsonLd, personLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(props: PageProps<"/artists/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [data, page] = await Promise.all([getProPage(slug), findPage(urls.pro(slug))]);
  if (!data) return {};
  const { pro, cities } = data;
  const where = cities.map((c) => c.name).join(", ");
  return buildMetadata({
    title:
      pro.seoTitle ||
      `${pro.name}: ${pro.providerType === "MAKEOVER_ARTIST" ? "Makeup Artist" : "Beautician"}${where ? ` in ${where}` : ""}`,
    description:
      pro.seoDescription ||
      `${pro.name}${pro.specialization ? `, specialising in ${pro.specialization}` : ""}${pro.experienceYears ? ` with ${pro.experienceYears}+ years of experience` : ""}. Book at home${where ? ` in ${where}` : ""}.`,
    path: urls.pro(slug),
    image: /^https?:/.test(pro.photo ?? "") ? pro.photo : null,
    type: "profile",
    indexable: page?.isIndexable ?? false,
  });
}

export default async function ProPage(props: PageProps<"/artists/[slug]">) {
  const { slug } = await props.params;
  const [data, cities] = await Promise.all([getProPage(slug), getLiveCities()]);
  if (!data) notFound();
  const { pro, services, cities: covered, realMedia } = data;
  const real = (p: string | null | undefined) =>
    p && (/^https?:\/\//.test(p) || p.startsWith("/") || realMedia.has(p)) ? mediaUrl(p) : null;
  const photo = real(pro.photo);
  const portfolio = (
    (Array.isArray(pro.portfolio) ? pro.portfolio : []) as { path: string; alt: string }[]
  )
    .map((p) => ({ src: real(p.path), alt: p.alt || `${pro.name} portfolio` }))
    .filter((p): p is { src: string; alt: string } => !!p.src);
  const path = urls.pro(slug);
  const role = pro.providerType === "MAKEOVER_ARTIST" ? "Makeup Artist" : "Beautician";
  const first = pro.name.split(" ")[0];
  const specialties = (pro.specialization ?? "")
    .split(/[,/]/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3 && x.length <= 40)
    .slice(0, 6); // legacy free text can be a paragraph: chip only short, clean items

  return (
    <>
      <JsonLd
        data={personLd({
          name: pro.name,
          path,
          image: photo,
          jobTitle: role,
          description: pro.specialization,
        })}
      />
      {/* cover */}
      <section className="relative">
        <div className="relative h-48 overflow-hidden sm:h-64">
          <Image
            src="/hero/bridal-glam.jpg"
            alt={`${pro.name} studio background`}
            fill
            sizes="100vw"
            className="object-cover object-center brightness-90 filter"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-plum-950/40 via-plum-950/15 to-ivory"
          />
        </div>
        <Container className="relative -mt-24 sm:-mt-28">
          <div className="mb-3 inline-flex items-center rounded-full bg-ivory/95 px-3 py-1 shadow-sm backdrop-blur-md border border-line/60">
            <Breadcrumbs
              items={[
                {
                  name: covered[0]?.name ?? "Artists",
                  path: covered[0] ? urls.cityHub(covered[0].slug) : "/",
                },
                { name: pro.name, path },
              ]}
              className="mb-0"
            />
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="relative size-36 shrink-0 overflow-hidden rounded-[1.75rem] border-4 border-ivory bg-blush-100 shadow-lift sm:size-44">
              {photo ? (
                <Image
                  src={photo}
                  alt={`${pro.name}, ${role}`}
                  fill
                  sizes="176px"
                  className="object-cover"
                  priority
                />
              ) : (
                <FallbackArt kind="artist" seed={slug.length + 1} />
              )}
            </div>
            <div className="pb-2">
              <Badge tone="gold">{role}</Badge>
              <h1 className="mt-3 !text-[clamp(2.25rem,5vw,3.75rem)]">{pro.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-ink-soft">
                {pro.experienceYears ? (
                  <span className="flex items-center gap-1.5">
                    <Award className="size-4 text-gold-500" />
                    {pro.experienceYears}+ years of experience
                  </span>
                ) : null}
                {covered[0] && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-rose-600" />
                    {covered.map((c) => c.name).join(", ")}
                  </span>
                )}
              </p>
              <Link
                href="#book"
                className={cn(buttonStyles({ variant: "shimmer", size: "lg" }), "mt-5")}
              >
                Book {first}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Section className="py-12">
        <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-10">
            {specialties.length > 0 && (
              <div>
                <h2 className="mb-3 !text-2xl">Specialities</h2>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-line bg-white px-4 py-2 text-sm text-plum-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pro.bio && (
              <div>
                <h2 className="mb-2 !text-2xl">About {first}</h2>
                <Html
                  html={
                    pro.bio.includes("<") ? pro.bio : `<p>${pro.bio.replace(/\n+/g, "</p><p>")}</p>`
                  }
                />
              </div>
            )}
            {covered.length > 0 && (
              <div>
                <h2 className="mb-3 !text-2xl">Where {first} works</h2>
                {covered.map((c) => (
                  <p key={c.slug} className="mt-2 text-ink-soft">
                    <Link
                      className="font-medium text-rose-700 underline underline-offset-4"
                      href={urls.cityHub(c.slug)}
                    >
                      {c.name}
                    </Link>
                    : {c.areas.slice(0, 12).join(", ")}
                    {c.areas.length > 12 ? ` and ${c.areas.length - 12} more areas` : ""}
                  </p>
                ))}
              </div>
            )}
          </div>
          {services.length > 0 && (
            <BlurFade>
              <Card className="p-6">
                <h2 className="mb-4 !text-xl">Services &amp; prices</h2>
                <ul className="divide-y divide-line">
                  {services.map((s) => (
                    <li key={s.slug} className="flex items-center justify-between gap-3 py-3">
                      <Link
                        href={urls.service(s.slug)}
                        className="text-plum-800 hover:text-rose-700"
                      >
                        {s.title}
                      </Link>
                      <Price
                        price={s.price == null ? null : Number(s.price)}
                        offerPrice={s.offerPrice == null ? null : Number(s.offerPrice)}
                        label="From"
                        className="shrink-0 [&>span:nth-child(2)]:text-base"
                      />
                    </li>
                  ))}
                </ul>
              </Card>
            </BlurFade>
          )}
        </Container>
      </Section>

      {portfolio.length > 0 && (
        <Section tone="blush">
          <Container>
            <SectionHeading eyebrow="Portfolio" title={`${first}'s work`} />
            <PortfolioGallery images={portfolio} />
          </Container>
        </Section>
      )}

      <section className="section-dark py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
              Book this artist
            </p>
            <h2 className="mt-3 text-ivory">Request {first}</h2>
            <div className="gold-rule my-5 w-24" />
            <p className="max-w-md text-lg text-blush-100">
              Share your area and date. We confirm {first}&apos;s availability, or suggest another
              artist near you.
            </p>
          </div>
          <BookingForm
            cities={cities}
            defaultCity={covered[0]?.slug}
            sourcePath={path}
            proSlug={pro.slug}
            proName={pro.name}
            enquiry
            heading={`Request ${first}`}
          />
        </Container>
      </section>
    </>
  );
}
