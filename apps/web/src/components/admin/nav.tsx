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
  CalendarDays,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@herrglow/ui";
import { Logo } from "@/components/brand/Logo";

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  analytics: BarChart3,
  leads: CalendarCheck2,
  calendar: CalendarDays,
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
        <div className="mb-6 flex items-center justify-between border-b border-white/12 pb-5">
          <div>
            <Logo variant="dark" size="sm" withLink={false} showSubtitle={false} />
            <p className="mt-1.5 text-[10px] font-semibold tracking-widest uppercase text-gold-300 pl-0.5">
              Operations &amp; Dispatch
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Live Website"
            className="flex items-center gap-1.5 rounded-lg border border-gold-400/30 bg-gold-400/10 px-2.5 py-1 text-xs font-medium text-gold-200 transition hover:bg-gold-400/20 hover:text-gold-100 hover:border-gold-400/50"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-6" aria-label="Admin Navigation">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gold-300/90">
                {group.title}
              </p>
              <ul className="mt-2 space-y-1">
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
                          "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-950/40 ring-1 ring-white/20 font-semibold"
                            : "text-blush-100/90 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive
                                ? "text-gold-200"
                                : "text-rose-300/80 group-hover:text-gold-300"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.hint && (
                          <span
                            className={cn(
                              "ml-2 truncate text-[11px] rounded-full px-2 py-0.5",
                              isActive ? "bg-white/20 text-white" : "bg-white/5 text-blush-200"
                            )}
                          >
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
      <div className="mt-6 border-t border-white/12 pt-4">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {user.name || user.email.split("@")[0]}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-blush-200">
              <span className="rounded bg-gold-400/20 border border-gold-400/30 px-1.5 py-0.5 font-mono uppercase tracking-wider text-[10px] text-gold-300 font-semibold">
                {user.role}
              </span>
              <span className="truncate text-blush-200/80">{user.email}</span>
            </div>
          </div>
          <Link
            href="/admin/account"
            title="Account & Password"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-blush-200 transition hover:bg-white/15 hover:text-white"
            aria-label="Change Password"
          >
            <KeyRound className="h-4 w-4" />
          </Link>
        </div>

        <form action={signOutAction} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-medium text-blush-100 transition hover:bg-rose-600/30 hover:border-rose-400/50 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out of Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
}
