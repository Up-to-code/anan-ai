import type { DocsPageDefinition, DocsPageKey } from "./types";
export type { DocsPageDefinition, DocsPageKey, DocsSection } from "./types";

import { overviewPage } from "./pages/overview";
import { architecturePage } from "./pages/architecture";
import { convexPage } from "./pages/convex";
import { webGatewayPage } from "./pages/webGateway";
import { channelsPage } from "./pages/channels";
import { capabilitiesPage } from "./pages/capabilities";
import { uiPage } from "./pages/ui";
import { dataPage } from "./pages/data";
import { aiChatflowPage } from "./pages/aiChatflow";
import { mobilePage } from "./pages/mobile";
import { workflowPage } from "./pages/workflow";

export const docsPageOrder: DocsPageKey[] = [
  "overview",
  "architecture",
  "convex",
  "webGateway",
  "channels",
  "capabilities",
  "data",
  "aiChatflow",
  "ui",
  "mobile",
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
  convex: {
    href: "/docs/convex",
    label: "Convex",
    description: "Schema/security, zones, shared logic, and backend rules.",
  },
  webGateway: {
    href: "/docs/web-gateway",
    label: "Web Gateway",
    description: "How the web server layer owns orchestration, contracts, and adapters.",
  },
  channels: {
    href: "/docs/channels",
    label: "Channels",
    description: "WhatsApp blueprint plus rules for future channel adapters.",
  },
  capabilities: {
    href: "/docs/capabilities",
    label: "Capabilities",
    description: "Admin structure plus shared product capabilities and ownership.",
  },
  ui: {
    href: "/docs/ui",
    label: "UI Components",
    description: "Reusable admin/workspace UI surfaces developers can access today.",
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
  mobile: {
    href: "/docs/mobile",
    label: "Mobile",
    description: "Expo surface architecture, wiring, DTO rules, and common pitfalls.",
  },
  workflow: {
    href: "/docs/workflow",
    label: "Workflow",
    description: "Where to add code, common commands, and testing expectations.",
  },
};

export const docsPages: Record<DocsPageKey, DocsPageDefinition> = {
  overview: overviewPage,
  architecture: architecturePage,
  convex: convexPage,
  webGateway: webGatewayPage,
  channels: channelsPage,
  capabilities: capabilitiesPage,
  ui: uiPage,
  data: dataPage,
  aiChatflow: aiChatflowPage,
  mobile: mobilePage,
  workflow: workflowPage,
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
    nextPageKey:
      currentIndex >= 0 && currentIndex < docsPageOrder.length - 1
        ? docsPageOrder[currentIndex + 1]
        : undefined,
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

