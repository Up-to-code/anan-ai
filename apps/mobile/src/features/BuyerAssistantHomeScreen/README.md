# BuyerAssistantHomeScreen

Chat-first buyer home for the live mobile buyer experience.

- `index.tsx` orchestrates the feature-owned buyer assistant screen, minimal welcome state, history sheet, and routing glue.
- `PropertyPromptCardsRail.tsx` renders the selected-property context rail above the composer with explicit select-more and compare actions.
- `ConversationTimeline.tsx` hosts the buyer assistant on top of Gifted Chat while preserving the screen-specific message anatomy, property shelves, search blocks, and insight sections.
- `ConversationComposer.tsx` owns the new buyer assistant composer and voice entry surface.
- `src/hooks/useMobileAssistantGenUiTransport.ts` wraps the Convex-backed Gen UI stream transport used by the mobile assistant.
- `propertyPrompt.ts` owns the draft-shaping helpers for explicit property context without auto-triggering comparison mode.
- Conversation behavior lives in `usePropertyAssistant.ts` and `usePropertyFeed.ts`.
- Shared hooks stay in `src/hooks/`; the visible screen layout is owned by this feature folder.
