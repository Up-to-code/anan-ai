import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

const allowedDevOrigins = (
  process.env.ALLOWED_DEV_ORIGINS ??
  process.env.NEXT_ALLOWED_DEV_ORIGINS ??
  "192.168.1.75"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function readEnvValueFromFile(filePath: string, key: string) {
  if (!fs.existsSync(filePath)) return undefined;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const prefix = `${key}=`;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (!line.startsWith(prefix)) continue;
    return line.slice(prefix.length).trim();
  }
  return undefined;
}

function resolveConvexUrl() {
  if (process.env.NEXT_PUBLIC_CONVEX_URL?.trim()) return process.env.NEXT_PUBLIC_CONVEX_URL.trim();
  if (process.env.CONVEX_URL?.trim()) return process.env.CONVEX_URL.trim();

  const repoRoot = path.resolve(import.meta.dirname, "../../");
  const fromRootLocalEnv = readEnvValueFromFile(path.join(repoRoot, ".env.local"), "CONVEX_URL");
  if (fromRootLocalEnv) return fromRootLocalEnv;

  const fromRootEnv = readEnvValueFromFile(path.join(repoRoot, ".env"), "CONVEX_URL");
  if (fromRootEnv) return fromRootEnv;

  return "";
}

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins,
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.resolve(import.meta.dirname, "../../"),
  turbopack: {
    root: path.resolve(import.meta.dirname, "../.."),
  },
  env: {
    NEXT_PUBLIC_CONVEX_URL: resolveConvexUrl(),
  },
};

export default nextConfig;
