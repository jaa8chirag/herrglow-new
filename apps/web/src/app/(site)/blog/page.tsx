import type { Metadata } from "next";
import { Suspense } from "react";
import { GridSkeleton } from "@/components/GridSkeleton";
import { getBlogs } from "@herrglow/core";
import { Container, Section } from "@herrglow/ui";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { PageHero } from "@/components/page/PageHero";
import { getMediaKeys } from "@/lib/data";
import { realImage } from "@/lib/media";
import { buildMetadata } from "@/lib/seo/metadata";
import { readingMinutes, topicOf } from "@/lib/toc";
import { prisma } from "@herrglow/db";

export const metadata: Metadata = buildMetadata({
  title: "Beauty Blog: Bridal, Skincare & Makeup Guides",
  description:
    "Guides from HerrGlow on bridal makeup, pre-bridal skincare timelines, hair and nail care, written to help you plan with confidence.",
  path: "/blog",
});

async function BlogGrid() {
  const [blogs, keys] = await Promise.all([getBlogs(), getMediaKeys()]);
  // reading time needs the body length: one light query
  const bodies = await prisma.blog.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, content: true },
  });
  const mins = new Map(bodies.map((b) => [b.slug, readingMinutes(b.content ?? "")]));
  const posts = blogs.map((b) => ({
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    image: realImage(keys, b.image),
    date: b.publishedAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    topic: topicOf(b.title),
    minutes: mins.get(b.slug) ?? 3,
  }));
  return (
    <Section className="py-4 sm:py-6">
      <Container>
        <BlogExplorer posts={posts} />
      </Container>
    </Section>
  );
}

export default function BlogIndex() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Blog", path: "/blog" }]}
        title="Beauty guides and tips"
        intro="Practical guides for brides and beauty lovers: timelines, skincare, hair, nails and festive looks."
      />
      <Suspense fallback={<GridSkeleton />}>
        <BlogGrid />
      </Suspense>
    </>
  );
}
