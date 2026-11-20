import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findPage, getRelatedBlogs, relatedServicesForText, urls } from "@herrglow/core";
import { Container, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { Breadcrumbs, Html, stripTags } from "@/components/parts";
import { getBlog, getLiveCities } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { JsonLd, articleLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [b, page] = await Promise.all([getBlog(slug), findPage(urls.blog(slug))]);
  if (!b) return {};
  return buildMetadata({
    title: b.seoTitle || b.title,
    description: b.seoDescription || stripTags(b.excerpt) || stripTags(b.content).slice(0, 155),
    path: urls.blog(slug), image: mediaUrl(b.image), type: "article", publishedTime: b.publishedAt, modifiedTime: b.updatedAt,
    indexable: page?.isIndexable ?? false,
  });
}

export default async function BlogPost(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const [b, cities] = await Promise.all([getBlog(slug), getLiveCities()]);
  if (!b) notFound();
  const text = `${b.title} ${stripTags(b.content)}`;
  const [services, more] = await Promise.all([relatedServicesForText(text, 4), getRelatedBlogs(b.title, slug, 3)]);
  const path = urls.blog(slug);
  return (
    <>
      <JsonLd data={articleLd({ title: b.title, description: b.excerpt, path, image: mediaUrl(b.image), author: b.authorName, published: b.publishedAt, modified: b.updatedAt })} />
      <Section>
        <Container className="max-w-3xl">
          <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: b.title, path }]} />
          <p className="text-sm text-rose-700">{b.publishedAt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          <h1 className="mt-2">{b.title}</h1>
          <Html html={b.content ?? ""} className="mt-8" />
        </Container>
      </Section>
      {(services.length > 0 || more.length > 0) && (
        <Section tone="blush">
          <Container className="max-w-3xl">
            {services.length > 0 && (<><SectionHeading title="Services mentioned in this guide" /><ul className="mb-8 flex flex-wrap gap-2">{services.map((s) => <li key={s.slug}><Link href={urls.service(s.slug)} className="inline-block rounded-full border border-plum-700/20 bg-white px-4 py-2 text-sm text-plum-800 hover:bg-blush-100">{s.title}</Link></li>)}</ul></>)}
            {cities.length > 0 && <p className="mb-8 text-ink-soft">Available in {cities.map((c, i) => <span key={c.slug}>{i > 0 && ", "}<Link className="text-rose-700 underline underline-offset-4" href={urls.cityHub(c.slug)}>{c.name}</Link></span>)}.</p>}
            {more.length > 0 && (<><h3 className="mb-3">Keep reading</h3><ul className="space-y-2">{more.map((m) => <li key={m.slug}><Link className="text-rose-700 underline underline-offset-4" href={urls.blog(m.slug)}>{m.title}</Link></li>)}</ul></>)}
          </Container>
        </Section>
      )}
      <Section><Container className="max-w-xl"><BookingForm cities={cities} sourcePath={path} enquiry heading="Ready to book?" /></Container></Section>
    </>
  );
}
