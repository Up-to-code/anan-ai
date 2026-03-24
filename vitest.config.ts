import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./apps/web", import.meta.url)),
      "@convex": fileURLToPath(new URL("./convex/_generated", import.meta.url)),
      "@anan/ag-ui": fileURLToPath(new URL("./packages/ag-ui/src/index.ts", import.meta.url)),
      "@anan/ag-ui/react": fileURLToPath(new URL("./packages/ag-ui/src/react/index.ts", import.meta.url)),
      "@anan/ag-ui/anan": fileURLToPath(new URL("./packages/ag-ui/src/anan/index.ts", import.meta.url)),
      react: fileURLToPath(new URL("./apps/web/node_modules/react", import.meta.url)),
      "react-dom": fileURLToPath(new URL("./apps/web/node_modules/react-dom", import.meta.url)),
      "lucide-react": fileURLToPath(new URL("./apps/web/node_modules/lucide-react", import.meta.url)),
      // Vitest/Vite ESM subpath import fix:
      // @convex-dev/auth imports `next/server`, but Next provides the file as `next/server.js`.
      "next/server": "next/server.js",
      // Next runtime guard module: throws when imported from client.
      // In unit tests we stub it to a no-op.
      "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    include: [
      "convex/**/*.test.{ts,tsx}",
      "frontend/src/**/*.test.{ts,tsx}",
      "apps/web/**/*.test.{ts,tsx}",
      "packages/**/*.test.{ts,tsx}",
      "web/**/*.test.{ts,tsx}",
    ],
    environment: "node",
    globals: false,
    testTimeout: 30_000,
    hookTimeout: 10_000,
    deps: {
      // Ensure Vite transforms this dependency so `resolve.alias` applies to its imports.
      // Without inlining, Node tries to resolve `next/server` directly and fails.
      inline: ["@convex-dev/auth"],
    },
  },
});
