import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@herrglow/ui";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="!text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-5 shadow-soft", className)}>
      {title && <h2 className="mb-4 !text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-soft">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory-deep text-xs uppercase tracking-wide text-ink-soft">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="p-6 text-center text-sm text-ink-soft">{empty}</p>}
    </div>
  );
}

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;

export function Tabs({ items }: { items: { href: string; label: ReactNode; active?: boolean }[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map((t, i) => (
        <Link key={i} href={t.href} className={cn("rounded-full border px-4 py-1.5 text-sm", t.active ? "border-plum-700 bg-plum-700 text-ivory" : "border-line bg-white text-plum-800 hover:bg-blush-100")}>{t.label}</Link>
      ))}
    </div>
  );
}
