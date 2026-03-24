# WhatsApp User Zone

Thin buyer-facing WhatsApp orchestration for the deterministic property assistant.

- `contracts.ts` defines the internal buyer turn and outbound WhatsApp message contracts.
- `state.ts` owns persisted buyer state and inbound message receipt dedupe records.
- `searchFlow.ts` builds buyer discovery replies from published property results.
- `propertyFlow.ts` builds property-specific follow-up replies and action prompts.
- `handoff.ts` persists WhatsApp-qualified buyer orders into the existing CRM pipeline.
- `formatters.ts` renders shared mobile result cards into WhatsApp-safe transcript and text blocks.
- `index.ts` is the thin orchestrator used by the WhatsApp channel adapter.

Keep WhatsApp vendor parsing and transport in `convex/ai_zone/channels/whatsapp/*`.
