"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck2,
  UserPlus,
  Users,
  Scissors,
  MapPin,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Globe,
  ArrowRight,
  Settings,
  ShieldCheck,
  ExternalLink,
  LogOut,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@herrglow/ui";
import { Logo } from "@/components/brand/Logo";

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  leads: CalendarCheck2,
  applications: UserPlus,
  pros: Users,
  services: Scissors,
  cities: MapPin,
  media: ImageIcon,
  blogs: FileText,
  review: Sparkles,
  seo: Globe,
  redirects: ArrowRight,
  settings: Settings,
  users: ShieldCheck,
};

export interface NavItemConfig {
  href: string;
  label: string;
  hint?: string;
  icon: string;
}

export interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

export function AdminSidebarNav({
  groups,
  user,
  signOutAction,
}: {
  groups: NavGroupConfig[];
  user: { email: string; name?: string | null; role: string };
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <Logo variant="dark" size="sm" withLink={false} showSubtitle={false} />
            <p className="mt-1 text-[10px] font-semibold tracking-wider uppercase text-gold-300/80 pl-0.5">
              Operations &amp; Dispatch
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Live Website"
            className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-blush-100 transition hover:bg-white/10 hover:text-white"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-5" aria-label="Admin Navigation">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-blush-300/70">
                {group.title}
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                          isActive
                            ? "bg-rose-500/20 text-white shadow-sm ring-1 ring-rose-400/30"
                            : "text-blush-100 hover:bg-white/8 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition",
                              isActive
                                ? "text-rose-400"
                                : "text-blush-300 group-hover:text-white"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.hint && (
                          <span className="ml-2 truncate text-[11px] text-blush-300/80 group-hover:text-blush-200">
                            {item.hint}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* User info & Sign out Footer */}
      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ivory">
              {user.name || user.email.split("@")[0]}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-blush-300">
              <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono uppercase tracking-wider text-[10px] text-rose-300">
                {user.role}
              </span>
              <span className="truncate">{user.email}</span>
            </div>
          </div>
          <Link
            href="/admin/account"
            title="Account & Password"
            className="rounded-lg p-1.5 text-blush-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Change Password"
          >
            <KeyRound className="h-4 w-4" />
          </Link>
        </div>

        <form action={signOutAction} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-medium text-blush-100 transition hover:bg-rose-500/20 hover:border-rose-400/40 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out of Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
}
