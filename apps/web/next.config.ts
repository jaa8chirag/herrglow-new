import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@herrglow/db", "@herrglow/core", "@herrglow/ui"],
  serverExternalPackages: ["@prisma/client", "pg"],
  turbopack: {
    // Tailwind v4 loader (shipped by the Next.js scaffold)
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
