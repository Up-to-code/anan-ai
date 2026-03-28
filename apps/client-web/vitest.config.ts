import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "@convex": fileURLToPath(new URL("../../convex/_generated", import.meta.url)),
      "next/server": "next/server.js",
      "server-only": fileURLToPath(new URL("../../test/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    include: ["client_zone/**/*.test.{ts,tsx}"],
    environment: "node",
    globals: false,
    testTimeout: 30_000,
    hookTimeout: 10_000,
  },
});
