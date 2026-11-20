import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { robotsMeta } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

// Defaults only; every page sets its own canonical/title/description via buildMetadata().
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  robots: robotsMeta(true),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${inter.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} /></head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
