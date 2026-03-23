import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.resolve(import.meta.dirname, "../../"),
  turbopack: {
    root: path.resolve(import.meta.dirname, "../.."),
  },
  env: {
    NEXT_PUBLIC_CONVEX_URL:
      process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL ?? "",
  },
};

export default nextConfig;
