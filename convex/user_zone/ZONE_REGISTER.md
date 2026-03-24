# `user_zone` Register

## Top-Level Ownership
- `mobile/`: feed queries, assistant actions, response contracts
- `whatsapp/`: contracts, formatting, state, property/search reply flows, handoff

## Important Files And Exports
- `mobile/feed.ts`: `listFeed`, `getPropertyContext`, feed item builders
- `mobile/assistant.ts`: buyer assistant action, handoff creation, response builders
- `mobile/contracts.ts`: mobile result validators and payload types
- `whatsapp/index.ts`: generated buyer reply action
- `whatsapp/contracts.ts`: state/reply validators and types
- `whatsapp/state.ts`: message receipt/state tracking

## Main Consumers
- mobile frontend
- WhatsApp channel handling inside `ai_zone`
- user-facing backend tests

## Public Vs Internal
- Public: `mobile/*` entrypoints and `whatsapp/index.ts` with its contracts
- Internal: formatters, state helpers, low-level flow modules
