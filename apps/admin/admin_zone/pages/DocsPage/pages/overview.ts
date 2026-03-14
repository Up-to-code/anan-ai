import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Admin needs a fast in-app index into the platform handbook without forcing developers to hunt across markdown files.
 * WHAT:  Defines the overview handbook page rendered at `/docs`.
 * HOW:   Summarizes reading order and points to the deep markdown handbook under `docs/handbook/**`.
 */
export const overviewPage: DocsPageDefinition = {
  key: "overview",
  eyebrow: "Docs overview",
  title: "Admin Internal Developer Handbook",
  summary: "A curated in-app mirror of the platform handbook, with deep docs living under `docs/handbook/**`.",
  intro: [
    "This section renders the internal handbook as real admin routes, so engineers can browse key rules and maps inside the console.",
    "The deep canonical handbook is markdown under `docs/handbook/**`. Treat these routes as the top 20% summary plus pointers.",
  ],
  sections: [
    {
      title: "What this handbook covers",
      bullets: [
        "The four runtime surfaces: web, admin, mobile, and Convex.",
        "Convex zones, ownership rules, and request flow across the system.",
        "Web gateway layering: contracts, domain services, and Convex repository adapters.",
        "AI orchestration plus channel adapters (WhatsApp reference).",
        "Practical workflow: where to add code and how to avoid architectural drift.",
      ],
    },
    {
      title: "Recommended reading order (in-app)",
      links: [
        { href: "/docs/architecture", label: "Architecture", description: "Surfaces, zones, request flow, and role model." },
        { href: "/docs/convex", label: "Convex", description: "Core backend mental model, schema/security, and zone rules." },
        { href: "/docs/security", label: "Security", description: "AuthZ checklists, ownership rules, and logical safety." },
        { href: "/docs/web-gateway", label: "Web Gateway", description: "How `apps/web/server/**` owns web-only orchestration and DTOs." },
        { href: "/docs/channels", label: "Channels", description: "WhatsApp pipeline and the channel folder contract." },
        { href: "/docs/data", label: "Data & Contracts", description: "Core entities, ownership fields, state fields, and contract boundaries." },
        { href: "/docs/ai-chatflow", label: "AI Chatflow", description: "Workspace assistant + channels + mobile assistant differences." },
        { href: "/docs/mobile", label: "Mobile", description: "Expo surface responsibilities, wiring, and DTO rules." },
        { href: "/docs/workflow", label: "Workflow", description: "Where to add code, common commands, and testing expectations." },
      ],
    },
    {
      title: "System map",
      codeBlock: {
        label: "High-level flow",
        code: [
          "web / admin / mobile / channel adapters",
          "           -> web/server gateways (when web-only) OR direct Convex endpoints",
          "           -> convex/_core + convex/shared_logic + zone modules",
          "           -> schema tables + real-time projections + assistant threads/messages + inbox/offers",
        ].join("\n"),
      },
    },
    {
      title: "Canonical reference files (repo)",
      codeBlock: {
        label: "Must-read references",
        code: [
          "ARCHITECTURE.md",
          "CONVEX_RULES.md",
          "docs/handbook/README.md",
          "docs/codebase-knowledge-base.md",
          "docs/developer-system-guide.md",
          "docs/llm-data-access-guide.md",
        ].join("\n"),
      },
    },
  ],
  related: ["architecture", "convex", "workflow"],
};
