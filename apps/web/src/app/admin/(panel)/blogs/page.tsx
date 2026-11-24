import Link from "next/link";
import { listBlogsAdmin } from "@herrglow/core";
import { PageHeader, Table, Td } from "@/components/admin/layout";
import { Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export default async function BlogsPage() {
  await requireAdmin("blogs");
  const blogs = await listBlogsAdmin();
  return (
    <>
      <PageHeader
        title="Blogs"
        subtitle="Posts under 350 words stay noindex. Aim for 900+ words and at least 3 internal links."
        actions={
          <Link
            href="/admin/blogs/new"
            className="inline-flex min-h-10 items-center rounded-lg bg-plum-700 px-4 text-sm font-medium text-ivory hover:bg-plum-800"
          >
            New post
          </Link>
        }
      />
      <Table
        head={["Title", "Status", "Words", "Internal links", "Index", "Updated", ""]}
        empty={blogs.length ? undefined : "No posts yet."}
      >
        {blogs.map((b) => (
          <tr key={b.id}>
            <Td className="font-medium">
              {b.title}
              <br />
              <span className="text-xs font-normal text-ink-soft">/blog/{b.slug}</span>
            </Td>
            <Td>
              <Pill tone={b.status === "ACTIVE" ? "good" : "neutral"}>
                {b.status === "ACTIVE" ? "published" : "hidden"}
              </Pill>
            </Td>
            <Td>{b.words < 350 ? <Pill tone="warn">{b.words}</Pill> : b.words}</Td>
            <Td>
              {b.internalLinks < 3 ? <Pill tone="warn">{b.internalLinks}</Pill> : b.internalLinks}
            </Td>
            <Td>
              {b.indexable ? <Pill tone="good">indexable</Pill> : <Pill tone="warn">noindex</Pill>}
            </Td>
            <Td className="whitespace-nowrap text-ink-soft">
              {b.updatedAt.toLocaleDateString("en-IN")}
            </Td>
            <Td>
              <Link className="font-medium text-rose-700 underline" href={`/admin/blogs/${b.id}`}>
                Edit
              </Link>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
