# Mobile Architecture (Expo Router → Features → Hooks → Convex)

---

## WHY

Mobile is the fastest way users can experience Anan. The architecture must keep:

- UI code simple,
- state orchestration predictable,
- and backend contracts stable.

---

## WHAT

This chapter documents the mobile flow:

- Expo Router entrypoints,
- feature modules (screen-level orchestration),
- hooks (data + assistant state),
- Convex endpoints across the live public buyer assistant path and mobile-specific buyer helpers.

---

## HOW (Typical flow)

```mermaid
flowchart LR
  R["apps/mobile/app/*\n(Expo Router)"] --> F["src/features/*\n(screen orchestration)"]
  F --> H["src/hooks/*\n(data + state)"]
  H --> C["src/lib/convex*\n(provider + API proxy)"]
  C --> A["convex/ai_zone/assistantPublic\n(live buyer assistant)"]
  C --> X["convex/user_zone/mobile/*\n(feed + account + deterministic helpers)"]
```

### Design rules

- Feature modules own composition of UI blocks and hooks.
- Hooks own:
  - paging,
  - optimistic UI state,
  - assistant sheet state,
  - and mapping server results into UI-ready DTOs.
- Convex endpoints own:
  - filtering rules,
  - ownership rules,
  - and stable query projections.

---

## Where to change code

- Feed endpoints: `convex/user_zone/mobile/feed.ts`
- Live buyer assistant backend: `convex/ai_zone/assistantPublic.ts`
- Mobile authenticated replay: `convex/user_zone/mobile/account.ts`
- Deterministic mobile helper: `convex/user_zone/mobile/assistant.ts`
- Feed hook: `apps/mobile/src/hooks/usePropertyFeed.ts`
- Assistant hook: `apps/mobile/src/hooks/usePropertyAssistant.ts`

---

## Common pitfalls

- Allowing mock data to “fill missing fields” from real backend items.
- Drifting hook return shapes without updating feature modules.
- Passing raw Convex document shapes directly into components.
- Letting mock helper imports leak back into shipped mobile routes or hooks.
