import { signOut } from "@/auth";
import { can, type Perm } from "@herrglow/core";
import { requireAdmin } from "@/lib/admin";
import { AdminSidebarNav, type NavGroupConfig } from "@/components/admin/nav";

interface RawNavGroup {
  title: string;
  items: {
    href: string;
    label: string;
    hint?: string;
    icon: string;
    perm?: Perm;
  }[];
}

const RAW_GROUPS: RawNavGroup[] = [
  {
    title: "Daily Operations",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/leads", label: "Bookings & Leads", icon: "leads", perm: "leads" },
      { href: "/admin/calendar", label: "Beautician Schedule", icon: "calendar", perm: "leads" },
      { href: "/admin/applications", label: "Artist Applications", icon: "applications", perm: "pros" },
    ],
  },
  {
    title: "Salon & Team",
    items: [
      { href: "/admin/pros", label: "Beauticians & Artists", icon: "pros", perm: "pros" },
      { href: "/admin/services", label: "Services & Pricing", icon: "services", perm: "catalog" },
      { href: "/admin/cities", label: "Service Cities & Areas", icon: "cities", perm: "cities" },
      { href: "/admin/media", label: "Photo & Media Library", icon: "media", perm: "media" },
    ],
  },
  {
    title: "Website & Content",
    items: [
      { href: "/admin/blogs", label: "Beauty Blog & Guides", icon: "blogs", perm: "blogs" },
      { href: "/admin/review", label: "Page Content Reviews", icon: "review", perm: "drafts" },
      { href: "/admin/seo", label: "Google SEO & Pages", icon: "seo", perm: "seo" },
      { href: "/admin/redirects", label: "URL Redirects", icon: "redirects", perm: "redirects" },
    ],
  },
  {
    title: "Business Settings",
    items: [
      { href: "/admin/settings", label: "Salon Settings & WhatsApp", icon: "settings", perm: "settings" },
      { href: "/admin/users", label: "Staff Login Accounts", icon: "users", perm: "users" },
    ],
  },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();

  const filteredGroups: NavGroupConfig[] = RAW_GROUPS.map((g) => ({
    title: g.title,
    items: g.items
      .filter((i) => !i.perm || can(me.role, i.perm))
      .map(({ href, label, hint, icon }) => ({ href, label, hint, icon })),
  })).filter((g) => g.items.length > 0);

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[265px_1fr] bg-[#fbf7f4]">
      <aside
        className="border-b border-[#2b0f24] bg-[#190618] p-5 text-[#f6e3e1] shadow-2xl lg:min-h-screen lg:border-b-0 lg:border-r"
        style={{ backgroundColor: "#190618" }}
      >
        <AdminSidebarNav
          groups={filteredGroups}
          user={{ email: me.email, name: me.name, role: me.role }}
          signOutAction={handleSignOut}
        />
      </aside>
      <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
