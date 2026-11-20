import Link from "next/link";
import type { Metadata } from "next";
import { getBlogs } from "@herrglow/core";
import { Card, Container, Section, SectionHeading } from "@herrglow/ui";
import { Breadcrumbs } from "@/components/parts";
import { buildMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Beauty Blog: Bridal, Skincare & Makeup Guides",
  description: "Guides from HerrGlow on bridal makeup, pre-bridal skincare timelines, hair and nail care, written to help you plan with confidence.",
  path: "/blog",
});

export default async function BlogIndex() {
  const blogs = await getBlogs();
  return (
    <Section>
      <Container>
        <Breadcrumbs items={[{ name: "Blog", path: "/blog" }]} />
        <SectionHeading as="h1" eyebrow="Journal" title="Beauty guides and tips" intro="Practical guides for brides and beauty lovers." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <Link key={b.slug} href={`/blog/${b.slug}`} className="group block">
              <Card className="h-full p-6">
                <p className="text-xs text-rose-700">{b.publishedAt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                <h2 className="mt-2 text-xl group-hover:text-rose-700">{b.title}</h2>
                {b.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{b.excerpt}</p>}
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
