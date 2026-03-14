import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Developers need a practical guide for tracing features and placing code correctly across surfaces and zones.
 * WHAT:  Defines the development workflow handbook page.
 * HOW:   Documents feature tracing steps, placement rules, and common commands.
 */
export const workflowPage: DocsPageDefinition = {
  key: "workflow",
  eyebrow: "Contribution guide",
  title: "Development Workflow",
  summary: "Where to add code, common commands, and testing expectations.",
  intro: [
    "The fastest way to work safely in this repo is to identify the owning layer first and then change the narrowest layer that actually owns the rule.",
    "This page is intentionally practical: where to look, where to add code, and what current checks to keep in mind.",
  ],
  sections: [
    {
      title: "How to trace a feature",
      bullets: [
        "Identify the surface: web, admin, mobile, or AI/channel path.",
        "Find the thin entrypoint such as an App Router file, loader, or Convex controller.",
        "Find the owning business layer such as `apps/web/server/*`, `convex/shared_logic/*`, or a zone-specific module.",
        "Confirm the ownership model: auth user, broker org, developer org, or channel user.",
        "Check the relevant schema tables and any nearby tests before changing behavior.",
      ],
    },
    {
      title: "Where to add code",
      bullets: [
        "Use `apps/web/server/*` for web-only orchestration and DTO boundaries.",
        "Use `convex/shared_logic/*` for shared backend-owned rules.",
        "Use `convex/broker_zone/*` and `convex/red_zone/*` for owner-scoped backend access patterns.",
        "Use `apps/admin/admin_zone/api/*` and `apps/admin/admin_zone/pages/*` for admin-specific behavior.",
        "Use `convex/ai_zone/channels/*` for channel adapters and `convex/ai_zone/agents/*` for agents/tools.",
      ],
    },
    {
      title: "Common commands",
      codeBlock: {
        label: "Local development",
        code: [
          "pnpm install",
          "pnpm dev",
          "pnpm --dir web dev",
          "pnpm --dir admin dev",
          "pnpm --dir mobile dev",
          "pnpm --filter web build",
          "pnpm --filter admin build",
          "pnpm test:once",
        ].join("\n"),
      },
    },
    {
      title: "Read more (deep markdown)",
      codeBlock: {
        label: "Canonical deep references",
        code: [
          "docs/handbook/README.md",
          "docs/developer-system-guide.md",
          "docs/codebase-knowledge-base.md",
          "docs/logic-audit-2026-03-13.md",
        ].join("\n"),
      },
    },
  ],
  related: ["overview", "architecture", "convex"],
};

