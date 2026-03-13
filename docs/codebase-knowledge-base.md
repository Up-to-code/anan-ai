# Codebase Knowledge Base

Date: March 13, 2026
Scope: Current repo truth for `web`, `admin`, `mobile`, and `convex`

## Purpose

This document is a working map of how the Anan codebase currently fits together. It is based on live code, local READMEs, schema definitions, and the current build baseline, not on legacy assumptions.

Anan is implemented as a multi-surface real estate platform with four main runtime areas:

- `mobile/`: buyer-facing Expo app and AI-assisted property feed.
- `web/`: main Next.js workspace for broker and developer workflows plus public entrypoints.
- `admin/`: standalone Next.js operations console.
- `convex/`: shared backend, data model, security, AI orchestration, and business capabilities.

## Top-Level Architecture

### Frontend surfaces

- `mobile/`
  - Buyer-first, media-heavy property discovery flow.
  - Uses Convex directly when `EXPO_PUBLIC_CONVEX_URL` is configured.
  - Falls back to local mock data for feed and assistant UX during setup.
- `web/`
  - Next.js App Router workspace and public pages.
  - `web/server/` is the backend gateway for web-only orchestration, DTOs, auth resolution, and Convex repository adapters.
  - Audience-specific behavior is routed through zone-aware server modules rather than directly from pages.
- `admin/`
  - Separate Next.js app for operations, verification, diagnostics, properties, users, and knowledge management.
  - Reads mostly from `convex/admin_zone/*` and shared infrastructure.

### Backend zones

- `convex/_core/`
  - Schema, auth, role enforcement, identity resolution, and foundational infrastructure.
- `convex/user_zone/`
  - User-facing backend features, including the mobile feed and mobile assistant.
- `convex/ai_zone/`
  - Assistant entrypoints and the multi-agent orchestration runtime.
- `convex/shared_logic/`
  - Shared capabilities used across audiences: offers, inbox, properties, market, knowledge, subscriptions, notifications, agencies, OAuth, CRM helpers.
- `convex/admin_zone/`
  - Admin-specific read models and operational actions.
- `convex/broker_zone/` and `convex/red_zone/`
  - Thin owner-scoped repository adapters for broker and developer flows.

## Core Data Model

The main persisted entities visible in the current code are:

- `properties`
  - Shared inventory table. Ownership is stored through `brokerId` and/or `REDId`.
  - Visibility depends on `publicationState`; availability depends on `status`.
- `offers`
  - Offer records between broker/developer organizations.
  - Owner and recipient are split across `fromBrokerId`, `fromREDId`, `toBrokerId`, and `toREDId`.
  - Marketplace vs targeted flows are driven by `visibility`, `status`, and `publicationState`.
- `userProfiles`
  - Primary auth-linked identity record for workspace features.
  - Carries role, role status, broker/developer links, and activity state.
- `users`
  - Channel-scoped user rows used for non-auth/channel contexts.
- `assistantThreads` and `assistantMessages`
  - AI conversation storage for app/workspace assistant flows.
- `knowledgePages`
  - Shared editorial knowledge content currently queried by the assistant and admin.
- `inboxConversations`, `inboxConversationParticipants`, `inboxMessages`
  - Direct-message and offer-bootstrap collaboration layer.
- `workspaceNotifications`
  - Per-user workspace notification stream.
- `orders`
  - Lead or loan intent records used by admin/CRM-like flows.
- `verificationRequests`
  - Verification workflow state for profiles and organizations.
- `subscriptions`
  - Organization-scoped entitlement source for assistant action mode.

## Main Runtime Flows

### 1. Buyer mobile feed

Entry path:

- `mobile/app/index.tsx`
- `mobile/src/features/HomeFeedScreen/index.tsx`
- `mobile/src/hooks/usePropertyFeed.ts`
- `convex/user_zone/mobile/feed.ts`

Behavior:

- The screen is a vertically paged full-screen feed.
- The feed hook either:
  - loads paginated published properties from Convex, or
  - falls back to `mockProperties` when no Convex URL is configured.
- The backend feed query:
  - reads only `publicationState = "published"` properties,
  - hydrates owner projection from broker or developer tables,
  - maps media and summary fields into a mobile-specific DTO.

Important boundary:

- Mobile feed DTOs are normalized in the app, not used raw.
- The mobile app currently relies on mock fallback fields for some assistant-facing UI state.

### 2. Mobile property assistant

Entry path:

- `mobile/src/hooks/usePropertyAssistant.ts`
- `mobile/src/features/HomeFeedScreen/AssistantOverlay.tsx`
- `convex/user_zone/mobile/assistant.ts`

Behavior:

- The hook manages assistant sheet state for the currently selected property.
- Assistant responses are card-first, not free-form chat-first.
- The backend mobile assistant is deterministic right now:
  - it does not call the main AI orchestrator,
  - it classifies intent by keywords,
  - it returns typed cards such as ROI, payment plan, mortgage check, permit status, and comparison.
- Qualified handoff writes an `orders` row, optionally using the authenticated user and otherwise falling back to a caller-supplied external user id.

### 3. Workspace AI assistant

Entry path:

- `convex/ai_zone/assistant.ts`
- `convex/ai_zone/services/assistantService.ts`
- `convex/shared_logic/subscriptions/index.ts`
- `convex/shared_logic/knowledge/index.ts`
- `convex/ai_zone/agents/anan/*`

Behavior:

- Public Convex assistant endpoints are thin controllers.
- `assistantService.ts` resolves:
  - current owner context,
  - latest thread,
  - subscription entitlement,
  - knowledge snippets,
  - orchestrator role.
- Entitlement currently drives two modes:
  - `qa`
  - `action`
- Action mode is available only when the linked broker or developer organization is verified, has an active or trial subscription, and `actionModeEnabled === true`.

### 4. Inbox and offer-linked collaboration

Entry path:

- `convex/shared_logic/inbox.ts`
- `convex/shared_logic/offers/*`

Behavior:

- Direct conversations are keyed by a normalized `directKey`.
- Every conversation has two participant rows that track unread counts independently.
- Offer flows can bootstrap a structured `offer_event` message into inbox.
- Notifications are generated alongside inbox writes where a workspace profile can be resolved.

### 5. Offers

Entry path:

- `convex/shared_logic/offers.ts`
- `convex/shared_logic/offers/access.ts`
- `convex/shared_logic/offers/queries.ts`
- `convex/shared_logic/offers/mutations/*`

Behavior:

- Senders must be broker or developer roles.
- Publishing and applying require verified organizations.
- Offer capability is split into:
  - access checks
  - recipient resolution
  - query projections
  - mutation flows
  - side effects

Current runtime split:

- `createOffer` and `createOfferDraft` both call the same creation service.
- `publishOffer` changes `publicationState`.
- `applyToOffer` is the public marketplace application path.
- `updateOfferStatus` is the recipient response path.

### 6. Property search and market intelligence

Entry path:

- `convex/shared_logic/properties/search.ts`
- `convex/shared_logic/market.ts`
- `convex/shared_logic/market/analytics.ts`

Behavior:

- Property search uses search indexes and then applies availability/publication filtering.
- Market intelligence combines:
  - published property inventory,
  - `knowledgeResearch` runs,
  - `searchLogs`.
- Market aggregation normalizes Saudi geography and feature labels before computing rankings, keywords, opportunities, and headline metrics.

### 7. Admin operations

Entry path:

- `convex/admin_zone/users.ts`
- `convex/admin_zone/organizations.ts`
- `convex/admin_zone/verifications.ts`
- `convex/admin_zone/activities.ts`
- `admin/admin_zone/pages/*`

Behavior:

- Admin read models are mostly joined projections built inside Convex.
- The admin app expects enriched datasets, not raw table rows.
- User and organization views merge data from:
  - auth profiles,
  - channel users,
  - memberships,
  - organizations,
  - verification requests,
  - selected activity tables.

## Zone Boundaries And Current Patterns

The repo is explicitly trying to enforce:

- thin route/controller files
- zone ownership
- view/logic separation
- shared server contracts
- README manifests for major folders
- WHY/WHAT/HOW JSDoc on exported modules

Patterns that are currently in use:

- `web/server/*` acts as the contract and orchestration boundary for web flows.
- `convex/broker_zone/*` and `convex/red_zone/*` act as low-level owner-scoped persistence surfaces.
- `convex/shared_logic/*` still contains shared business capabilities that have not fully moved behind web-only orchestration.
- `admin/` reads many Convex admin read models directly.

Patterns that are only partially consistent:

- Documentation quality differs widely by surface.
- Some current app READMEs are strong capability manifests, while some top-level app READMEs are still generic defaults.
- The mobile app currently mixes production DTOs with mock-only UI fallback fields.

## Current Quality Baseline

As of March 13, 2026:

- `pnpm typecheck` at repo root passes.
- `pnpm --dir admin typecheck` fails.
  - The failure pattern is consistent with a React type-version conflict in `admin/`, notably `@types/react-svg-map` pulling a second `@types/react` line.
- `pnpm --dir mobile typecheck` fails.
  - The failure is due to mobile assistant contract drift between screen/components and the hook/type layer.

## Existing Automated Coverage

Current test coverage exists for:

- inbox ordering and unread behavior
- market snapshot aggregation
- property search normalization helpers
- selected admin API surfaces
- selected web server role gateways

Notably thin or missing coverage exists around:

- mobile assistant UI-to-hook-to-backend contract alignment
- public offer application and response state transitions
- company knowledge scoping
- inbox/offer recipient resolution beyond small datasets
- admin identity merge behavior between `userProfiles` and channel `users`

## Working Mental Model

The codebase is best understood as a layered system:

1. Shared schema and role rules in `convex/_core`
2. Shared business capabilities in `convex/shared_logic`
3. Audience-specific backend entrypoints in `convex/*_zone`
4. Web-only orchestration and DTO boundaries in `web/server`
5. Separate UI surfaces in `web`, `admin`, and `mobile`

When reviewing or changing behavior, the most important checks are:

- which role or audience owns the action
- whether ownership is stored by auth user, broker, or developer
- whether the flow is public, private, draft, published, or qualified
- whether the code is using production data, mock fallback data, or a mix of both
