import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { robotsMeta } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

// Defaults only; every page sets its own canonical/title/description via buildMetadata().
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  robots: robotsMeta(true),
};

// The inline script in <head> adds class "js" before hydration on purpose (reveals are only hidden when JS runs),
// so <html>'s className differs from the server output: suppressHydrationWarning is intended here.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} /></head>
      <body className="min-h-dvh overflow-x-hidden">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
