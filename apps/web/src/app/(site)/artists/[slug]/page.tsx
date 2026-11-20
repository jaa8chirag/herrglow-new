import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findPage, urls } from "@herrglow/core";
import { Badge, Container, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { Breadcrumbs, Html } from "@/components/parts";
import { getLiveCities, getProPage } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { JsonLd, personLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export async function generateMetadata(props: PageProps<"/artists/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [data, page] = await Promise.all([getProPage(slug), findPage(urls.pro(slug))]);
  if (!data) return {};
  const { pro, cities } = data;
  const where = cities.map((c) => c.name).join(", ");
  return buildMetadata({
    title: pro.seoTitle || `${pro.name}: ${pro.providerType === "MAKEOVER_ARTIST" ? "Makeup Artist" : "Beautician"}${where ? ` in ${where}` : ""}`,
    description: pro.seoDescription || `${pro.name}${pro.specialization ? `, specialising in ${pro.specialization}` : ""}${pro.experienceYears ? ` with ${pro.experienceYears}+ years of experience` : ""}. Book at home${where ? ` in ${where}` : ""}.`,
    path: urls.pro(slug), image: /^https?:/.test(pro.photo ?? "") ? pro.photo : null, type: "profile", indexable: page?.isIndexable ?? false,
  });
}

export default async function ProPage(props: PageProps<"/artists/[slug]">) {
  const { slug } = await props.params;
  const [data, cities] = await Promise.all([getProPage(slug), getLiveCities()]);
  if (!data) notFound();
  const { pro, services, cities: covered, realMedia } = data;
  const real = (p: string | null | undefined) => (p && (/^https?:\/\//.test(p) || realMedia.has(p)) ? mediaUrl(p) : null);
  const photo = real(pro.photo);
  const portfolio = (Array.isArray(pro.portfolio) ? pro.portfolio : []) as { path: string; alt: string }[];
  const path = urls.pro(slug);
  const role = pro.providerType === "MAKEOVER_ARTIST" ? "Makeup Artist" : "Beautician";

  return (
    <>
      <JsonLd data={personLd({ name: pro.name, path, image: photo, jobTitle: role, description: pro.specialization })} />
      <Section className="pb-6">
        <Container>
          <Breadcrumbs items={[{ name: "Artists", path: covered[0] ? urls.cityHub(covered[0].slug) : "/" }, { name: pro.name, path }]} />
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-5">
                {photo ? <Image src={photo} alt={`${pro.name}, ${role}`} width={112} height={112} className="size-28 rounded-full object-cover" priority /> : <span aria-hidden className="grid size-28 place-items-center rounded-full bg-linear-to-br from-blush-200 to-blush-100 font-serif text-4xl text-plum-800">{pro.name[0]?.toUpperCase()}</span>}
                <div>
                  <Badge>{role}</Badge>
                  <h1 className="mt-2 text-4xl">{pro.name}</h1>
                  {pro.experienceYears ? <p className="mt-1 text-sm text-rose-700">{pro.experienceYears}+ years of experience</p> : null}
                </div>
              </div>
              {pro.specialization && <p className="mt-5 text-lg text-ink-soft"><span className="font-medium text-plum-900">Specialises in:</span> {pro.specialization}</p>}
              {pro.bio && <Html html={pro.bio.includes("<") ? pro.bio : `<p>${pro.bio.replace(/\n+/g, "</p><p>")}</p>`} className="mt-4" />}
              {covered.length > 0 && (
                <div className="mt-6"><h2 className="text-2xl">Where {pro.name.split(" ")[0]} works</h2>
                  {covered.map((c) => <p key={c.slug} className="mt-2 text-ink-soft"><Link className="font-medium text-rose-700 underline underline-offset-4" href={urls.cityHub(c.slug)}>{c.name}</Link>: {c.areas.slice(0, 10).join(", ")}{c.areas.length > 10 ? ` and ${c.areas.length - 10} more` : ""}</p>)}
                </div>
              )}
            </div>
            <BookingForm cities={cities} defaultCity={covered[0]?.slug} sourcePath={path} proSlug={pro.slug} proName={pro.name} enquiry heading={`Request ${pro.name.split(" ")[0]}`} />
          </div>
        </Container>
      </Section>
      {services.length > 0 && <Section tone="blush"><Container><SectionHeading title="Services offered" /><ul className="flex flex-wrap gap-2">{services.map((s) => <li key={s.slug}><Link href={urls.service(s.slug)} className="inline-block rounded-full border border-plum-700/20 bg-white px-4 py-2 text-sm text-plum-800 hover:bg-blush-100">{s.title}</Link></li>)}</ul></Container></Section>}
      {portfolio.some((p) => real(p.path)) && (
        <Section><Container><SectionHeading title="Portfolio" /><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{portfolio.filter((p) => real(p.path)).slice(0, 8).map((p) => <Image key={p.path} src={real(p.path)!} alt={p.alt || `${pro.name} portfolio`} width={400} height={500} className="aspect-[4/5] w-full rounded-2xl object-cover" loading="lazy" />)}</div></Container></Section>
      )}
    </>
  );
}
