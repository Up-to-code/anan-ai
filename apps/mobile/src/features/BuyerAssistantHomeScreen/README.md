# BuyerAssistantHomeScreen

Chat-first buyer home for the live mobile buyer experience.

- `index.tsx` orchestrates the feature-owned buyer assistant screen, welcome state, history sheet, and routing glue.
- `PropertyPromptCardsRail.tsx` renders the minimal horizontal strip of selected-property prompt tabs above the composer, using circular thumbnails and short inline page-like labels.
- `ConversationTimeline.tsx` renders the new screen-specific message anatomy, property shelves, search blocks, and insight sections.
- `ConversationComposer.tsx` owns the new buyer assistant composer and voice entry surface.
- `propertyPrompt.ts` owns the draft-shaping helpers that merge single-property and comparison context into the user's prompt once.
- Conversation behavior lives in `usePropertyAssistant.ts` and `usePropertyFeed.ts`.
- Shared hooks stay in `src/hooks/`; the visible screen layout is owned by this feature folder.
