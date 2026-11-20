import { Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findPage, getBlogs, getRelatedBlogs, relatedServicesForText, urls } from "@herrglow/core";
import { Card, Carousel, Container, Section, SectionHeading } from "@herrglow/ui";
import { BookingForm } from "@/components/BookingForm";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { PageHero } from "@/components/page/PageHero";
import { Html, stripTags } from "@/components/parts";
import { Photo } from "@/components/Photo";
import { getBlog, getLiveCities, getMediaKeys } from "@/lib/data";
import { realImage } from "@/lib/media";
import { JsonLd, articleLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { readingMinutes, topicOf, withToc } from "@/lib/toc";

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const [b, page, keys] = await Promise.all([getBlog(slug), findPage(urls.blog(slug)), getMediaKeys()]);
  if (!b) return {};
  return buildMetadata({
    title: b.seoTitle || b.title,
    description: b.seoDescription || stripTags(b.excerpt) || stripTags(b.content).slice(0, 155),
    path: urls.blog(slug), image: realImage(keys, b.image), type: "article", publishedTime: b.publishedAt, modifiedTime: b.updatedAt,
    indexable: page?.isIndexable ?? false,
  });
}

export default async function BlogPost(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const [b, cities, keys] = await Promise.all([getBlog(slug), getLiveCities(), getMediaKeys()]);
  if (!b) notFound();
  const text = `${b.title} ${stripTags(b.content)}`;
  const [services, more, all] = await Promise.all([relatedServicesForText(text, 4), getRelatedBlogs(b.title, slug, 4), getBlogs()]);
  const { html, toc } = withToc(b.content ?? "");
  const path = urls.blog(slug);
  const image = realImage(keys, b.image);
  const byslug = new Map(all.map((x) => [x.slug, x]));

  return (
    <>
      <ReadingProgress />
      <JsonLd data={articleLd({ title: b.title, description: b.excerpt, path, image, author: b.authorName, published: b.publishedAt, modified: b.updatedAt })} />
      <PageHero crumbs={[{ name: "Blog", path: "/blog" }, { name: b.title, path }]} eyebrow={topicOf(b.title)} title={b.title} image={{ src: image, alt: b.imageAlt || b.title, kind: "blog", seedKey: b.slug }}>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft"><span>By {b.authorName || "HerrGlow"}</span><span aria-hidden>·</span><span>{b.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span><span aria-hidden>·</span><span className="flex items-center gap-1"><Clock className="size-3.5" />{readingMinutes(b.content ?? "")} min read</span></p>
      </PageHero>

      <Section className="py-12">
        <Container className="grid gap-12 lg:grid-cols-[1fr_17rem]">
          <article id="article" className="mx-auto w-full max-w-3xl"><Html html={html} /></article>
          <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            {toc.length > 2 && (
              <nav aria-label="Table of contents" className="rounded-[1.5rem] border border-line bg-white/80 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-rose-700">In this article</p>
                <ol className="space-y-2 text-sm">{toc.map((t) => <li key={t.id} className={t.level === 3 ? "pl-4" : ""}><a href={`#${t.id}`} className="text-ink-soft transition hover:text-rose-700">{t.text}</a></li>)}</ol>
              </nav>
            )}
            {services.length > 0 && (
              <div className="rounded-[1.5rem] border border-line bg-blush-50 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-rose-700">Services mentioned</p>
                <ul className="space-y-2 text-sm">{services.map((s) => <li key={s.slug}><Link href={urls.service(s.slug)} className="text-plum-800 underline-offset-4 hover:underline">{s.title}</Link></li>)}</ul>
                {cities.length > 0 && <p className="mt-4 border-t border-line pt-3 text-sm text-ink-soft">Available in {cities.map((c, i) => <span key={c.slug}>{i > 0 && ", "}<Link className="text-rose-700 underline underline-offset-4" href={urls.cityHub(c.slug)}>{c.name}</Link></span>)}.</p>}
              </div>
            )}
          </aside>
        </Container>
      </Section>

      {more.length > 0 && (
        <Section tone="blush">
          <Container>
            <SectionHeading eyebrow="Keep reading" title="Related articles" />
            <Carousel dots label="Related articles" itemClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3">
              {more.map((m) => {
                const full = byslug.get(m.slug);
                return (
                  <Link key={m.slug} href={urls.blog(m.slug)} className="group block h-full">
                    <Card className="h-full overflow-hidden"><div className="relative aspect-[16/10]"><Photo src={realImage(keys, full?.image)} alt={m.title} kind="blog" seedKey={m.slug} sizes="(min-width: 1024px) 33vw, 85vw" /></div><div className="p-5"><h3 className="line-clamp-2 group-hover:text-rose-700">{m.title}</h3></div></Card>
                  </Link>
                );
              })}
            </Carousel>
          </Container>
        </Section>
      )}

      <section className="section-dark py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Book now</p><h2 className="mt-3 text-ivory">Ready to book?</h2><div className="gold-rule my-5 w-24" /><p className="max-w-md text-lg text-blush-100">Tell us what you need and where, and we will confirm an artist near you.</p></div>
          <BookingForm cities={cities} sourcePath={path} enquiry heading="Ready to book?" />
        </Container>
      </section>
    </>
  );
}
