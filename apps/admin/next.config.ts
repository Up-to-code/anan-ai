import type { NextConfig } from "next";
import path from "node:path";
import * as nextEnvModule from "@next/env";

type EnvLoaderModule = {
  loadEnvConfig?: (dir: string) => void;
  default?: {
    loadEnvConfig?: (dir: string) => void;
  };
};

const loadEnvConfig =
  (nextEnvModule as EnvLoaderModule).loadEnvConfig ??
  (nextEnvModule as EnvLoaderModule).default?.loadEnvConfig;

loadEnvConfig?.(path.resolve(import.meta.dirname, ".."));

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.resolve(import.meta.dirname, ".."),
  },
  env: {
    NEXT_PUBLIC_CONVEX_URL:
      process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL ?? "",
  },
};

export default nextConfig;
