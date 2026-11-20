import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@herrglow/db", "@herrglow/core", "@herrglow/ui"],
  serverExternalPackages: ["@prisma/client", "pg", "bullmq", "ioredis", "nodemailer", "bcryptjs"],
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
  turbopack: {
    // Tailwind v4 loader (shipped by the Next.js scaffold)
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
