import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@herrglow/ui"],
  },
  // Docker/VPS: self-contained server bundle. The monorepo root is traced so workspace packages are included.
  output: "standalone",
  // lets a second build (e.g. for Lighthouse) run next to a live dev server without clobbering .next
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  transpilePackages: ["@herrglow/db", "@herrglow/core", "@herrglow/ui"],
  serverExternalPackages: ["@prisma/client", "pg", "bullmq", "ioredis", "nodemailer", "bcryptjs"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // public HTML is cacheable at the edge (Cloudflare). Admin, API and Next internals are excluded.
      {
        source: "/((?!admin|api|_next|design).*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
    ];
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [360, 640, 828, 1080, 1440, 1920],
    imageSizes: [96, 160, 256, 384],
    qualities: [75, 80],
  },
  turbopack: {
    // Tailwind v4 loader (shipped by the Next.js scaffold)
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
