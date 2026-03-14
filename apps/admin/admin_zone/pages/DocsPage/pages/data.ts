import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Most production bugs in multi-surface platforms come from ownership and state misunderstandings.
 * WHAT:  Defines the data model and contracts handbook page.
 * HOW:   Summarizes core entities, ownership fields, and contract boundaries.
 */
export const dataPage: DocsPageDefinition = {
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
        "`apps/web/server/contracts/*` stabilizes shapes crossing between web UI and backend services.",
        "Admin is primarily a consumer of `convex/admin_zone/*` projections and uses admin loaders to map those into UI state.",
        "Mobile should map Convex projections into mobile DTOs; do not build UI around raw DB fields.",
      ],
    },
    {
      title: "Read more (deep markdown)",
      codeBlock: {
        label: "Canonical deep references",
        code: [
          "docs/codebase-knowledge-base.md",
          "docs/handbook/glossary.md",
          "docs/handbook/recipes/add-table.md",
        ].join("\n"),
      },
    },
  ],
  related: ["convex", "webGateway", "workflow"],
};

