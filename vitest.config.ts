import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["convex/**/*.test.{ts,tsx}", "dashboard/src/**/*.test.{ts,tsx}"],
    environment: "node",
    globals: false,
    testTimeout: 30_000,
    hookTimeout: 10_000,
  },
});
