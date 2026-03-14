import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Engineers need one consistent map of surfaces and zones before changing business logic.
 * WHAT:  Defines the architecture handbook page.
 * HOW:   Documents surfaces, backend zones, and typical request flow.
 */
export const architecturePage: DocsPageDefinition = {
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
  related: ["convex", "webGateway", "workflow"],
};

