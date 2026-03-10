import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./web", import.meta.url)),
    },
  },
  test: {
    include: [
      "convex/**/*.test.{ts,tsx}",
      "frontend/src/**/*.test.{ts,tsx}",
      "web/**/*.test.{ts,tsx}",
    ],
    environment: "node",
    globals: false,
    testTimeout: 30_000,
    hookTimeout: 10_000,
  },
});
