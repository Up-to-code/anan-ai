import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Mobile has different constraints (Expo runtime, media-heavy UI, partial backend setup) and needs explicit contract rules.
 * WHAT:  Defines the Mobile handbook page (curated mirror of `docs/handbook/mobile/**`).
 * HOW:   Summarizes the mobile architecture and wiring rules and points to deep markdown chapters.
 */
export const mobilePage: DocsPageDefinition = {
  key: "mobile",
  eyebrow: "Buyer app",
  title: "Mobile (Expo Surface)",
  summary: "How the buyer-facing Expo app is structured and how it consumes Convex safely.",
  intro: [
    "Mobile should keep route files thin, orchestrate screens in feature modules, and keep backend assumptions explicit.",
    "Do not let mock fallback behavior silently mix into production data paths.",
  ],
  sections: [
    {
      title: "Architecture shape",
      codeBlock: {
        label: "Flow",
        code: [
          "apps/mobile/app/* (Expo Router)",
          "  -> apps/mobile/src/features/* (screen orchestration)",
          "  -> apps/mobile/src/hooks/* (data + assistant state)",
          "  -> convex/user_zone/mobile/* (backend endpoints)",
        ].join("\n"),
      },
    },
    {
      title: "Rules",
      bullets: [
        "Do not render raw Convex rows; map into mobile DTOs in hooks.",
        "Treat mock mode as explicit; do not merge mock-only fields into live backend items.",
        "Keep assistant contracts stable across hooks and UI overlays.",
      ],
    },
    {
      title: "Read more (deep markdown)",
      codeBlock: {
        label: "Canonical deep references",
        code: [
          "docs/handbook/mobile/README.md",
          "docs/handbook/mobile/architecture.md",
          "docs/handbook/mobile/convex-wiring.md",
        ].join("\n"),
      },
    },
  ],
  related: ["data", "aiChatflow", "workflow"],
};

