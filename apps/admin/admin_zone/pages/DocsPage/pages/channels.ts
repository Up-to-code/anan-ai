import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Channels are production ingress (webhooks) and require strict idempotency and thin-edge rules.
 * WHAT:  Defines the Channels handbook page (curated mirror of `docs/handbook/convex/channels.md`).
 * HOW:   Summarizes the WhatsApp pipeline and the required channel folder contract.
 */
export const channelsPage: DocsPageDefinition = {
  key: "channels",
  eyebrow: "Ingress",
  title: "Channels (WhatsApp Blueprint)",
  summary: "How inbound channel messages flow through Convex, and the required folder contract for new channels.",
  intro: [
    "Channels are not “just another frontend”. Webhooks retry, payloads vary, and vendor APIs fail.",
    "Channel handlers must be thin, idempotent, and delegated into zone services/actions.",
  ],
  sections: [
    {
      title: "WhatsApp pipeline (current repo truth)",
      codeBlock: {
        label: "Flow",
        code: [
          "convex/http.ts",
          "  -> ai_zone/channels/whatsapp/webhook.ts (httpAction)",
          "  -> api.ts (parse vendor payload -> normalized events)",
          "  -> preprocess/* (normalize text/voice)",
          "  -> internal action (generateReply)",
          "  -> service.ts (sendText via vendor API)",
        ].join("\n"),
      },
    },
    {
      title: "Non-negotiable rules",
      bullets: [
        "Idempotency: dedupe on vendor message ids; webhook delivery retries are normal.",
        "Thin handlers: do not embed business logic or AI calls in webhook files.",
        "Safe fallbacks: reply with localized fallback messages when generation fails.",
        "No raw prompt dumps: do not log webhook bodies or full prompt context.",
      ],
    },
    {
      title: "Read more (deep markdown)",
      codeBlock: {
        label: "Canonical deep references",
        code: [
          "docs/handbook/convex/channels.md",
          "docs/handbook/recipes/add-channel.md",
          "CONVEX_RULES.md",
        ].join("\n"),
      },
    },
  ],
  related: ["convex", "aiChatflow", "workflow"],
};

