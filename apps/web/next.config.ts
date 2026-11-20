import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker/VPS: self-contained server bundle. The monorepo root is traced so workspace packages are included.
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  transpilePackages: ["@herrglow/db", "@herrglow/core", "@herrglow/ui"],
  serverExternalPackages: ["@prisma/client", "pg", "bullmq", "ioredis", "nodemailer", "bcryptjs"],
  async headers() {
    // public HTML is cacheable at the edge (Cloudflare). Admin, API and Next internals are excluded.
    return [{ source: "/((?!admin|api|_next|design).*)", headers: [{ key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" }] }];
  },
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
  turbopack: {
    // Tailwind v4 loader (shipped by the Next.js scaffold)
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
