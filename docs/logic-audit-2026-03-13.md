# Logic Audit

Date: March 13, 2026
Method: static code review of current repo state plus existing tests and typecheck baseline
Focus: business logic, ownership rules, state transitions, and cross-boundary contract drift

## Baseline

Checks used as current baseline:

- `pnpm typecheck`: passes
- `pnpm --dir admin typecheck`: fails
- `pnpm --dir mobile typecheck`: fails

Baseline interpretation:

- Admin has a dependency/type-system problem, but that is not the main business-logic blocker.
- Mobile already exposes a business-contract problem strongly enough to fail compilation.

## 1. Mobile + AI Assistant Path

### Intended behavior

- The buyer feed should render live published inventory.
- The mobile assistant should be property-aware and card-based.
- The selected property should drive prompts, assistant preview state, and handoff creation.

### Actual implementation path

- `mobile/src/features/HomeFeedScreen/index.tsx`
- `mobile/src/features/HomeFeedScreen/AssistantOverlay.tsx`
- `mobile/src/hooks/usePropertyAssistant.ts`
- `mobile/src/hooks/usePropertyFeed.ts`
- `convex/user_zone/mobile/feed.ts`
- `convex/user_zone/mobile/assistant.ts`

### Confirmed defects

1. UI-to-hook assistant contract drift breaks the mobile feature boundary.
   - `HomeFeedScreen` still expects `assistant.messages`, `send(activeProperty)`, and `verify(activeProperty)`.
   - `usePropertyAssistant` now returns `message`, `cards`, `send()`, and `verify()` with no property argument.
   - `AssistantOverlay` imports `ChatMessage` from `mobile/src/types/mobile.ts`, but that type is not exported.
   - Result: mobile typecheck fails and the runtime mental model is split between transcript-style chat and card-style assistant state.

2. Live mobile feed items depend on mock-only assistant metadata.
   - `convex/user_zone/mobile/feed.ts` does not return `recommendedPrompts` or `demoPreviewCard`.
   - `mobile/src/hooks/usePropertyFeed.ts` fills those fields from `mockProperties`.
   - Result: production feed cards can inherit prompts and preview cards from unrelated mock fixtures instead of property-backed data.

### Suspected logical mistakes

- `buildMobilePropertyFeedItem` defaults owner type to `RED` whenever `brokerId` is absent, including records that have neither `brokerId` nor `REDId`.
- `createQualifiedHandoff` allows unauthenticated writes when a caller supplies `externalUserId`, which may be intentional for anonymous leads but weakens identity confidence inside `orders`.

### Questions to validate with product intent

- Should mobile assistant state be transcript-based, or is the new card-first model the intended contract?
- Should anonymous mobile leads be allowed to create `qualified` orders, or should handoff require a session or a dedicated lead-identity record?
- Do live properties need backend-authored prompts and preview cards, or is mock-seeded assistant UX acceptable during MVP?

### Current tests and gaps

- No focused automated coverage was found for the mobile assistant contract boundary.
- This area needs tests that lock:
  - hook return shape
  - overlay prop shape
  - Convex assistant response shape
  - handoff identity rules

## 2. AI Orchestration + Assistant Ownership

### Intended behavior

- The shared assistant should resolve the current owner correctly.
- Entitlement should gate `qa` vs `action` mode.
- Company knowledge should enrich responses without leaking unrelated context.

### Actual implementation path

- `convex/ai_zone/assistant.ts`
- `convex/ai_zone/services/assistantService.ts`
- `convex/shared_logic/subscriptions/index.ts`
- `convex/shared_logic/knowledge/index.ts`
- `convex/_core/schema/knowledge.ts`

### Confirmed defects

1. "Company knowledge" is currently global knowledge.
   - `retrieveCompanyKnowledge` queries every row in `knowledgePages` and scores all of them for every authenticated caller.
   - `knowledgePages` has no broker, developer, workspace, or owner scoping field in schema.
   - Result: assistant enrichment is not company-specific despite the API naming and intent.

### Suspected logical mistakes

- `listThreadMessages` collects thread messages without an explicit sort, so message ordering depends on storage/query behavior rather than a declared rule.
- `saveConversationStep` patches `mode`, `assistantKind`, and `orchestratorName` back onto the thread every turn, which means a reused thread can silently change identity over time if upstream callers ever mix kinds or modes.

### Questions to validate with product intent

- Is `knowledgePages` meant to be global platform knowledge, or truly company-scoped knowledge?
- Should `assistantThreads` be immutable per `assistantKind` and per mode, or can a thread intentionally transition between `qa` and `action`?
- Do we want ordered assistant history to be guaranteed oldest-first or newest-first at the query layer?

### Current tests and gaps

- No focused tests were found for:
  - company knowledge scoping
  - assistant thread mode/kind invariants
  - message ordering guarantees

## 3. Inbox And Collaboration

### Intended behavior

- Direct conversations should be deterministic and deduplicated.
- Offer-linked conversations should reliably reach the intended workspace participant.
- Unread counts and notification side effects should stay in sync.

### Actual implementation path

- `convex/shared_logic/inbox.ts`
- `convex/shared_logic/inbox.test.ts`
- `convex/shared_logic/offers/mutations/sideEffects.ts`

### Confirmed defects

1. Offer conversation and notification delivery only search the first 200 profiles.
   - `getProfileByOrganizationTarget` in `inbox.ts` uses `ctx.db.query("userProfiles").take(200)`.
   - `findWorkspaceProfileByParty` in `offers/mutations/sideEffects.ts` also uses `take(200)`.
   - Result: once the workspace has more than 200 profiles, valid recipients can stop receiving offer bootstraps or notifications depending on insertion order.

### Suspected logical mistakes

- Direct inbox access is currently allowed for `user`, `broker`, `developer`, and `admin`, which may be broader than the intended workspace collaboration audience.
- `searchConversationTargets` only supports exact email or exact normalized username lookup, which may be too narrow for a practical collaboration directory but could be an MVP choice.

### Questions to validate with product intent

- Should direct inbox be available to plain end users and admins, or only to workspace participants?
- Is exact-match target search intentional, or should it support discovery semantics?
- Should offer-linked conversation bootstrap fail hard when a workspace profile is missing, or is silent partial delivery acceptable?

### Current tests and gaps

- Existing tests cover:
  - ordering by latest message
  - unread count behavior
  - self-target prevention
- Missing tests:
  - recipient resolution beyond 200 profiles
  - offer bootstrap and dedupe behavior
  - notification delivery expectations when profile resolution fails

## 4. Properties / Offers / Market

### Intended behavior

- Search and market intelligence should work for Arabic and English real estate queries.
- Offer state transitions should be role-safe, visibility-safe, and non-duplicative.
- Public marketplace flows should connect the right parties without corrupting ownership state.

### Actual implementation path

- `convex/shared_logic/properties/search.ts`
- `convex/shared_logic/properties/search.test.ts`
- `convex/shared_logic/market/analytics.ts`
- `convex/shared_logic/market.test.ts`
- `convex/shared_logic/offers.ts`
- `convex/shared_logic/offers/queries.ts`
- `convex/shared_logic/offers/mutations/create.ts`
- `convex/shared_logic/offers/mutations/apply.ts`
- `convex/shared_logic/offers/mutations/respond.ts`
- `convex/shared_logic/offers/mutations/publish.ts`
- `convex/shared_logic/offers/recipients.ts`

### Confirmed defects

1. Arabic query normalization is knowingly broken in production code.
   - `normalizeQuery` and `normalizeQueryForCache` rely on `\b` regex boundaries for Arabic tokens.
   - `convex/shared_logic/properties/search.test.ts` explicitly documents that these regexes do not work for Arabic and asserts the broken behavior instead of the desired behavior.
   - Result: Arabic stopword stripping and cache normalization are weaker than the code comments imply, which degrades real Arabic search quality.

2. Public offers can be accepted repeatedly and by arbitrary verified organizations.
   - `applyToOfferService` does not require `status === "pending"` and does not reject already-claimed public offers.
   - It patches recipient fields and inserts a new deal every time it runs.
   - `updateOfferStatusService` allows any verified broker or developer to change a public offer because it only enforces recipient ownership when `offer.visibility !== "public"`.
   - Result: public offer state can be overwritten after acceptance, and duplicate or unauthorized deals can be created.

### Suspected logical mistakes

- `createOfferService` can create a private offer with no resolved recipient because `resolveOfferRecipient` may return empty owner ids and creation does not validate that case.
- `listPublicOffersService` requires authentication but otherwise returns all visible public pending offers; if marketplace visibility is meant to be role-scoped or verification-scoped on the read side, that rule is not enforced here.
- Current naming drift between stored `REDId` fields and web-level `redId` contracts is manageable but still easy to misread at boundaries.

### Questions to validate with product intent

- Should a private offer be allowed to exist without a resolvable recipient, or should that remain draft-only and separate from the "send" path?
- Once a public offer is accepted, should it become immutable, unpublished, or otherwise unavailable to other applicants immediately?
- Should public offer response rights belong only to the final assigned recipient after application, or should the original public visibility still matter?

### Current tests and gaps

- Existing market tests cover aggregation behavior.
- Existing search tests cover helper behavior, but currently lock in known-broken Arabic regex assumptions.
- Missing tests:
  - public offer apply idempotency
  - unauthorized public offer rejection
  - duplicate deal prevention
  - private offer recipient validation

## 5. Admin Read Models

### Intended behavior

- Admin should see one coherent operational identity view spanning auth profiles, organizations, channel users, verification state, and activity.
- Admin pages should consume stable joined read models rather than reconstructing identity in the UI.

### Actual implementation path

- `convex/admin_zone/users.ts`
- `convex/admin_zone/organizations.ts`
- `convex/admin_zone/verifications.ts`
- `admin/admin_zone/pages/*`
- `web/server/contracts/profiles.ts`
- `web/server/auth/session.ts`

### Confirmed defects

- No clear confirmed business-logic defect was proven in admin read models during this pass.
- The main concrete admin issue today is compile health: the app has a React type-version conflict that breaks typecheck and obscures deeper review.

### Suspected logical mistakes

- `listAdminUsers` deduplicates channel `users` against auth `userProfiles` by email only.
  - If a human exists in both systems without a shared email, or with a changed email, the admin list can show duplicates or fail to unify the identity.
- Read models collect and join whole tables in memory, which is primarily a scalability issue but also increases the chance of stale or inconsistent identity stitching logic.
- Mixed `developer` and `RED` role vocabulary remains present in filters and contracts, which can still confuse reporting and admin reasoning even when access policy normalizes it.

### Questions to validate with product intent

- Is email-based identity stitching good enough for admin operations, or should admin read models prefer auth user id / profile id / organization links wherever possible?
- Should admin user filters expose both `developer` and `RED`, or should one canonical term win at the contract boundary?
- Is the admin surface expected to include channel-only users as first-class "users", or should that be a separate operational list?

### Current tests and gaps

- Admin tests exist for selected API/page behavior.
- Missing tests:
  - identity merge correctness between `userProfiles` and `users`
  - role filter semantics for `developer` vs `RED`
  - detail-page behavior when one identity exists only in channel or only in auth records

## Appendix: Build And Test Observations

### Typecheck baseline

- Root workspace:
  - passes
- Admin:
  - fails with JSX element incompatibilities consistent with multiple React type versions
  - `pnpm why @types/react` shows `@types/react-svg-map` pulling `@types/react@19.1.17` while most of the admin tree resolves `@types/react@19.0.14`
- Mobile:
  - fails on assistant contract mismatch and missing `ChatMessage` export

### Highest-priority follow-up candidates

1. Fix public-offer acceptance/response authorization and idempotency.
2. Fix the mobile assistant contract so screen, hook, overlay, and Convex response all share one model.
3. Add proper recipient lookup for inbox/offer delivery without `take(200)` limits.
4. Decide whether assistant knowledge is global or organization-scoped, then align schema and query naming.
5. Replace the known-broken Arabic normalization rules with Unicode-safe search normalization.
