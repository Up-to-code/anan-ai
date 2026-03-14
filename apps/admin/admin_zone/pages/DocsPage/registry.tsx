import type { ReactNode } from "react";

export type DocsPageKey =
  | "overview"
  | "architecture"
  | "capabilities"
  | "ui"
  | "data"
  | "aiChatflow"
  | "workflow";

type DocsLinkItem = {
  href: string;
  label: string;
  description: string;
};

type DocsTable = {
  headers: string[];
  rows: string[][];
};

type DocsCallout = {
  title: string;
  body: string;
  tone?: "info" | "warn" | "success";
};

export type DocsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  callout?: DocsCallout;
  table?: DocsTable;
  codeBlock?: {
    label: string;
    code: string;
  };
  links?: DocsLinkItem[];
  note?: ReactNode;
};

export type DocsPageDefinition = {
  key: DocsPageKey;
  eyebrow?: string;
  title: string;
  summary: string;
  intro: string[];
  sections: DocsSection[];
  related: DocsPageKey[];
};

export const docsPageOrder: DocsPageKey[] = [
  "overview",
  "architecture",
  "capabilities",
  "ui",
  "data",
  "aiChatflow",
  "workflow",
];

export const docsPageMeta: Record<DocsPageKey, { href: string; label: string; description: string }> = {
  overview: {
    href: "/docs",
    label: "Overview",
    description: "Entry page, reading order, and what the handbook covers.",
  },
  architecture: {
    href: "/docs/architecture",
    label: "Architecture",
    description: "Surfaces, zones, request flow, and role model.",
  },
  capabilities: {
    href: "/docs/capabilities",
    label: "Capabilities",
    description: "Admin structure plus shared product capabilities and ownership.",
  },
  ui: {
    href: "/docs/ui",
    label: "UI Components",
    description: "Real reusable admin and workspace UI surfaces developers can access.",
  },
  data: {
    href: "/docs/data",
    label: "Data & Contracts",
    description: "Core entities, ownership fields, state fields, and contract boundaries.",
  },
  aiChatflow: {
    href: "/docs/ai-chatflow",
    label: "AI Chatflow",
    description: "Workspace assistant, channels, mobile AI, persistence, and admin touchpoints.",
  },
  workflow: {
    href: "/docs/workflow",
    label: "Workflow",
    description: "Where to add code, common commands, and testing expectations.",
  },
};

export const docsPages: Record<DocsPageKey, DocsPageDefinition> = {
  overview: {
    key: "overview",
    eyebrow: "Docs overview",
    title: "Admin Internal Developer Handbook",
    summary: "Use this section to understand the full Anan platform from inside the admin app.",
    intro: [
      "This section turns the internal handbook into real admin pages instead of standalone markdown files.",
      "The docs are written in English for internal developers, while the surrounding admin shell stays consistent with the rest of the console.",
    ],
    sections: [
      {
        title: "What this handbook covers",
        bullets: [
          "The four runtime surfaces: web, admin, mobile, and Convex.",
          "Zone ownership, request flow, and the current role model.",
          "Shared capabilities such as inbox, offers, market, properties, subscriptions, knowledge, and agencies.",
          "Real reusable UI surfaces developers can access today.",
          "AI and chatflow across workspace, WhatsApp, mobile, persistence, and admin monitoring.",
        ],
      },
      {
        title: "Recommended reading order",
        links: docsPageOrder.slice(1).map((key) => docsPageMeta[key]),
      },
      {
        title: "System map",
        codeBlock: {
          label: "High-level flow",
          code: [
            "web / admin / mobile / channel adapters",
            "           -> web/server or direct Convex entrypoints",
            "           -> convex/_core + convex/shared_logic + zone modules",
            "           -> schema tables, assistant threads, inbox, offers, knowledge, orders",
          ].join("\n"),
        },
      },
      {
        title: "Canonical reference files",
        paragraphs: [
          "The admin handbook is the primary in-app documentation surface. When you need the longer repo-wide references, use the root docs in the workspace rather than expecting them to be route-backed inside admin.",
        ],
        codeBlock: {
          label: "Root repo references",
          code: [
            "docs/codebase-knowledge-base.md",
            "docs/logic-audit-2026-03-13.md",
            "docs/developer-system-guide.md",
            "docs/llm-data-access-guide.md",
          ].join("\n"),
        },
      },
    ],
    related: ["architecture", "capabilities", "workflow"],
  },
  architecture: {
    key: "architecture",
    eyebrow: "System map",
    title: "Platform Architecture",
    summary: "Understand how the admin app fits into the wider platform and how requests move across layers.",
    intro: [
      "Anan is implemented as a multi-surface platform rather than a single frontend with a single API.",
      "The admin app is an operational entrypoint into the system, but the owned business logic is distributed across the web server layer and Convex zones.",
    ],
    sections: [
      {
        title: "Top-level surfaces",
        table: {
          headers: ["Surface", "Primary role", "Main ownership"],
          rows: [
            ["web", "Workspace + public site", "Next.js UI plus web/server gateway"],
            ["admin", "Operations console", "Admin pages, loaders, and Convex admin read models"],
            ["mobile", "Buyer feed app", "Expo UI plus mobile Convex endpoints"],
            ["convex", "Backend runtime", "Schema, auth, shared logic, AI orchestration, zone endpoints"],
          ],
        },
      },
      {
        title: "Backend zones",
        bullets: [
          "`convex/_core` owns schema, auth, identity normalization, and access policy.",
          "`convex/shared_logic` owns shared capabilities such as inbox, offers, properties, market, subscriptions, knowledge, and notifications.",
          "`convex/ai_zone` owns assistant endpoints, orchestration, agents, and channel adapters.",
          "`convex/user_zone` owns user-facing backend features, including mobile feed and mobile assistant endpoints.",
          "`convex/broker_zone` and `convex/red_zone` own owner-scoped low-level backend surfaces.",
          "`convex/admin_zone` owns admin-specific read models and operations.",
        ],
      },
      {
        title: "Request flow",
        codeBlock: {
          label: "Typical request path",
          code: [
            "web/app or admin/app route",
            "  -> page/module orchestrator",
            "  -> web/server or admin loader",
            "  -> Convex entrypoint or repository adapter",
            "  -> shared logic / zone service",
            "  -> schema tables",
          ].join("\n"),
        },
      },
      {
        title: "Role model and naming",
        paragraphs: [
          "The repo currently uses both `developer` and `RED` terminology. Storage still uses the `RED` table and `REDId`, while many access-policy and contract surfaces normalize that to `developer` or `redId`.",
          "When changing code, keep storage naming aligned with schema and normalize only at the surface that already expects it.",
        ],
        callout: {
          title: "Current-state rule",
          body: "Do not invent a third naming convention. Follow schema naming at storage boundaries and current surface naming at contract boundaries.",
          tone: "warn",
        },
      },
    ],
    related: ["capabilities", "data", "workflow"],
  },
  capabilities: {
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
          "Use `web/server/*` for web-specific orchestration and stable DTO boundaries.",
          "Use `admin/admin_zone/api/*` for admin-specific loading and server actions.",
          "Use `convex/shared_logic/*` for shared business rules across surfaces.",
          "Use `convex/broker_zone/*` or `convex/red_zone/*` for owner-scoped backend access patterns.",
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
    related: ["ui", "data", "workflow"],
  },
  ui: {
    key: "ui",
    eyebrow: "UI surface catalog",
    title: "UI Components",
    summary: "These are the real reusable UI surfaces developers can access in admin and related workspace code.",
    intro: [
      "The admin app has its own shared component surface, and it intentionally mirrors some of the naming and layout patterns used in the workspace.",
      "That similarity is helpful, but ownership still matters: admin primitives should stay the default UI layer for admin work.",
    ],
    sections: [
      {
        title: "Admin shared components",
        bullets: [
          "`AdminShell` for global admin chrome and sidebar navigation.",
          "`SectionScaffold` for route-backed section layout.",
          "`PageHeader`, `PageHero`, and `Section` for page framing.",
          "`WorkspacePanel`, `Card`, and `EmptyState` for content framing.",
          "`DataTable`, `JsonPreview`, and `FormField` for data and input surfaces.",
          "`StatCard`, `MetricGrid`, `StatusBadge`, and `InlineBarChart` for metrics and states.",
        ],
      },
      {
        title: "Workspace shared references",
        bullets: [
          "`web/components/shared/*` contains the workspace/public shared UI surface.",
          "`Sidebar/*` is the shared workspace navigation primitive.",
          "`WorkspacePanel`, `Card`, `PageHeader`, `PageHero`, `MetricGrid`, and `StatCard` closely mirror the admin naming model.",
        ],
      },
      {
        title: "AI / workspace presentation layer",
        paragraphs: [
          "`web/components/shared/ag-aui/*` contains a larger set of AI/workspace presentation components such as AI result cards, market blocks, property and offer action UIs, and orchestration-related presentation surfaces.",
        ],
        callout: {
          title: "Use with intent",
          body: "These `ag-aui` components are useful as references when documenting or tracing AI output, but they are not the default admin shared component layer.",
          tone: "info",
        },
      },
      {
        title: "When to choose each layer",
        table: {
          headers: ["Need", "Preferred layer", "Why"],
          rows: [
            ["Reusable admin page primitive", "admin/components/shared/*", "Owned admin surface and matching admin chrome"],
            ["One-off page composition", "Page-local component files", "Avoid premature promotion into shared layer"],
            ["Reference for cross-surface patterns", "web/components/shared/*", "Useful for alignment and comparison"],
            ["AI presentation reference", "web/components/shared/ag-aui/*", "Relevant when tracing structured AI UI output"],
          ],
        },
      },
    ],
    related: ["capabilities", "workflow", "aiChatflow"],
  },
  data: {
    key: "data",
    eyebrow: "Model and contracts",
    title: "Data Model & Contracts",
    summary: "Understand ownership fields, state fields, and the main contract boundaries before changing data flow.",
    intro: [
      "Ownership in Anan is not represented by one single id type. Different flows belong to auth users, organizations, channel users, or hybrids of those concepts.",
      "The most common mistakes in this repo happen when code treats `status`, `publicationState`, and ownership ids as interchangeable.",
    ],
    sections: [
      {
        title: "Core entities",
        bullets: [
          "`userProfiles`, `users`, `brokers`, `RED`, `organizationMemberships`, and `teamInvites` define people and organizations.",
          "`properties`, `offers`, `orders`, and `deals` define the core commercial lifecycle.",
          "`knowledgePages`, `assistantThreads`, `assistantMessages`, `knowledgeResearch`, and `searchLogs` support AI and research flows.",
          "`inboxConversations`, `inboxConversationParticipants`, `inboxMessages`, and `workspaceNotifications` support collaboration and operational awareness.",
        ],
      },
      {
        title: "Ownership fields",
        table: {
          headers: ["Ownership type", "Common fields", "Used for"],
          rows: [
            ["Auth-linked user", "authUserId, userId", "Sessions, assistant threads, inbox participants, notifications"],
            ["Organization owner", "brokerId, REDId", "Properties, subscriptions, ownership checks"],
            ["Offer sender / recipient", "fromBrokerId, fromREDId, toBrokerId, toREDId", "Offer targeting and response rights"],
            ["Channel user", "users table userId", "Non-auth / channel-linked user records"],
          ],
        },
      },
      {
        title: "State fields",
        paragraphs: [
          "`publicationState` controls visibility lifecycle such as draft, published, and archived.",
          "`status` controls business outcome lifecycle such as availability, pending, qualified, accepted, or rejected depending on the table.",
        ],
        callout: {
          title: "Important rule",
          body: "Do not collapse `publicationState` and `status` into one concept when implementing new behavior.",
          tone: "warn",
        },
      },
      {
        title: "Contract boundaries",
        bullets: [
          "`web/server/contracts/*` stabilizes shapes crossing between web UI and backend services.",
          "The admin app effectively treats `admin/admin_zone/api/*` plus `convex/admin_zone/*` as its contract boundary.",
          "The mobile surface relies on `convex/user_zone/mobile/contracts.ts` plus app-level mobile types.",
        ],
      },
      {
        title: "Current caveat: knowledge scope",
        paragraphs: [
          "The current assistant retrieval path reads from `knowledgePages` globally, even though some naming implies company-specific knowledge.",
        ],
      },
    ],
    related: ["architecture", "aiChatflow", "workflow"],
  },
  aiChatflow: {
    key: "aiChatflow",
    eyebrow: "Runtime map",
    title: "AI Chatflow",
    summary: "Anan has multiple AI-shaped flows, and they do not all use the same runtime or persistence path.",
    intro: [
      "The workspace assistant, WhatsApp channel path, and mobile assistant should be treated as related but distinct systems.",
      "Admin touches these flows through knowledge management, analytics, diagnostics, and activity visibility rather than by owning the AI runtime itself.",
    ],
    sections: [
      {
        title: "System flow",
        codeBlock: {
          label: "AI and chatflow overview",
          code: [
            "Workspace user -> assistant controller -> assistantService -> anan orchestrator -> assistantThreads/assistantMessages",
            "WhatsApp user -> channel adapter -> assistantService/orchestration path -> shared assistant persistence",
            "Mobile buyer -> mobile assistant endpoint -> property context + typed cards -> optional orders handoff",
            "Admin -> knowledge pages + diagnostics/analytics/activity -> visibility into AI-related operations",
          ].join("\n"),
        },
      },
      {
        title: "Workspace assistant",
        bullets: [
          "`convex/ai_zone/assistant.ts` stays thin and exposes public endpoints.",
          "`convex/ai_zone/services/assistantService.ts` resolves owner identity, latest thread, entitlement mode, and injected knowledge.",
          "`convex/ai_zone/agents/anan/*` owns orchestrator dispatch and team-agent execution.",
        ],
      },
      {
        title: "WhatsApp channel path",
        paragraphs: [
          "`convex/ai_zone/channels/whatsapp/*` handles channel-specific preprocessing and transport concerns, then feeds the shared AI runtime path.",
        ],
      },
      {
        title: "Mobile assistant",
        paragraphs: [
          "The mobile assistant is currently not the same as the shared orchestrated assistant flow. It uses property-aware deterministic logic and typed result cards in `convex/user_zone/mobile/assistant.ts`.",
          "Qualified handoff from the mobile assistant can write into `orders`.",
        ],
      },
      {
        title: "Persistence and admin touchpoints",
        bullets: [
          "`assistantThreads` and `assistantMessages` persist shared assistant exchanges.",
          "`knowledgePages` is managed from the admin knowledge page and feeds current assistant retrieval.",
          "Admin diagnostics, analytics, and activity views observe assistant-related and message-related operational data.",
        ],
      },
      {
        title: "Current caveats",
        bullets: [
          "Knowledge retrieval is currently global rather than truly company-scoped.",
          "The mobile assistant contract has known drift between UI and hook/type layers.",
          "Assistant thread metadata such as mode and kind is soft enough to be patched over time.",
        ],
      },
    ],
    related: ["data", "ui", "workflow"],
  },
  workflow: {
    key: "workflow",
    eyebrow: "Contribution guide",
    title: "Development Workflow",
    summary: "Use this page when tracing a feature, deciding where code belongs, or checking the current repo baseline.",
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
          "Find the owning business layer such as `web/server/*`, `convex/shared_logic/*`, or a zone-specific module.",
          "Confirm the ownership model: auth user, broker org, developer org, or channel user.",
          "Check the relevant schema tables and any nearby tests before changing behavior.",
        ],
      },
      {
        title: "Where to add code",
        bullets: [
          "Use `web/server/*` for web-only orchestration and DTO boundaries.",
          "Use `convex/shared_logic/*` for shared backend-owned rules.",
          "Use `convex/broker_zone/*` and `convex/red_zone/*` for owner-scoped backend access patterns.",
          "Use `admin/admin_zone/api/*` and `admin/admin_zone/pages/*` for admin-specific behavior.",
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
            "pnpm typecheck",
            "pnpm --dir admin typecheck",
            "pnpm --dir mobile typecheck",
          ].join("\n"),
        },
      },
      {
        title: "Current baseline",
        callout: {
          title: "Known check state",
          body: "Root typecheck currently passes. Admin typecheck currently fails due to a React type-version mismatch, and mobile typecheck currently fails due to assistant contract drift.",
          tone: "warn",
        },
      },
      {
        title: "Testing expectations",
        bullets: [
          "Prioritize tests for ownership checks, status transitions, unread counters, assistant thread behavior, and admin identity merge behavior.",
          "Existing useful coverage already exists around inbox behavior, market aggregation, property-search helpers, and selected admin/web server paths.",
          "Keep known baseline failures documented, but do not hide new regressions behind them.",
        ],
      },
    ],
    related: ["capabilities", "data", "aiChatflow"],
  },
};

/**
 * WHY:   Docs routes need one typed way to resolve page metadata and content from a stable key.
 * WHAT:  Returns the docs page definition for the requested page key.
 * HOW:   Reads from the in-memory registry declared in this module.
 */
export function getDocsPage(pageKey: DocsPageKey) {
  return docsPages[pageKey];
}

/**
 * WHY:   The docs experience should support linear reading and contextual navigation between handbook pages.
 * WHAT:  Resolves the previous and next page keys for a given docs page.
 * HOW:   Uses the shared ordered page list declared in this registry.
 */
export function getDocsPageSiblings(pageKey: DocsPageKey) {
  const currentIndex = docsPageOrder.indexOf(pageKey);

  return {
    previousPageKey: currentIndex > 0 ? docsPageOrder[currentIndex - 1] : undefined,
    nextPageKey: currentIndex >= 0 && currentIndex < docsPageOrder.length - 1 ? docsPageOrder[currentIndex + 1] : undefined,
  };
}

/**
 * WHY:   The docs sidebar and in-page navigation need stable ids that do not depend on duplicated component logic.
 * WHAT:  Generates the anchor id for a docs section heading.
 * HOW:   Normalizes the title into a kebab-case slug.
 */
export function getDocsSectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
