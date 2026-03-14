import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Convex is the platform backbone and needs an in-app quick-reference for zones, schema/security, and performance rules.
 * WHAT:  Defines the Convex handbook page (curated mirror of `docs/handbook/convex/**`).
 * HOW:   Summarizes the Convex mental model and points to deep markdown chapters and `CONVEX_RULES.md`.
 */
export const convexPage: DocsPageDefinition = {
  key: "convex",
  eyebrow: "Backend core",
  title: "Convex (Schema, Security, Zones)",
  summary: "Convex is the primary backend runtime: schema, access policy, shared capabilities, AI orchestration, and channels.",
  intro: [
    "Treat Convex as the single source of truth for persistence, identity, access, and shared business logic.",
    "When in doubt about where behavior belongs, find the owning zone and change the narrowest layer that owns the rule.",
  ],
  sections: [
    {
      title: "Key rules (non-negotiable)",
      bullets: [
        "Zone boundaries are strict; do not deep-import across zones.",
        "Queries are index-first and paginated; no scans and no `take(N)` correctness traps.",
        "Prefer summary queries over list-then-reduce aggregations.",
        "HTTP handlers and webhooks stay thin and delegate to zone services/actions.",
        "Never guess identity/role; resolve explicitly and enforce ownership.",
      ],
    },
    {
      title: "Core entrypoints",
      bullets: [
        "`convex/schema.ts` composes the schema from `_core/schema/*` fragments.",
        "`convex/http.ts` wires HTTP ingress (health, WhatsApp webhook, OAuth).",
        "`convex/_core/security/*` owns identity normalization and access policy primitives.",
        "`convex/shared_logic/*` owns shared business capabilities (inbox/offers/properties/market).",
        "`convex/ai_zone/*` owns assistant orchestration and channel adapters.",
      ],
    },
    {
      title: "Read more (deep markdown)",
      codeBlock: {
        label: "Canonical deep references",
        code: [
          "CONVEX_RULES.md",
          "docs/handbook/convex/README.md",
          "docs/handbook/convex/core.md",
          "docs/handbook/convex/schema.md",
          "docs/handbook/convex/zones.md",
          "docs/handbook/convex/shared-logic.md",
        ].join("\n"),
      },
    },
  ],
  related: ["architecture", "channels", "data"],
};

