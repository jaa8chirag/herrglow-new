import Link from "next/link";
import { signOut } from "@/auth";
import { can, type Perm } from "@herrglow/core";
import { requireAdmin } from "@/lib/admin";

const NAV: { href: string; label: string; perm?: Perm }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads", perm: "leads" },
  { href: "/admin/review", label: "Review queue", perm: "drafts" },
  { href: "/admin/pros", label: "Artists", perm: "pros" },
  { href: "/admin/services", label: "Services", perm: "catalog" },
  { href: "/admin/cities", label: "Cities & areas", perm: "cities" },
  { href: "/admin/seo", label: "SEO manager", perm: "seo" },
  { href: "/admin/redirects", label: "Redirects", perm: "redirects" },
  { href: "/admin/blogs", label: "Blogs", perm: "blogs" },
  { href: "/admin/media", label: "Media", perm: "media" },
  { href: "/admin/settings", label: "Settings", perm: "settings" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[230px_1fr]">
      <aside className="border-b border-line bg-plum-900 p-4 text-blush-100 lg:border-b-0 lg:border-r">
        <p className="mb-4 font-serif text-xl text-ivory">HerrGlow</p>
        <nav className="flex flex-wrap gap-1 lg:flex-col">
          {NAV.filter((n) => !n.perm || can(me.role, n.perm)).map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">{n.label}</Link>
          ))}
        </nav>
        <form className="mt-6" action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
          <p className="mb-2 truncate text-xs text-blush-300">{me.email} · {me.role.toLowerCase()}</p>
          <button className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10">Sign out</button>
        </form>
      </aside>
      <div className="min-w-0 p-5 sm:p-8">{children}</div>
    </div>
  );
}
