import Link from "next/link";
import { listReviewQueue } from "@herrglow/core";
import { PageHeader, Table, Tabs, Td } from "@/components/admin/layout";
import { Pill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";

export default async function ReviewQueue(props: PageProps<"/admin/review">) {
  await requireAdmin("drafts");
  const sp = await props.searchParams;
  const kind = Array.isArray(sp.kind) ? sp.kind[0] : sp.kind;
  const all = await listReviewQueue();
  const count = (k: string) => all.filter((i) => i.kind === k).length;
  const items = kind ? all.filter((i) => i.kind === kind) : all;
  return (
    <>
      <PageHeader title="Review queue" subtitle="Drafts to publish and thin pages to fix. Pages become indexable automatically once they pass the quality gate." />
      <Tabs items={[
        { href: "/admin/review", label: `All (${all.length})`, active: !kind },
        { href: "?kind=service-city", label: `Service × city drafts (${count("service-city")})`, active: kind === "service-city" },
        { href: "?kind=service", label: `Thin services (${count("service")})`, active: kind === "service" },
        { href: "?kind=blog", label: `Thin blogs (${count("blog")})`, active: kind === "blog" },
      ]} />
      <Table head={["Item", "Type", "Why it is here", "Words", ""]} empty={items.length ? undefined : "Nothing to review."}>
        {items.map((i) => (
          <tr key={`${i.kind}:${i.id}`}>
            <Td className="font-medium">{i.title}</Td>
            <Td><Pill tone={i.kind === "service-city" ? "info" : "warn"}>{i.label}</Pill></Td>
            <Td className="text-ink-soft">{i.reason}</Td>
            <Td>{i.words}</Td>
            <Td><Link className="font-medium text-rose-700 underline" href={`/admin/review/${i.kind}/${encodeURIComponent(i.id)}`}>{i.kind === "service-city" ? "Review" : "Edit"}</Link></Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
