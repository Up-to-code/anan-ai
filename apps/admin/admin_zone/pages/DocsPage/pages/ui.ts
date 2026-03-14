import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Shared UI surfaces must be discoverable so engineers reuse them instead of rebuilding inconsistent primitives.
 * WHAT:  Defines the UI components handbook page.
 * HOW:   Catalogs admin shared components and points to workspace/public shared UI references.
 */
export const uiPage: DocsPageDefinition = {
  key: "ui",
  eyebrow: "UI surface catalog",
  title: "UI Components",
  summary: "Reusable UI surfaces developers can access in admin and related workspace code.",
  intro: [
    "The admin app has its own shared component surface, and it intentionally mirrors some naming and layout patterns used in the workspace.",
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
        "`MetricGrid`, `StatusBadge`, and `InlineBarChart` for metrics and states.",
      ],
    },
    {
      title: "Workspace shared references",
      bullets: [
        "`apps/web/components/shared/*` contains the workspace/public shared UI surface.",
        "`apps/web/components/shared/Sidebar/*` contains the shared workspace navigation primitives.",
        "`PageHeader`, `PageHero`, `MetricGrid`, and `Card` mirror admin naming conventions closely.",
      ],
    },
    {
      title: "AI / workspace presentation references",
      paragraphs: [
        "`apps/web/components/shared/ag-aui/*` contains AI/workspace presentation components such as result cards, market blocks, property and offer action UIs, and orchestration-related presentation surfaces.",
      ],
      callout: {
        title: "Use with intent",
        body: "These `ag-aui` components are useful as references when tracing AI output, but they are not the default admin shared component layer.",
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
};

