import type { Metadata } from "next";

// The admin is never indexed (also blocked in robots.txt and by the proxy host rules).
export const metadata: Metadata = { title: "HerrGlow Admin", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ivory-deep/40">{children}</div>;
}
