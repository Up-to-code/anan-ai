import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Engineers need a capability ownership map to avoid duplicating logic and to know which layer should be changed.
 * WHAT:  Defines the capabilities handbook page.
 * HOW:   Summarizes admin structure, shared capabilities, and where logic should live.
 */
export const capabilitiesPage: DocsPageDefinition = {
  key: "capabilities",
  eyebrow: "Capability ownership",
  title: "Codebase Capabilities",
  summary: "Know which folders own which business responsibilities before adding new code.",
  intro: [
    "The admin app is organized around thin routes, page orchestrators, and Convex-backed read models.",
    "Most business logic belongs in shared capabilities or server-side orchestration layers rather than directly in route files.",
  ],
  sections: [
    {
      title: "Admin app structure",
      bullets: [
        "`admin/app/*` contains thin App Router entrypoints and layouts.",
        "`admin/admin_zone/api/*` contains admin-facing data loaders and write actions.",
        "`admin/admin_zone/pages/*` contains page orchestrators and page-local structure.",
        "`admin/components/shared/*` contains reusable admin UI primitives.",
        "`admin/lib/*` contains labels, navigation, formatting, and local support helpers.",
      ],
    },
    {
      title: "Shared product capabilities",
      table: {
        headers: ["Capability", "Main path", "What it owns"],
        rows: [
          ["Inbox", "convex/shared_logic/inbox.ts", "Conversations, participants, unread counts, offer-linked message bootstrap"],
          ["Offers", "convex/shared_logic/offers/*", "Sender rules, recipient discovery, projections, transitions, side effects"],
          ["Properties", "convex/shared_logic/properties/*", "Search helpers and property-domain backend helpers"],
          ["Market", "convex/shared_logic/market/*", "Market snapshot aggregation and geography normalization"],
          ["Agencies", "convex/shared_logic/agencies/*", "Organizations, memberships, invites, and directory projections"],
          ["Knowledge", "convex/shared_logic/knowledge/*", "Knowledge pages, assistant threads/messages, memory-related tables"],
        ],
      },
    },
    {
      title: "Where logic should live",
      bullets: [
        "Use `apps/web/server/*` for web-specific orchestration and stable DTO boundaries.",
        "Use `apps/admin/admin_zone/api/*` for admin-specific loading and server actions.",
        "Use `convex/shared_logic/*` for shared backend-owned rules across surfaces.",
        "Use `convex/broker_zone/*` and `convex/red_zone/*` for owner-scoped backend access patterns.",
        "Keep App Router entry files thin and free from large business branching.",
      ],
    },
    {
      title: "Current positioning of admin",
      paragraphs: [
        "Admin is best treated as a monitoring and control surface over shared capabilities, not as a separate backend or a duplicate source of truth.",
        "Many admin screens rely on joined operational projections built inside `convex/admin_zone/*`.",
      ],
    },
  ],
  related: ["convex", "data", "workflow"],
};

