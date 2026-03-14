import type { DocsPageDefinition } from "../types";

/**
 * WHY:   AI behavior spans multiple surfaces (workspace assistant, channels, mobile assistant) and needs a shared map.
 * WHAT:  Defines the AI chatflow handbook page.
 * HOW:   Summarizes the assistant + channel + mobile assistant paths and their persistence touchpoints.
 */
export const aiChatflowPage: DocsPageDefinition = {
  key: "aiChatflow",
  eyebrow: "AI runtime map",
  title: "AI Chatflow",
  summary: "Workspace assistant, channels, mobile AI, persistence, and admin touchpoints.",
  intro: [
    "Not every AI-shaped feature in this repo uses the full multi-agent orchestrator.",
    "Treat workspace assistant, WhatsApp channel ingestion, and mobile assistant as related but distinct systems.",
  ],
  sections: [
    {
      title: "System flow",
      codeBlock: {
        label: "AI and chatflow overview",
        code: [
          "Workspace user -> ai_zone controller -> assistantService -> anan orchestrator -> assistantThreads/assistantMessages",
          "WhatsApp user -> http.ts -> channel adapter -> internal action -> reply via transport service",
          "Mobile buyer -> user_zone/mobile assistant -> typed cards -> optional orders handoff",
          "Admin -> knowledge + analytics + diagnostics (observability/control, not runtime ownership)",
        ].join("\n"),
      },
    },
    {
      title: "Current caveats",
      bullets: [
        "Knowledge retrieval is currently global rather than truly company-scoped (naming may imply otherwise).",
        "The mobile assistant contract currently has known drift between UI/hook/type layers (see audits).",
        "Assistant thread metadata such as mode/kind is soft enough to be patched over time; treat invariants explicitly.",
      ],
    },
    {
      title: "Read more (deep markdown)",
      codeBlock: {
        label: "Canonical deep references",
        code: [
          "docs/llm-data-access-guide.md",
          "docs/handbook/convex/ai-zone.md",
          "docs/handbook/convex/channels.md",
        ].join("\n"),
      },
    },
  ],
  related: ["channels", "convex", "workflow"],
};

