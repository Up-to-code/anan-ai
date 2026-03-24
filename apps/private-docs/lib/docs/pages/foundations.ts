import type { DocsPageDefinition } from "../types";

export const overviewPage: DocsPageDefinition = {
  key: "overview",
  href: "/docs/overview",
  title: "Anan Developer Handbook",
  description: "Foundations",
  summary:
    "Start here for the repo mental model, the recommended reading order, and the source files that explain how the whole codebase fits together.",
  intro: [
    "This private app is now the internal handbook shell for the Anan codebase. It is meant to help engineers orient quickly without losing the deeper markdown references that still live under `docs/handbook/**`.",
    "The fastest way to work safely in this repo is to understand the platform loop first, then find the owning surface, then change the narrowest layer that truly owns the rule.",
  ],
  sections: [
    {
      id: "what-you-get",
      title: "What This Handbook Covers",
      bullets: [
        "The platform architecture across web, admin, mobile, Convex, and channels.",
        "Zone boundaries, ownership rules, and where shared logic belongs.",
        "Runtime-surface guides for Convex, web, admin, mobile, and AI channels.",
        "Practical build recipes for adding tables, web domains, channels, and agents.",
        "An audit section that captures current drift, findings, and remediation priorities.",
      ],
    },
    {
      id: "reading-order",
      title: "Recommended Reading Order",
      links: [
        {
          href: "/docs/architecture",
          label: "Platform Architecture",
          description: "Understand the system loop, runtime surfaces, and request flow before touching code.",
        },
        {
          href: "/docs/zones",
          label: "Zones & Ownership",
          description: "See where code belongs across Convex, workspace zones, and shared capabilities.",
        },
        {
          href: "/docs/convex",
          label: "Convex",
          description: "Read the backend mental model, entrypoints, and performance rules.",
        },
        {
          href: "/docs/web",
          label: "Web",
          description: "Learn the Next.js layering model, the server gateway, and the real-time exceptions.",
        },
        {
          href: "/docs/workflow",
          label: "Workflow",
          description: "Use the day-to-day placement rules, commands, and tracing checklist when implementing changes.",
        },
        {
          href: "/docs/audit-overview",
          label: "Audit & Drift",
          description: "Review the current Convex, web, and documentation findings after you understand the intended model.",
        },
      ],
    },
    {
      id: "repo-map",
      title: "Repo Map At A Glance",
      table: {
        headers: ["Surface", "Why it exists", "Primary ownership"],
        rows: [
          ["`apps/web`", "Workspace UI plus public-facing web entrypoints", "Next.js routes, server gateway, shared UI"],
          ["`apps/admin`", "Operations console and internal quick-reference docs", "Admin loaders, projections, platform controls"],
          ["`apps/mobile`", "Buyer-facing mobile surface", "Expo features, mobile DTO mapping, Convex wiring"],
          ["`convex`", "Shared backend runtime", "Schema, access policy, shared logic, AI, channels, real-time"],
          ["`docs`", "Deep source documentation", "Canonical markdown chapters, audits, and diagrams"],
        ],
      },
    },
    {
      id: "visual-map",
      title: "Visual Map",
      visuals: [
        {
          src: "/handbook/platform-flow.png",
          alt: "Platform master flow showing how users, developers, brokers, AI, CRM, and services connect.",
          title: "Platform Master Flow",
          caption: "Use this when you need the product-level loop before diving into code ownership.",
        },
        {
          src: "/handbook/monorepo-structure.png",
          alt: "Monorepo structure diagram for the Anan codebase.",
          title: "Monorepo Structure",
          caption: "This helps new contributors map the repo’s major surfaces before opening individual folders.",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/README.md",
      description: "The developer-bible style entrypoint and the highest-level reading order.",
    },
    {
      path: "docs/developer-system-guide.md",
      description: "The clearest repo-wide explanation of surfaces, request flow, and placement rules.",
    },
    {
      path: "docs/codebase-knowledge-base.md",
      description: "Supporting knowledge base for the current codebase shape and concepts.",
    },
  ],
  related: ["architecture", "zones", "workflow"],
};

export const architecturePage: DocsPageDefinition = {
  key: "architecture",
  href: "/docs/architecture",
  title: "Platform Architecture",
  description: "Foundations",
  summary:
    "Anan is a multi-surface platform, not a single frontend with a simple API. Most safe code changes start by finding the right runtime surface and owning layer first.",
  intro: [
    "The architecture is easiest to understand as a loop: a surface receives input, delegates to its owning layer, Convex resolves identity and policy, a capability runs, and the surface renders the result back to a user.",
    "If a change crosses too many layers at once, that is usually a sign the ownership boundary is unclear or the implementation is in the wrong place.",
  ],
  sections: [
    {
      id: "system-loop",
      title: "The System Loop",
      visuals: [
        {
          src: "/handbook/platform-flow.png",
          alt: "Platform flow diagram for the Anan system loop.",
          title: "Platform Flow",
          caption: "The product loop spans users, brokers, developers, AI, and downstream sales tooling.",
        },
        {
          src: "/handbook/system-architecture.png",
          alt: "System architecture diagram for the Anan platform.",
          title: "System Architecture",
          caption: "The deeper architecture view connects surfaces to backend capabilities and orchestration.",
        },
      ],
    },
    {
      id: "runtime-surfaces",
      title: "Top-Level Runtime Surfaces",
      table: {
        headers: ["Surface", "Primary role", "Typical first stop"],
        rows: [
          ["Web", "Workspace + public site", "`apps/web/app/**` and `apps/web/server/**`"],
          ["Admin", "Operations console and internal tooling", "`apps/admin/app/**` and `apps/admin/admin_zone/**`"],
          ["Mobile", "Buyer app", "`apps/mobile/app/**` and `apps/mobile/src/features/**`"],
          ["Convex", "Backend runtime and real-time data", "`convex/**`"],
          ["Channels", "External ingress such as WhatsApp", "`convex/ai_zone/channels/**` and `convex/http.ts`"],
        ],
      },
    },
    {
      id: "request-flow",
      title: "Typical Request Flow",
      codeExamples: [
        {
          title: "Generalized request path",
          language: "text",
          code: [
            "surface route or channel webhook",
            "  -> thin entrypoint",
            "  -> owning server/domain layer or direct Convex endpoint",
            "  -> shared capability or owner zone",
            "  -> schema tables + side effects + projections",
            "  -> typed result back to the surface",
          ].join("\n"),
        },
      ],
    },
    {
      id: "role-model",
      title: "Role Model And Naming",
      paragraphs: [
        "The repo currently uses both `developer` and `RED` terminology. Storage still uses the `RED` table and `REDId`, while many access-policy and web contract surfaces normalize that to `developer` or `redId`.",
        "Keep storage naming aligned with schema and normalize only at explicit contract boundaries. Do not invent a third naming style.",
      ],
      callouts: [
        {
          title: "Naming Rule",
          body: "Schema storage names stay aligned to the data model; user-facing contracts can normalize naming only at stable boundaries.",
          tone: "warning",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/README.md",
      description: "Repo-wide architecture framing and the cross-surface reading order.",
    },
    {
      path: "docs/developer-system-guide.md",
      description: "Concrete request-flow, role-model, and placement guidance for day-to-day work.",
    },
    {
      path: "docs/assets/platform-flow.png",
      description: "Primary visual for the platform loop.",
    },
    {
      path: "docs/assets/system-architecture.png",
      description: "Primary visual for the deeper system architecture.",
    },
  ],
  related: ["zones", "convex", "web"],
};

export const zonesPage: DocsPageDefinition = {
  key: "zones",
  href: "/docs/zones",
  title: "Zones & Ownership",
  description: "Foundations",
  summary:
    "The repo uses strict zone ownership so features can evolve without cross-surface drift. The main discipline is to change the narrowest layer that owns the rule.",
  intro: [
    "Zone boundaries are especially important in Anan because the same business capabilities are consumed by multiple surfaces and audiences.",
    "Most architectural regressions happen when shared rules are duplicated in a surface layer or when one zone deep-imports another zone’s internals instead of using a stable boundary.",
  ],
  sections: [
    {
      id: "zone-map",
      title: "Platform Zone Map",
      table: {
        headers: ["Platform concept", "Frontend zone", "Backend zone", "Primary responsibilities"],
        rows: [
          ["Admin / platform ops", "`apps/admin`", "`convex/admin_zone`", "Users, organizations, analytics, compliance, internal tooling"],
          ["Broker workspace", "`apps/web/app/(ws)`", "`convex/broker_zone`", "Broker-facing overview, owner-scoped data access, offers, CRM"],
          ["Developer workspace", "`apps/web/app/(ws)`", "`convex/red_zone`", "Developer-facing overview, projects, broker management"],
          ["Buyer / user", "`apps/mobile` and channels", "`convex/user_zone`", "Buyer-facing endpoints, feed, mobile assistant"],
          ["AI / assistant", "Workspace surfaces + channels", "`convex/ai_zone`", "Assistant orchestration, agent teams, channels, tool access"],
          ["Shared capability layer", "`apps/web/server` when web-owned", "`convex/shared_logic`", "Properties, offers, market, inbox, agencies, knowledge"],
          ["Public / auth", "`apps/web/app/(public)`", "`convex/public_zone`", "Landing, auth-adjacent flows, public-facing access"],
          ["Core infrastructure", "N/A", "`convex/_core`", "Schema, auth, identity normalization, access policy, HTTP plumbing"],
        ],
      },
    },
    {
      id: "boundary-rules",
      title: "Boundary Rules",
      bullets: [
        "Do not deep-import across Convex zones. Use the owning zone’s exported entrypoints or shared helpers.",
        "Keep route files and controllers thin. Business decisions belong in the owning service or capability layer.",
        "Use `apps/web/server/**` for web-only orchestration, but keep backend-owned shared rules in Convex.",
        "Check local `README.md` or `ZONE_README.md` files before adding new modules or public entrypoints.",
        "If a capability serves multiple audiences, default to `convex/shared_logic/**` unless a surface-specific gateway truly owns it.",
      ],
    },
    {
      id: "folder-map",
      title: "High-Signal Folder Map",
      codeExamples: [
        {
          title: "Core ownership landmarks",
          language: "text",
          code: [
            "convex/_core",
            "convex/shared_logic",
            "convex/ai_zone",
            "convex/admin_zone",
            "convex/broker_zone",
            "convex/red_zone",
            "convex/user_zone",
            "apps/web/app/(ws)",
            "apps/web/server",
            "apps/admin/admin_zone",
            "apps/mobile/src/features",
          ].join("\n"),
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/convex/zones.md",
      description: "The deepest written explanation of what belongs in each backend zone.",
    },
    {
      path: "convex/_core/ZONE_README.md",
      description: "Core runtime responsibilities and non-negotiable boundaries.",
    },
    {
      path: "convex/shared_logic/ZONE_README.md",
      description: "Shared capability rules and scope expectations.",
    },
    {
      path: "apps/web/app/(ws)/ws/(zones)/README.md",
      description: "Workspace zone organization from the web-side of the repo.",
    },
  ],
  related: ["architecture", "convex", "workflow"],
};

export const dataAndContractsPage: DocsPageDefinition = {
  key: "data-and-contracts",
  href: "/docs/data-and-contracts",
  title: "Data & Contracts",
  description: "Foundations",
  summary:
    "Ownership fields, lifecycle state, and contract boundaries are where a lot of subtle bugs come from in this repo. Treat them as first-class design decisions, not implementation details.",
  intro: [
    "Anan is multi-surface, multi-role, and partly channel-driven, so there is no single universal ownership id that explains every record.",
    "The most common mistakes happen when new code treats `status`, `publicationState`, `authUserId`, `brokerId`, and `REDId` as interchangeable concepts.",
  ],
  sections: [
    {
      id: "core-entities",
      title: "Core Entities",
      bullets: [
        "`userProfiles`, `users`, `brokers`, `RED`, `tenantOrgLinks`, and the tenant components define people and organizations.",
        "`properties`, `offers`, `orders`, and `deals` define the commercial lifecycle.",
        "`knowledgePages`, `assistantThreads`, `assistantMessages`, `knowledgeResearch`, and `searchLogs` support AI and research flows.",
        "`inboxConversations`, `inboxConversationParticipants`, `inboxMessages`, and `workspaceNotifications` support collaboration and operational awareness.",
      ],
    },
    {
      id: "ownership-fields",
      title: "Ownership Fields",
      table: {
        headers: ["Ownership type", "Common fields", "Used for"],
        rows: [
          ["Auth-linked user", "`authUserId`, `userId`", "Sessions, assistant threads, participants, notifications"],
          ["Organization owner", "`brokerId`, `REDId`", "Properties, subscriptions, org-scoped access checks"],
          ["Offer sender / recipient", "`fromBrokerId`, `toBrokerId`, `fromREDId`, `toREDId`", "Offer targeting and action rights"],
          ["Channel user", "`userId` in channel or user records", "WhatsApp or buyer-linked identity outside the web session model"],
        ],
      },
    },
    {
      id: "state-fields",
      title: "State Fields",
      paragraphs: [
        "`publicationState` generally controls visibility lifecycle such as draft, published, or archived.",
        "`status` generally controls business lifecycle such as active, pending, qualified, accepted, rejected, or availability-specific states.",
      ],
      callouts: [
        {
          title: "Lifecycle Rule",
          body: "Do not collapse `publicationState` and `status` into one concept when adding new behavior or filters.",
          tone: "warning",
        },
      ],
    },
    {
      id: "contract-boundaries",
      title: "Contract Boundaries",
      bullets: [
        "`apps/web/server/contracts/**` stabilizes DTOs and naming as data moves between web UI and backend services.",
        "Admin consumes `convex/admin_zone/**` projections and maps them into admin page state through admin loaders.",
        "Mobile should map Convex projections into mobile DTOs instead of binding screens directly to raw DB shapes.",
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/codebase-knowledge-base.md",
      description: "Broader entity and codebase notes that fill in the current-state model.",
    },
    {
      path: "docs/handbook/glossary.md",
      description: "Glossary for role names, terms, and cross-surface vocabulary.",
    },
    {
      path: "docs/handbook/recipes/add-table.md",
      description: "End-to-end checklist for introducing new schema safely.",
    },
  ],
  related: ["zones", "security", "add-table"],
};

export const securityPage: DocsPageDefinition = {
  key: "security",
  href: "/docs/security",
  title: "Security & Authorization",
  description: "Foundations",
  summary:
    "Security in this repo is mostly about ownership clarity, explicit authorization, idempotent ingress, and tests that lock the invariants before drift accumulates.",
  intro: [
    "The most expensive security bugs here are usually logical bugs rather than cryptographic ones: wrong org ownership, wrong role normalization, or write paths that skip the intended gate.",
    "Whenever you add a new read or write path, ask who owns it, which identity model applies, and which existing helper or projection should enforce that rule.",
  ],
  sections: [
    {
      id: "core-rules",
      title: "Core Security Rules",
      bullets: [
        "Resolve identity explicitly. Never guess whether the caller is acting as a user, broker org, developer org, or channel user.",
        "Keep authorization close to the owning backend layer rather than duplicating checks in surface code.",
        "Treat webhooks and channel ingress as retryable and idempotent from day one.",
        "Prefer narrow projections and stable DTOs instead of exposing raw storage shapes broadly.",
      ],
    },
    {
      id: "authorization-flow",
      title: "Authorization Flow",
      visuals: [
        {
          src: "/handbook/auth-flow.png",
          alt: "Authentication and authorization flow diagram for the Anan platform.",
          title: "Auth Flow",
          caption: "Use this when tracing how user or session identity resolves into backend-owned authorization decisions.",
        },
      ],
    },
    {
      id: "testing-invariants",
      title: "Security Invariants To Lock In Tests",
      bullets: [
        "Ownership checks for org-scoped reads and writes.",
        "Role normalization around `RED` versus `developer` naming.",
        "Visibility rules around draft, published, and archived data.",
        "Webhook retry safety and dedupe behavior for channel ingress.",
      ],
      callouts: [
        {
          title: "Testing Bias",
          body: "For new high-risk behavior, add deterministic tests near the owning capability before wiring every surface consumer.",
          tone: "info",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/security/README.md",
      description: "Security reading order and the core concerns in this repo.",
    },
    {
      path: "docs/handbook/security/authorization.md",
      description: "Authorization-specific rules and guardrails.",
    },
    {
      path: "docs/handbook/security/test-invariants.md",
      description: "The test mindset for preserving logical safety.",
    },
    {
      path: "docs/handbook/security/web-authorization-flow.md",
      description: "The web-facing authorization flow and its expected boundaries.",
    },
  ],
  related: ["data-and-contracts", "convex", "add-channel"],
};

export const foundationsPages = [
  overviewPage,
  architecturePage,
  zonesPage,
  dataAndContractsPage,
  securityPage,
] as const;
