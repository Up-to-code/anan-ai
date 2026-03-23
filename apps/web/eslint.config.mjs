import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const SOURCE_FILES = ["**/*.{ts,tsx,mts}"];

const LEGACY_COMPONENT_PATTERNS = [
  {
    group: [
      "@/components/shared",
      "@/components/shared/*",
      "@/components/docs",
      "@/components/docs/*",
      "@/components/docs-ui/*",
      "@/components/auth/*",
      "@/components/oauth/*",
      "@/components/ai-elements/*",
      "@/components/vectors/*",
      "@/hooks/*",
      "@/server/broker_zone/*",
      "@/server/red_zone/*",
      "@/server/domains/workspace/organizations/service",
      "@/server/domains/workspace/organizationApiKeys/service",
    ],
    message:
      "Import from the owning zone or its canonical server/public entrypoint instead of deleted legacy roots.",
  },
];

const PRIVATE_PUBLIC_PATTERNS = [
  {
    group: ["@/app/(public)/_components/*"],
    message:
      "Public-zone internals are private. Use '@/app/(public)/public' or local relative imports inside the public zone.",
  },
  {
    group: ["@/app/(public)/docs/_components/*"],
    message:
      "Docs internals are private. Use '@/app/(public)/docs/public' or local relative imports inside the docs zone.",
  },
  {
    group: ["@/app/(public)/signin/_components/*"],
    message:
      "Signin internals are private to the signin zone. Use local relative imports inside signin.",
  },
  {
    group: ["@/app/oauth/authorize/_components/*"],
    message:
      "OAuth authorize internals are private to the oauth zone. Use local relative imports inside oauth authorize.",
  },
];

const PRIVATE_WORKSPACE_PATTERNS = [
  {
    group: [
      "@/app/(ws)/ws/_components/*",
      "@/app/(ws)/ws/_lib/*",
      "@/app/(ws)/ws/(overview)/*",
      "@/app/(ws)/ws/(zones)/*",
    ],
    message:
      "Workspace internals are private. Use '@/app/(ws)/ws/public' or local relative imports inside the workspace zone.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: SOURCE_FILES,
    rules: {
      "no-restricted-imports": ["error", { patterns: LEGACY_COMPONENT_PATTERNS }],
    },
  },
  {
    files: SOURCE_FILES,
    ignores: ["app/(public)/**/*", "app/oauth/authorize/**/*"],
    rules: {
      "no-restricted-imports": ["error", { patterns: PRIVATE_PUBLIC_PATTERNS }],
    },
  },
  {
    files: SOURCE_FILES,
    ignores: ["app/(ws)/ws/**/*"],
    rules: {
      "no-restricted-imports": ["error", { patterns: PRIVATE_WORKSPACE_PATTERNS }],
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
