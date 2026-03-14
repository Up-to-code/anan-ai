import type { DocsPageDefinition } from "../types";

/**
 * WHY:   The web app needs a stable server gateway layer to prevent scattered Convex calls and inconsistent contracts.
 * WHAT:  Defines the Web Gateway handbook page (curated mirror of `docs/handbook/web/**`).
 * HOW:   Summarizes `apps/web/server/**` layering, SSR discipline, and where to add new web-only orchestration.
 */
export const webGatewayPage: DocsPageDefinition = {
  key: "webGateway",
  eyebrow: "Web backend",
  title: "Web Gateway (`apps/web/server/**`)",
  summary: "The Next.js backend gateway for web-only orchestration, DTO contracts, auth resolution, and Convex repository adapters.",
  intro: [
    "The web gateway is not a second backend; it is a web-specific service boundary that keeps UI thin and contracts stable.",
    "API route handlers under `apps/web/app/api/**` must stay thin and delegate here.",
  ],
  sections: [
    {
      title: "Layering map",
      codeBlock: {
        label: "Gateway responsibilities",
        code: [
          "apps/web/server/auth         # session + role context",
          "apps/web/server/contracts    # DTOs + zod validation + stable error shapes",
          "apps/web/server/domains      # business orchestration per domain",
          "apps/web/server/infrastructure/convex # Convex repository adapters",
        ].join("\n"),
      },
    },
    {
      title: "SSR + performance rules (web)",
      bullets: [
        "Server components by default; client components only when hooks/events are required.",
        "Scope providers to workspace routes; keep public pages statically optimizable when possible.",
        "Use request-scoped caching for repeated session/org reads in the same request.",
        "Replace list-then-sum patterns with backend summary queries.",
      ],
    },
    {
      title: "Read more (deep markdown)",
      codeBlock: {
        label: "Canonical deep references",
        code: [
          "docs/handbook/web/README.md",
          "docs/handbook/web/app-router.md",
          "docs/handbook/web/server-gateway.md",
          "docs/handbook/web/ssr-performance.md",
          "docs/handbook/web/api-routes.md",
        ].join("\n"),
      },
    },
  ],
  related: ["architecture", "data", "workflow"],
};

