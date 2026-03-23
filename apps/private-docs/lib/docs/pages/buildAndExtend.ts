import type { DocsPageDefinition } from "../types";

export const workflowPage: DocsPageDefinition = {
  key: "workflow",
  href: "/docs/workflow",
  title: "Development Workflow",
  description: "Build & Extend",
  summary:
    "Use this page when you are tracing a feature, deciding where new code belongs, or checking which commands and validations to run before you close work.",
  intro: [
    "The fastest way to avoid architecture drift is to trace the current feature path before you start writing code.",
    "If a task feels like it needs changes in many layers at once, stop and verify whether one of those layers is owning too much or whether the capability boundary is wrong.",
  ],
  sections: [
    {
      id: "trace-a-feature",
      title: "How To Trace A Feature",
      bullets: [
        "Identify the surface first: web, admin, mobile, or AI/channel ingress.",
        "Find the thin entrypoint such as a page route, loader, action, or Convex controller.",
        "Locate the owning business layer such as `apps/web/server/**`, `convex/shared_logic/**`, or a zone-specific module.",
        "Confirm the ownership model before you change data access or state transitions.",
        "Check nearby tests, DTOs, and local READMEs before you widen the implementation.",
      ],
      visuals: [
        {
          src: "/handbook/dev-flow-clean.png",
          alt: "Development workflow diagram for the Anan repo.",
          title: "Development Flow",
          caption: "A good mental model for moving from surface entrypoints into the owning capability layer.",
        },
      ],
    },
    {
      id: "where-to-add-code",
      title: "Where To Add Code",
      table: {
        headers: ["Need", "Best location", "Why"],
        rows: [
          ["Web-only orchestration", "`apps/web/server/**`", "Keeps UI thin and contracts stable"],
          ["Shared backend rule", "`convex/shared_logic/**`", "Lets multiple surfaces reuse the same capability"],
          ["Owner-scoped backend access", "`convex/broker_zone/**` or `convex/red_zone/**`", "Matches org-scoped ownership"],
          ["Admin-only operational UI", "`apps/admin/admin_zone/**`", "Keeps admin behavior local to admin"],
          ["AI team, tool, or channel work", "`convex/ai_zone/**`", "Preserves orchestrator and ingress boundaries"],
        ],
      },
    },
    {
      id: "common-commands",
      title: "Common Commands",
      codeExamples: [
        {
          title: "Daily commands",
          language: "bash",
          code: [
            "pnpm install",
            "pnpm dev",
            "pnpm --filter web build",
            "pnpm --filter admin build",
            "pnpm typecheck",
            "pnpm test:once",
          ].join("\n"),
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/developer-system-guide.md",
      description: "Best repo-wide explanation of tracing, placement, and request flow.",
    },
    {
      path: "docs/handbook/README.md",
      description: "High-level reading order and repo-wide rules.",
    },
    {
      path: "docs/codebase-knowledge-base.md",
      description: "Supplemental context when the codebase feels unfamiliar.",
    },
  ],
  related: ["overview", "zones", "add-table"],
};

export const addTablePage: DocsPageDefinition = {
  key: "add-table",
  href: "/docs/add-table",
  title: "Recipe: Add a Convex Table",
  description: "Build & Extend",
  summary:
    "Tables are long-lived commitments. Decide ownership and indexes first, then wire safe entrypoints, tests, and surface-specific adapters around that schema.",
  intro: [
    "Adding a table is not just a schema change. It changes how ownership, access, querying, and UI contracts will work across the platform.",
    "If a new table does not have a clear owner and lookup strategy before implementation starts, that uncertainty usually turns into scans, naming drift, or duplicated write logic later.",
  ],
  sections: [
    {
      id: "steps",
      title: "Implementation Steps",
      bullets: [
        "Decide the ownership model before writing schema: auth user, broker org, developer org, or channel user.",
        "Add or extend a schema fragment under `convex/_core/schema/*` and wire it into `convex/schema.ts`.",
        "Create the owning backend entrypoints in `convex/shared_logic/**`, `convex/*_zone/**`, or `convex/admin_zone/**` depending on scope.",
        "Enforce access through existing identity and security helpers rather than guessing at the caller model.",
        "Add focused tests for ownership, state transitions, and index-backed lookup correctness.",
        "Expose the capability to surfaces through stable adapters and DTOs instead of binding UI directly to storage shape.",
      ],
    },
    {
      id: "file-map",
      title: "Typical File Map",
      codeExamples: [
        {
          title: "End-to-end placement",
          language: "text",
          code: [
            "convex/_core/schema/<domain>.ts",
            "convex/schema.ts",
            "convex/shared_logic/<capability>/* or convex/<zone>/*",
            "apps/web/server/infrastructure/convex/<domain>Repository.ts",
            "apps/web/server/contracts/<domain>.ts",
            "apps/web/server/domains/<domain>/service.ts",
          ].join("\n"),
        },
      ],
    },
    {
      id: "pitfalls",
      title: "Common Pitfalls",
      bullets: [
        "Forgetting indexes for the primary lookup paths.",
        "Mixing contract naming into schema storage fields too early.",
        "Letting multiple zones own writes to the same table without one clear capability boundary.",
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/recipes/add-table.md",
      description: "Canonical step-by-step checklist for new tables.",
    },
    {
      path: "docs/handbook/convex/schema.md",
      description: "Schema-level design and naming rules.",
    },
    {
      path: "docs/handbook/convex/best-practices.md",
      description: "Query and mutation guardrails once the table exists.",
    },
  ],
  related: ["data-and-contracts", "convex", "workflow"],
};

export const addWebDomainPage: DocsPageDefinition = {
  key: "add-web-domain",
  href: "/docs/add-web-domain",
  title: "Recipe: Add a Web Domain Service",
  description: "Build & Extend",
  summary:
    "Use the gateway pattern when web-specific orchestration, validation, and DTO normalization are part of the feature rather than an implementation afterthought.",
  intro: [
    "The web server layer exists so route handlers stay thin and the UI does not become the place where data shape, auth branching, and error policy all mix together.",
    "A new web capability usually needs a contract, a repository adapter, a domain service, and a thin route or server action that delegates to it.",
  ],
  sections: [
    {
      id: "layers",
      title: "Required Layers",
      table: {
        headers: ["Layer", "Typical path", "Responsibility"],
        rows: [
          ["Contract", "`apps/web/server/contracts/<domain>.ts`", "Validation and stable DTO naming"],
          ["Repository adapter", "`apps/web/server/infrastructure/convex/*`", "Generated Convex API access"],
          ["Domain service", "`apps/web/server/domains/<domain>/service.ts`", "Session-aware orchestration and data shaping"],
          ["Thin route", "`apps/web/app/api/<path>/route.ts`", "Parse, validate, delegate, return stable responses"],
        ],
      },
    },
    {
      id: "steps",
      title: "Implementation Steps",
      bullets: [
        "Define input and output schemas under `apps/web/server/contracts/**`.",
        "Add a Convex repository adapter so only one layer talks to the generated API.",
        "Add a domain service that resolves session or role and composes stable DTOs.",
        "Keep the route handler or server action thin and delegate quickly.",
        "If the feature needs SSR, call the same service from server components or server actions.",
      ],
    },
    {
      id: "pitfalls",
      title: "Common Pitfalls",
      bullets: [
        "Dropping a zod schema inside the route handler instead of the contracts layer.",
        "Returning raw Convex results straight to client code.",
        "Forgetting that user-specific responses often need careful caching rules.",
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/recipes/add-web-domain.md",
      description: "Canonical gateway-pattern recipe.",
    },
    {
      path: "docs/handbook/web/server-gateway.md",
      description: "Why the server gateway exists and how it should be used.",
    },
    {
      path: "docs/handbook/web/api-routes.md",
      description: "Route-handler discipline and API surface rules.",
    },
  ],
  related: ["web", "workflow", "data-and-contracts"],
};

export const addChannelPage: DocsPageDefinition = {
  key: "add-channel",
  href: "/docs/add-channel",
  title: "Recipe: Add a Channel",
  description: "Build & Extend",
  summary:
    "Channels are production ingress. Keep the edge thin, normalize payloads early, wire idempotency from the beginning, and delegate deeper behavior into stable backend services.",
  intro: [
    "A new channel should not invent a parallel architecture. Follow the channel folder contract and route all meaningful behavior through the existing AI and persistence layers.",
    "Webhook retries are normal. Design for them before the first message lands in production.",
  ],
  sections: [
    {
      id: "folder-contract",
      title: "Folder Contract",
      codeExamples: [
        {
          title: "Typical channel shape",
          language: "text",
          code: [
            "convex/ai_zone/channels/<channel>/api.ts",
            "convex/ai_zone/channels/<channel>/webhook.ts",
            "convex/ai_zone/channels/<channel>/actions.ts",
            "convex/ai_zone/channels/<channel>/service.ts",
          ].join("\n"),
        },
      ],
    },
    {
      id: "steps",
      title: "Implementation Steps",
      bullets: [
        "Create the channel folder and normalize vendor payloads into a shared internal event shape.",
        "Keep the webhook handler thin: validate, parse, dedupe, ensure identity context, delegate.",
        "Move vendor API calls into a transport service instead of embedding them in the webhook.",
        "Wire the new adapter into `convex/http.ts`.",
        "Add idempotency using vendor message ids or equivalent dedupe keys.",
      ],
    },
    {
      id: "pitfalls",
      title: "Common Pitfalls",
      bullets: [
        "Skipping dedupe and replying twice on webhook retries.",
        "Doing AI calls directly in the webhook handler.",
        "Logging raw request bodies or full prompt context carelessly.",
      ],
      callouts: [
        {
          title: "Ingress Safety",
          body: "The edge should validate, normalize, and delegate. It should not become the full application runtime.",
          tone: "warning",
        },
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/recipes/add-channel.md",
      description: "Canonical step-by-step channel recipe.",
    },
    {
      path: "docs/handbook/convex/channels.md",
      description: "Channel adapter blueprint and folder contract.",
    },
    {
      path: "convex/http.ts",
      description: "The HTTP router every new channel eventually needs to join.",
    },
  ],
  related: ["ai-and-channels", "security", "workflow"],
};

export const addAgentPage: DocsPageDefinition = {
  key: "add-agent",
  href: "/docs/add-agent",
  title: "Recipe: Add an AI Agent",
  description: "Build & Extend",
  summary:
    "Agents should extend the existing team-based orchestration system rather than bypass it. Choose the right team, reuse tools when possible, and register the new agent deliberately.",
  intro: [
    "The AI system already has an orchestration model, shared helpers, and team boundaries. Respecting that structure matters more than getting a new prompt file into the repo quickly.",
    "A new agent is usually the right move only when an existing team tool or policy cannot support the capability cleanly.",
  ],
  sections: [
    {
      id: "steps",
      title: "Implementation Steps",
      bullets: [
        "Choose the right public or workspace team before creating a new folder.",
        "Create the agent folder under `convex/ai_zone/agents/team_*/*` or `team_workspace_*/*`.",
        "Add or reuse tools under the owning team and keep access checks inside those tools.",
        "Register the agent in the appropriate orchestration config file so dispatch is explicit.",
        "Use shared error handling and tracking helpers instead of inventing bespoke wiring.",
        "Add tests where behavior is deterministic, especially around tools and access-sensitive logic.",
      ],
    },
    {
      id: "registration",
      title: "Key Registration Points",
      codeExamples: [
        {
          title: "Common orchestrator touchpoints",
          language: "text",
          code: [
            "convex/ai_zone/agents/anan/orchestrationConfig.ts",
            "convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts",
            "convex/ai_zone/agents/shared/*",
            "convex/ai_zone/agents/team_<team>/tools/*",
          ].join("\n"),
        },
      ],
    },
    {
      id: "pitfalls",
      title: "Common Pitfalls",
      bullets: [
        "Calling tools directly from the orchestrator instead of from the agent.",
        "Adding a tool that scans large tables without indexes or ownership guards.",
        "Logging full prompt context or user-sensitive data casually.",
      ],
    },
  ],
  deepSources: [
    {
      path: "docs/handbook/recipes/add-agent.md",
      description: "Canonical recipe for adding a new agent cleanly.",
    },
    {
      path: "docs/handbook/convex/ai-zone.md",
      description: "Broader AI runtime and orchestration context.",
    },
    {
      path: "convex/ai_zone/agents/README.md",
      description: "Current folder-level manifest for the agent system.",
    },
  ],
  related: ["ai-and-channels", "convex", "workflow"],
};

export const buildAndExtendPages = [
  workflowPage,
  addTablePage,
  addWebDomainPage,
  addChannelPage,
  addAgentPage,
] as const;
