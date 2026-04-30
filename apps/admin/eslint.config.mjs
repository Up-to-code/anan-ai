import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const API_ROUTE_BOUNDARY_PATTERNS = [
  {
    group: [
      "@/lib/convexApi",
      "@/server/infrastructure/convex/*",
      "convex/nextjs",
      "convex/_generated/*",
      "../convex/_generated/*",
    ],
    message:
      "API routes must stay thin. Call a server/domain module instead of importing Convex clients, generated APIs, or Convex infrastructure directly.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/api/**/*.{ts,tsx,mts}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: API_ROUTE_BOUNDARY_PATTERNS }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
