import type { DocsPageDefinition } from "../types";

export const convexPage: DocsPageDefinition = {
  key: "convex",
  href: "/docs/convex",
  title: "Convex",
  description: "Runtime Surface",
  summary:
    "Convex is the spine of the platform: schema, access policy, shared business logic, AI orchestration, channels, and real-time data all depend on it.",
  intro: [
    "Treat Convex as the single source of truth for persistence, identity, and shared backend behavior.",
    "When a feature is shared by multiple surfaces or fundamentally real-time, Convex usually owns the rule even if a specific UI is the first consumer.",
  ],
  sections: [
    {
      id: "entrypoints",
      title: "Key Entrypoints",
      bullets: [
        "`convex/schema.ts` composes the final schema from `_core/schema/*` fragments.",
        "`convex/http.ts` owns HTTP ingress such as health checks, auth routes, webhooks, and OAuth endpoints.",
        "`convex/_core/security/*` owns identity normalization and access policy helpers.",
        "`convex/shared_logic/*` owns shared capabilities such as market, inbox, properties, offers, agencies, and knowledge.",
        "`convex/ai_zone/*` owns assistant controllers, orchestration, agent teams, tools, and channels.",
      ],
    },
    {
      id: "where-to-change",
      title: "Where To Change Code",
      codeExamples: [
        {
          title: "Common placement choices",
          language: "text",
          code: [
            "new table or index -> convex/_core/schema/* + convex/schema.ts",
            "shared capability -> convex/shared_logic/<capability>/*",
            "workspace assistant behavior -> convex/ai_zone/services/* or agent teams",
            "owner-scoped backend access -> convex/broker_zone/* or convex/red_zone/*",
            "channel adapter -> convex/ai_zone/channels/<channel>/* + convex/http.ts",
          ].join("\n"),
        },
      ],
    },
    {
      id: "pitfalls",
      title: "Common Pitfalls",
      bullets: [
        "Using `collect()` or `take(N)` where correctness depends on a growing table.",
        "Putting business logic into `_core` instead of the owning capability layer.",
        "Solving shared behavior by duplicating it across zones instead of placing it in `shared_logic`.",
        "Letting webhook or channel edge handlers grow into non-idempotent controllers.",
      ],
      callouts: [
        {
          title: "Performance Rule",
          body: "Index-first queries and bounded pagination are not optional on growing tables.",
          tone: "warning",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/convex/README.md",
      description: "Primary backend mental model and runtime map.",
    },
    {
      path: "docs/handbook/convex/core.md",
      description: "Core runtime boundaries and responsibilities.",
    },
    {
      path: "docs/handbook/convex/best-practices.md",
      description: "Repo-aligned query, mutation, and schema guardrails.",
    },
    {
      path: "docs/handbook/convex/shared-logic.md",
      description: "How shared capabilities should be structured.",
    },
  ],
  related: ["zones", "data-and-contracts", "convex-review"],
};

export const webPage: DocsPageDefinition = {
  key: "web",
  href: "/docs/web",
  title: "Workspace + Public Web",
  description: "Runtime Surface",
  summary:
    "The web app is two systems in one: a fast public SSR-first plane and a personalized workspace plane. The main architectural question is which layer owns orchestration and data shaping.",
  intro: [
    "Use server components by default for content and SSR, and add client components only when hooks, local state, or browser-only behavior are required.",
    "For web-owned orchestration, use `apps/web/server/**` as the stable boundary between UI and backend infrastructure. For shared real-time capabilities, keep the actual rule in Convex.",
  ],
  sections: [
    {
      id: "two-planes",
      title: "Two Planes",
      table: {
        headers: ["Plane", "Goal", "Primary ownership"],
        rows: [
          ["Public", "Fast, low-JS, SEO-friendly pages", "`apps/web/app/(public)` and public-facing shared UI"],
          ["Workspace", "Personalized, dynamic, often real-time UX", "`apps/web/app/(ws)` plus `apps/web/server/**`"],
        ],
      },
    },
    {
      id: "where-code-goes",
      title: "Where Code Goes",
      bullets: [
        "`apps/web/app/**` contains App Router entrypoints and page-local orchestrators.",
        "`apps/web/server/contracts/**` owns validation and stable DTO boundaries.",
        "`apps/web/server/domains/**` owns web-specific orchestration and session-aware service logic.",
        "`apps/web/server/infrastructure/convex/**` owns generated Convex API calls for the web gateway.",
        "Truly shared or real-time backend rules belong in Convex, not in page JSX or ad hoc route handlers.",
      ],
    },
    {
      id: "realtime-exception",
      title: "Real-Time Exception",
      paragraphs: [
        "Most web data flows should go through the server gateway, but the workspace assistant and inbox intentionally use direct Convex React hooks where real-time subscriptions are the feature rather than an implementation detail.",
        "That exception should stay narrow: live streaming, subscriptions, and message-sync surfaces can subscribe directly, while DTO normalization, auth-aware web orchestration, and non-real-time fetch composition still belong in `apps/web/server/**`.",
      ],
      callouts: [
        {
          title: "Real-time exception",
          body: "Use direct Convex hooks only when live subscription behavior is intrinsic to the feature. Do not use them as a shortcut around the web gateway for ordinary data loading.",
          tone: "info",
        },
      ],
    },
    {
      id: "pitfalls",
      title: "Common Pitfalls",
      bullets: [
        "Turning whole pages into client components for a single hook or small motion effect.",
        "Returning raw Convex shapes to UI instead of stabilizing them in contracts and services.",
        "Removing default outlines or using `transition-all` without accessible focus and motion alternatives.",
      ],
      visuals: [
        {
          src: "/handbook/data-sync-flow.png",
          alt: "Real-time data synchronization flow across the system.",
          title: "Real-Time Sync",
          caption: "Helpful when deciding whether a feature truly needs direct subscriptions or can stay gateway-first.",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/web/README.md",
      description: "Web-specific mental model and ownership rules.",
    },
    {
      path: "docs/handbook/web/app-router.md",
      description: "App Router structure and component placement guidance.",
    },
    {
      path: "docs/handbook/web/server-gateway.md",
      description: "Gateway layering and why it exists.",
    },
    {
      path: "docs/handbook/web/ssr-performance.md",
      description: "SSR and provider-scoping performance guidance.",
    },
  ],
  related: ["architecture", "workflow", "web-review"],
};

export const adminPage: DocsPageDefinition = {
  key: "admin",
  href: "/docs/admin",
  title: "Admin",
  description: "Runtime Surface",
  summary:
    "The admin app is the operations console for the platform. It consumes backend projections, exposes platform controls, and carries a curated in-app docs mirror for engineers already inside the console.",
  intro: [
    "Admin should be thought of as a consumer of platform capabilities, not the owner of shared business logic.",
    "Most admin changes either refine `convex/admin_zone/**` projections or improve admin-only loaders and page orchestration inside `apps/admin/admin_zone/**`.",
  ],
  sections: [
    {
      id: "responsibilities",
      title: "What Admin Owns",
      bullets: [
        "Platform operations such as users, organizations, analytics, compliance, and diagnostics.",
        "Admin-specific projections and loaders rather than raw shared capability ownership.",
        "An in-app quick-reference docs surface that points back to deep handbook markdown.",
      ],
    },
    {
      id: "loading-model",
      title: "Admin Data Loading Model",
      bullets: [
        "`convex/admin_zone/**` exposes admin-facing read models and operational mutations.",
        "`apps/admin/admin_zone/api/**` and page modules map those projections into UI state.",
        "Admin pages should stay thin and lean on loaders and page-local orchestration rather than burying business logic in route files.",
      ],
    },
    {
      id: "docs-pattern",
      title: "Useful Precedent",
      paragraphs: [
        "The admin app already uses a typed in-app docs mirror rather than a markdown renderer. That pattern is the clearest precedent for what `apps/private-docs` is doing in this pass.",
        "The private handbook can borrow the taxonomy and reading order from admin docs without coupling the two runtimes together.",
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/admin/README.md",
      description: "Admin responsibilities and reading order.",
    },
    {
      path: "docs/handbook/admin/in-app-docs.md",
      description: "The clearest precedent for typed in-app docs without markdown rendering.",
    },
    {
      path: "apps/admin/admin_zone/pages/DocsPage/README.md",
      description: "Implementation shape of the admin handbook mirror.",
    },
  ],
  related: ["architecture", "workflow", "audit-overview"],
};

export const mobilePage: DocsPageDefinition = {
  key: "mobile",
  href: "/docs/mobile",
  title: "Mobile",
  description: "Runtime Surface",
  summary:
    "The mobile app is the buyer-facing surface today. It is smaller than web and admin, but it mixes real backend DTOs with some mock-fallback behavior, so changes there need extra care.",
  intro: [
    "Mobile is not just a UI wrapper around web behavior. It has its own feature folders, Convex wiring, and buyer-facing experience concerns.",
    "When changing mobile behavior, verify both the backend endpoint contract and the feature-layer DTO mapping so UI assumptions do not drift from live data.",
  ],
  sections: [
    {
      id: "main-layers",
      title: "Main Layers",
      bullets: [
        "`apps/mobile/app/**` contains Expo Router entrypoints.",
        "`apps/mobile/src/features/**` contains screen-level orchestration and feature flows.",
        "`apps/mobile/src/hooks/**` handles assistant and feed state.",
        "`convex/user_zone/mobile/**` exposes buyer-facing mobile endpoints and typed payloads.",
      ],
    },
    {
      id: "care-points",
      title: "Current Care Points",
      bullets: [
        "Some mobile flows still mix live backend DTOs and mock fallback behavior.",
        "Assistant contracts in mobile historically drift more easily than workspace contracts because the feature moves across UI, hook, and backend layers.",
        "Treat mobile DTO mapping as a deliberate layer rather than binding screens directly to raw Convex results.",
      ],
    },
    {
      id: "when-to-change",
      title: "When Mobile Should Own Logic",
      paragraphs: [
        "Mobile should own view composition, buyer-specific presentation, and app-specific UX orchestration.",
        "Shared search, assistant, or persistence rules still belong in the appropriate Convex capability or web-agnostic backend layer.",
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/mobile/README.md",
      description: "Mobile reading order and surface purpose.",
    },
    {
      path: "docs/handbook/mobile/architecture.md",
      description: "Mobile architecture details and file placement.",
    },
    {
      path: "docs/handbook/mobile/convex-wiring.md",
      description: "How mobile should wire into Convex and DTO mapping.",
    },
  ],
  related: ["architecture", "ai-and-channels", "workflow"],
};

export const aiAndChannelsPage: DocsPageDefinition = {
  key: "ai-and-channels",
  href: "/docs/ai-and-channels",
  title: "AI & Channels",
  description: "Runtime Surface",
  summary:
    "The AI runtime spans workspace assistant flows, external channel ingress, agent teams, and buyer-facing assistant paths. They are related systems, but they are not all the same system.",
  intro: [
    "Not every AI-shaped feature in this repo uses the full multi-agent orchestrator. Treat workspace assistant, WhatsApp ingestion, and mobile assistant as connected but distinct flows.",
    "The safest way to add new AI behavior is to start with the existing team structure, tool registries, and channel boundaries before inventing new entrypoints.",
  ],
  sections: [
    {
      id: "system-flow",
      title: "System Flow",
      codeExamples: [
        {
          title: "AI runtime overview",
          language: "text",
          code: [
            "workspace user -> ai_zone controller -> assistantService -> anan orchestrator -> assistantThreads/assistantMessages",
            "channel user -> convex/http.ts -> channel adapter -> internal action -> transport service reply",
            "mobile buyer -> user_zone/mobile assistant -> typed cards -> optional handoff or order path",
          ].join("\n"),
        },
      ],
    },
    {
      id: "agent-teams",
      title: "Agent Teams And Tools",
      bullets: [
        "`convex/ai_zone/agents/team_*` holds public-facing team agents and tools.",
        "`convex/ai_zone/agents/team_workspace_*` holds workspace-specific agent teams.",
        "Tools must enforce access and ownership just like any other backend read path.",
        "Orchestration config files, not ad hoc imports, decide which agents are reachable.",
      ],
    },
    {
      id: "channel-rules",
      title: "Channel Rules",
      bullets: [
        "Keep edge handlers thin and idempotent.",
        "Normalize vendor payloads before deeper orchestration.",
        "Route transport-specific API calls through a service layer.",
        "Avoid logging raw bodies or prompt context without a clear reason.",
      ],
      callouts: [
        {
          title: "Ingress Rule",
          body: "Never let a webhook handler become the place where prompt construction, tool access, and side effects all accumulate together.",
          tone: "warning",
        },
      ],
      visuals: [
        {
          src: "/handbook/system-architecture.png",
          alt: "System architecture diagram highlighting the AI orchestration context.",
          title: "AI Architecture Context",
          caption: "This is the best visual anchor when tracing assistant orchestration and channel ingress together.",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/convex/ai-zone.md",
      description: "Primary AI runtime and orchestration reference.",
    },
    {
      path: "docs/handbook/convex/channels.md",
      description: "Channel adapter rules and WhatsApp blueprint.",
    },
    {
      path: "docs/handbook/llm/data-access.md",
      description: "LLM-specific data access guidance for safe tool reads.",
    },
    {
      path: "docs/llm-data-access-guide.md",
      description: "Supplementary guide for current AI data-access patterns.",
    },
  ],
  related: ["convex", "add-agent", "add-channel"],
};

export const runtimeSurfacePages = [
  convexPage,
  webPage,
  adminPage,
  mobilePage,
  aiAndChannelsPage,
] as const;
