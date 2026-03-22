import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(currentDir, "src"),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
