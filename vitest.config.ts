import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./apps/web", import.meta.url)),
      "@convex": fileURLToPath(new URL("./convex/_generated", import.meta.url)),
    },
  },
  test: {
    include: [
      "convex/**/*.test.{ts,tsx}",
      "frontend/src/**/*.test.{ts,tsx}",
      "apps/web/**/*.test.{ts,tsx}",
      "web/**/*.test.{ts,tsx}",
    ],
    environment: "node",
    globals: false,
    testTimeout: 30_000,
    hookTimeout: 10_000,
  },
});
