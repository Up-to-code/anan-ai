# Codebase Audit Report (Generated + Manual)

This report is generated from a full scan of tracked source files plus targeted manual review of hotspots.

Generated inventories live in `output/audit/analysis.json` and `output/audit/tables.md`.

- Scanned tracked source files: **1106**
- Oversized files (>300 lines): **0**
- Long functions (>40 lines): **147**
- Deep nesting (>=3): **29**
- Convex .collect(): **212**
- Convex .filter((q)=>...): **3**
- `useQuery(..., {})`: **3**
- `ctx.db.get(...)` inside loops: **0**

---

# 1. ARCHITECTURE REVIEW

(Manual findings are inserted here; generated inventories start in section 2.)

# 5. BAD ARCHITECTURE PATTERNS

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/useRealtimeInbox.ts:112
ISSUE: broad real-time subscription: useQuery(..., {})
DETAIL: The analyzer found 3 occurrences of `useQuery(..., {})`, which typically means an unscoped subscription (workspace-wide) unless the server query internally scopes by auth.
FIX: Prefer passing explicit scope args (workspaceId, pagination cursor, filters) and ensure server-side query enforces auth + pagination.

<details>
<summary>Full List: useQuery(..., {}) (3)</summary>

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/useRealtimeInbox.ts:43
ISSUE: useQuery called with empty args
DETAIL: const liveConversations = useQuery(inboxApi.listConversations, {});
FIX: Add explicit args and enforce server-side scoping/pagination.

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/useWorkspaceSignalCounts.ts:19
ISSUE: useQuery called with empty args
DETAIL: const liveNotifications = useQuery(notificationsApi.getWorkspaceNotificationSummary, {});
FIX: Add explicit args and enforce server-side scoping/pagination.

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/useWorkspaceSignalCounts.ts:20
ISSUE: useQuery called with empty args
DETAIL: const liveInboxSummary = useQuery(inboxApi.getInboxUnreadSummary, {});
FIX: Add explicit args and enforce server-side scoping/pagination.

</details>

# 6. BAD FUNCTIONALITY PATTERNS

FILE: output/audit/analysis.json
ISSUE: ctx.db.get(...) inside loops: 0 occurrences detected
DETAIL: The analyzer did not detect `ctx.db.get(...)` calls inside loop statement subtrees (for/while). This does not rule out N+1 patterns expressed via `.map(async ...)`, repeated sequential gets, or `collect()+get` hydration patterns.
FIX: Manually review hot paths that hydrate lists (offers, inbox, org directory) and batch/parallelize with Promise.all + index-backed queries as appropriate.

# 2. FILE & FOLDER STRUCTURE

## Oversized Files (>300 lines)

# 3. FUNCTION & CODE QUALITY

## Long Functions (>40 lines)

FILE: output/audit/analysis.json
ISSUE: inventory contains 147 functions >40 lines
DETAIL: Each entry includes start/end line spans for extraction planning. The largest offenders are listed below; the full list is in the collapsed section.
FIX: Extract cohesive blocks into helpers/modules; ensure each extracted function has a single responsibility and clear input/output contracts.

FILE: convex/ai_zone/services/assistantService/handleAssistantMessage.ts:17-296
ISSUE: function exceeds 40 lines (280 lines): handleAssistantMessage
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/admin/admin_zone/pages/OrganizationDetailPage/index.tsx:22-293
ISSUE: function exceeds 40 lines (272 lines): OrganizationDetailPage
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/useVoiceRecorder.ts:15-286
ISSUE: function exceeds 40 lines (272 lines): useVoiceRecorder
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/InboxWorkspaceClient.tsx:16-282
ISSUE: function exceeds 40 lines (267 lines): InboxWorkspaceClient
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(ws)/ws/(zones)/offers/OfferDetailPage/index.tsx:16-281
ISSUE: function exceeds 40 lines (266 lines): OfferDetailPage
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(public)/LandingPage/index.tsx:19-283
ISSUE: function exceeds 40 lines (265 lines): LandingPage
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/admin/admin_zone/pages/AnalyticsPage/index.tsx:15-275
ISSUE: function exceeds 40 lines (261 lines): AnalyticsPage
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: convex/admin_zone/tenantsMigration.ts:29-289
ISSUE: function exceeds 40 lines (261 lines): handler
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/admin/admin_zone/pages/UserDetailPage/index.tsx:23-282
ISSUE: function exceeds 40 lines (260 lines): UserDetailPage
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: convex/admin_zone/users/getAdminUserDetailHandler.ts:13-257
ISSUE: function exceeds 40 lines (245 lines): getAdminUserDetailHandler
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: scripts/audit/generateAudit.mjs:55-294
ISSUE: function exceeds 40 lines (240 lines): main
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: convex/shared_logic/agencies/repositories/organizationCreation.helpers.ts:39-277
ISSUE: function exceeds 40 lines (239 lines): createOrganizationForAuthUserRecord
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/components/shared/ag-aui/AgPropertyForm.tsx:42-273
ISSUE: function exceeds 40 lines (232 lines): AgPropertyForm
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/components/ai-elements/prompt-input/promptInput.tsx:36-266
ISSUE: function exceeds 40 lines (231 lines): PromptInput
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: convex/seed.ts:65-288
ISSUE: function exceeds 40 lines (224 lines): handler
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/components/shared/ag-aui/AgPropertyFormSidebar.tsx:31-253
ISSUE: function exceeds 40 lines (223 lines): AgPropertyFormSidebar
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/useRealtimeInbox.ts:19-233
ISSUE: function exceeds 40 lines (215 lines): useRealtimeInbox
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/components/InboxComposer.tsx:87-298
ISSUE: function exceeds 40 lines (212 lines): InboxComposer
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(public)/early-access/page.tsx:9-217
ISSUE: function exceeds 40 lines (209 lines): EarlyAccessPage
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/WorkspaceAssistantCanvas.tsx:71-274
ISSUE: function exceeds 40 lines (204 lines): WorkspaceAssistantCanvas
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/useWorkspaceAssistant.ts:24-226
ISSUE: function exceeds 40 lines (203 lines): useWorkspaceAssistant
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(public)/about/page.tsx:33-230
ISSUE: function exceeds 40 lines (198 lines): AboutPage
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/components/shared/Sidebar/SidebarContent.tsx:27-223
ISSUE: function exceeds 40 lines (197 lines): SidebarContent
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: apps/web/app/(ws)/ws/(zones)/offers/CreateOfferForm.tsx:29-220
ISSUE: function exceeds 40 lines (192 lines): CreateOfferForm
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

FILE: scripts/audit/analyze.mjs:54-233
ISSUE: function exceeds 40 lines (180 lines): main
DETAIL: Large function size often correlates with mixed concerns (validation, I/O, mapping, rendering).
FIX: Extract logical phases into named helpers; keep the top-level function focused on orchestration.

<details>
<summary>Full List: Long Functions (>40 lines) (147)</summary>

<!-- Top 25 shown above; remainder below -->

FILE: apps/web/app/(ws)/ws/(overview)/settings/_components/InviteMemberForm.tsx:106-283
ISSUE: function exceeds 40 lines (178 lines): InviteMemberForm
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/OrganizationOnboarding/OrganizationOnboardingJourney.tsx:34-208
ISSUE: function exceeds 40 lines (175 lines): OrganizationOnboardingJourney
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/property/[id].tsx:14-185
ISSUE: function exceeds 40 lines (172 lines): PropertyDetailScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/ComplianceRulesetsPage/index.tsx:23-192
ISSUE: function exceeds 40 lines (170 lines): ComplianceRulesetsPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/projects/ProjectsPage/ProjectsWorkspace.tsx:32-199
ISSUE: function exceeds 40 lines (168 lines): ProjectsWorkspace
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/agents/anan_workspace/orchestrate.ts:17-183
ISSUE: function exceeds 40 lines (167 lines): orchestrate
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/crm/ClientDetailPage/index.tsx:49-214
ISSUE: function exceeds 40 lines (166 lines): ClientDetailPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/components/shared/ag-aui/AgPropertyFormPrimaryColumn.tsx:18-181
ISSUE: function exceeds 40 lines (164 lines): AgPropertyFormPrimaryColumn
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/settings/_components/OrganizationSettingsWorkspace.tsx:7-159
ISSUE: function exceeds 40 lines (153 lines): OrganizationSettingsWorkspace
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/market/analytics/snapshot.ts:19-170
ISSUE: function exceeds 40 lines (152 lines): buildMarketSnapshot
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/agents/anan/orchestrate.ts:38-188
ISSUE: function exceeds 40 lines (151 lines): orchestrate
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/VerificationDetailPage/index.tsx:15-163
ISSUE: function exceeds 40 lines (149 lines): VerificationDetailPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(public)/broker/page.tsx:10-158
ISSUE: function exceeds 40 lines (149 lines): BrokerPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/components/InboxSidebar.tsx:150-297
ISSUE: function exceeds 40 lines (148 lines): InboxSidebar
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/agents/core/BaseConfiguredAgent.ts:40-184
ISSUE: function exceeds 40 lines (145 lines): run (class:BaseConfiguredAgent)
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/oauth/authorize/page.tsx:27-170
ISSUE: function exceeds 40 lines (144 lines): OAuthAuthorizePage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/me/_components/ProfileWorkspace.tsx:14-156
ISSUE: function exceeds 40 lines (143 lines): ProfileWorkspace
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/OrganizationOnboarding/OrganizationInvitesStep.tsx:16-154
ISSUE: function exceeds 40 lines (139 lines): OrganizationInvitesStep
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/_core/oauth/httpAuthHandlers.ts:74-208
ISSUE: function exceeds 40 lines (135 lines): <anonymous>
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/src/features/HomeFeedScreen/index.tsx:73-204
ISSUE: function exceeds 40 lines (132 lines): HomeFeedScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/crm/brokers/[brokerId]/page.tsx:13-143
ISSUE: function exceeds 40 lines (131 lines): BrokerDetailPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/components/vectors/motion/MotionNexus.tsx:10-140
ISSUE: function exceeds 40 lines (131 lines): MotionNexus
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/OrganizationOnboarding/OrganizationDetailsStep.tsx:14-143
ISSUE: function exceeds 40 lines (130 lines): OrganizationDetailsStep
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(public)/contact/page.tsx:20-147
ISSUE: function exceeds 40 lines (128 lines): ContactPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/components/shared/InstitutionalChatInput.tsx:54-181
ISSUE: function exceeds 40 lines (128 lines): InstitutionalChatInput
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/OAuthAuthorizePage/index.tsx:14-140
ISSUE: function exceeds 40 lines (127 lines): OAuthAuthorizePage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/admin_zone/analytics.connections.ts:16-142
ISSUE: function exceeds 40 lines (127 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/src/components/features/AIPanelResultCard.tsx:22-147
ISSUE: function exceeds 40 lines (126 lines): AIPanelResultCard
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/property/finance/[id].tsx:19-143
ISSUE: function exceeds 40 lines (125 lines): FinanceDetailScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/property/offer/[id].tsx:12-136
ISSUE: function exceeds 40 lines (125 lines): OfferScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/crm/brokers/add/page.tsx:9-133
ISSUE: function exceeds 40 lines (125 lines): AddBrokerPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/InboxThreadView.tsx:12-134
ISSUE: function exceeds 40 lines (123 lines): InboxThreadView
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/KnowledgePage/index.tsx:16-133
ISSUE: function exceeds 40 lines (118 lines): KnowledgePage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/search.tsx:15-130
ISSUE: function exceeds 40 lines (116 lines): SearchScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(public)/developer/page.tsx:10-125
ISSUE: function exceeds 40 lines (116 lines): DeveloperPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(public)/theme/page.tsx:8-122
ISSUE: function exceeds 40 lines (115 lines): ThemePage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/OrdersPage/index.tsx:40-153
ISSUE: function exceeds 40 lines (114 lines): OrdersPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/offers/directory/[type]/[slug]/OrganizationProfileUI.tsx:7-120
ISSUE: function exceeds 40 lines (114 lines): OrganizationProfileUI
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/property/book/[id].tsx:22-133
ISSUE: function exceeds 40 lines (112 lines): BookAppointmentScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/DocsPage/DocsLayoutShell.tsx:12-121
ISSUE: function exceeds 40 lines (110 lines): DocsLayoutShell
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/oauth/internal/tokens.ts:138-247
ISSUE: function exceeds 40 lines (110 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/admin_zone/users/detail/identity.ts:4-112
ISSUE: function exceeds 40 lines (109 lines): resolveAdminUserIdentity
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/WorkspaceShell.tsx:14-120
ISSUE: function exceeds 40 lines (107 lines): WorkspaceShell
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/DocsPage/DocsSectionPanel.tsx:14-118
ISSUE: function exceeds 40 lines (105 lines): DocsSectionPanel
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/components/ai-elements/prompt-input/primitives/textarea.tsx:18-122
ISSUE: function exceeds 40 lines (105 lines): PromptInputTextarea
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/projects/ProjectDetailPage/index.tsx:12-115
ISSUE: function exceeds 40 lines (104 lines): ProjectDetailPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/admin_zone/analytics.market.ts:61-164
ISSUE: function exceeds 40 lines (104 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/src/features/HomeFeedScreen/AssistantExpandedComposer.tsx:14-116
ISSUE: function exceeds 40 lines (103 lines): AssistantExpandedComposer
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/src/lib/mockData.ts:7-109
ISSUE: function exceeds 40 lines (103 lines): mockAssistantResponse
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/offers/OfferDirectoryPage/index.tsx:150-252
ISSUE: function exceeds 40 lines (103 lines): OfferDirectoryPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/admin_zone/organizations/detail/offers.ts:66-167
ISSUE: function exceeds 40 lines (102 lines): buildOrganizationOffers
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/agencies/repositories/invites.helpers.ts:54-155
ISSUE: function exceeds 40 lines (102 lines): createTeamInviteForOwnerRecord
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/offers/mutations/sideEffects.ts:52-152
ISSUE: function exceeds 40 lines (101 lines): notifyOfferRecipient
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/UsersPage/index.tsx:23-122
ISSUE: function exceeds 40 lines (100 lines): UsersPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/DocsPage/DocsArticle.tsx:11-108
ISSUE: function exceeds 40 lines (98 lines): DocsArticle
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/notifications/page.tsx:23-120
ISSUE: function exceeds 40 lines (98 lines): WorkspaceNotificationsPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/Visuals/BrokerCard.tsx:26-122
ISSUE: function exceeds 40 lines (97 lines): BrokerCard
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/api/workspace/inbox/route.ts:43-139
ISSUE: function exceeds 40 lines (97 lines): POST
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(public)/policy/page.tsx:6-101
ISSUE: function exceeds 40 lines (96 lines): PolicyPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/auth/otp.tsx:12-106
ISSUE: function exceeds 40 lines (95 lines): OTPScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/server/ws/zones/crm.ts:24-118
ISSUE: function exceeds 40 lines (95 lines): getWorkspaceCrmZone
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/admin_zone/overview.ts:11-105
ISSUE: function exceeds 40 lines (95 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/market/analytics/aggregate.ts:4-98
ISSUE: function exceeds 40 lines (95 lines): aggregateCitiesAndAreas
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/Visuals/PersonCard.tsx:5-96
ISSUE: function exceeds 40 lines (92 lines): PersonCard
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/crm/clients/add/page.tsx:7-98
ISSUE: function exceeds 40 lines (92 lines): AddClientPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/market/MarketPage/MarketFilters.tsx:4-95
ISSUE: function exceeds 40 lines (92 lines): MarketFilters
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/offers/search/SearchOffersClient.tsx:126-217
ISSUE: function exceeds 40 lines (92 lines): SearchOffersClient
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/admin_zone/analytics.message.ts:46-137
ISSUE: function exceeds 40 lines (92 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/agencies/repositories/membership.ts:164-255
ISSUE: function exceeds 40 lines (92 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/Visuals/PropertyCard.tsx:9-98
ISSUE: function exceeds 40 lines (90 lines): PropertyCard
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/services/assistantService/workspaceStream.ts:40-128
ISSUE: function exceeds 40 lines (89 lines): createWorkspaceStreamControls
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(public)/signin/page.tsx:14-101
ISSUE: function exceeds 40 lines (88 lines): SigninPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/admin_zone/users/listAdminUsers.ts:25-112
ISSUE: function exceeds 40 lines (88 lines): listAdminUsersHandler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/agents/anan/resultMerger.ts:52-139
ISSUE: function exceeds 40 lines (88 lines): mergeResults
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/oauth/internal/tokens.ts:32-119
ISSUE: function exceeds 40 lines (88 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/offers/OfferProfilesPage/index.tsx:4-90
ISSUE: function exceeds 40 lines (87 lines): OfferProfilesPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/chat/[id].tsx:13-98
ISSUE: function exceeds 40 lines (86 lines): PropertyChatScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/components/shared/AdminShell.tsx:15-99
ISSUE: function exceeds 40 lines (85 lines): AdminShell
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/Visuals/BrokerPresenceChip.tsx:30-114
ISSUE: function exceeds 40 lines (85 lines): BrokerPresenceChip
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/components/InboxMessageItem.tsx:16-100
ISSUE: function exceeds 40 lines (85 lines): InboxMessageItem
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/Visuals/DeveloperCard.tsx:15-98
ISSUE: function exceeds 40 lines (84 lines): DeveloperCard
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/ZoneShell/ZoneSidebar.tsx:11-94
ISSUE: function exceeds 40 lines (84 lines): ZoneSidebar
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/components/shared/ag-aui/AgDeleteConfirmModal.tsx:5-87
ISSUE: function exceeds 40 lines (83 lines): AgDeleteConfirmModal
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/services/voiceTranscriptionService.ts:37-119
ISSUE: function exceeds 40 lines (83 lines): transcribeStoredVoiceNote
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/components/shared/Footer.tsx:4-85
ISSUE: function exceeds 40 lines (82 lines): Footer
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/appointments.tsx:11-91
ISSUE: function exceeds 40 lines (81 lines): AppointmentsScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/settings/_components/MembersWorkspace.tsx:116-196
ISSUE: function exceeds 40 lines (81 lines): MembersWorkspace
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/WorkspaceSidebarDrawer.tsx:12-91
ISSUE: function exceeds 40 lines (80 lines): WorkspaceSidebarDrawer
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/page.tsx:20-99
ISSUE: function exceeds 40 lines (80 lines): WorkspacePage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/app/signin/page.tsx:15-93
ISSUE: function exceeds 40 lines (79 lines): SigninPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/channels/whatsapp/webhook.ts:26-104
ISSUE: function exceeds 40 lines (79 lines): <anonymous>
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/notificationsNode.ts:11-88
ISSUE: function exceeds 40 lines (78 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/admin/admin_zone/pages/DashboardPage/index.tsx:14-88
ISSUE: function exceeds 40 lines (75 lines): DashboardPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/WorkspaceTopNavbar.tsx:12-86
ISSUE: function exceeds 40 lines (75 lines): WorkspaceTopNavbar
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/src/components/features/ThinkingIndicator.tsx:17-90
ISSUE: function exceeds 40 lines (74 lines): ThinkingIndicator
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(public)/terms/page.tsx:6-79
ISSUE: function exceeds 40 lines (74 lines): TermsPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/components/shared/Sidebar/useAssistantThreads.ts:6-79
ISSUE: function exceeds 40 lines (74 lines): useAssistantThreads
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/oauth/internal/consent.ts:97-170
ISSUE: function exceeds 40 lines (74 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: scripts/audit/analyze.mjs:117-190
ISSUE: function exceeds 40 lines (74 lines): <anonymous>
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/app/auth/login.tsx:10-82
ISSUE: function exceeds 40 lines (73 lines): LoginScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(public)/faq/page.tsx:12-84
ISSUE: function exceeds 40 lines (73 lines): FAQPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/_components/AIMotion/AIMotionLogo.tsx:31-103
ISSUE: function exceeds 40 lines (73 lines): AIMotionLogo
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/services/assistantService/persistence.ts:19-91
ISSUE: function exceeds 40 lines (73 lines): saveConversationStep
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/inbox/offerEvents.ts:26-98
ISSUE: function exceeds 40 lines (73 lines): ensureOfferConversationStarter
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/mobile/src/features/BrokerProfileScreen/index.tsx:24-95
ISSUE: function exceeds 40 lines (72 lines): BrokerProfileScreen
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/market/MarketPage/MarketOverviewPreview.tsx:9-80
ISSUE: function exceeds 40 lines (72 lines): MarketOverviewPreview
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/_core/security/accessPolicy.ts:48-119
ISSUE: function exceeds 40 lines (72 lines): requireRole
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/WorkspaceAssistantRail.tsx:29-99
ISSUE: function exceeds 40 lines (71 lines): WorkspaceAssistantRail
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/me/security/apps/[clientId]/page.tsx:15-85
ISSUE: function exceeds 40 lines (71 lines): WorkspaceSecurityDetailPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/projects/[projectId]/edit/page.tsx:11-81
ISSUE: function exceeds 40 lines (71 lines): EditProjectRoute
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/projects/ProjectsPage/ProjectsWorkspace.tsx:106-176
ISSUE: function exceeds 40 lines (71 lines): <anonymous>
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/properties/search.ts:168-235
ISSUE: function exceeds 40 lines (68 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/inbox/mutations.ts:153-219
ISSUE: function exceeds 40 lines (67 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/useVoiceRecorder.ts:109-174
ISSUE: function exceeds 40 lines (66 lines): <anonymous>
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/crm/ClientsPage/index.tsx:75-138
ISSUE: function exceeds 40 lines (64 lines): ClientsPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(zones)/market/MarketPage/index.tsx:30-93
ISSUE: function exceeds 40 lines (64 lines): MarketPage
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/components/shared/ag-aui/AgRichTextEditor.tsx:27-90
ISSUE: function exceeds 40 lines (64 lines): AgRichTextEditor
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/admin_zone/compliance.ts:90-153
ISSUE: function exceeds 40 lines (64 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/shared_logic/agencies/repositories/organization.ts:163-226
ISSUE: function exceeds 40 lines (64 lines): handler
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/useVoiceRecorder.ts:185-246
ISSUE: function exceeds 40 lines (62 lines): <anonymous>
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: convex/ai_zone/agents/anan_workspace/resultMerger.ts:193-245
ISSUE: function exceeds 40 lines (53 lines): mergeResults
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

FILE: apps/web/app/api/workspace/anan-pro/route.stream.ts:47-88
ISSUE: function exceeds 40 lines (42 lines): emitStreamEvent
DETAIL: Long function identified by AST span measurement.
FIX: Extract into smaller helpers or components; keep public surface stable and add focused unit tests around extracted logic.

</details>

## Deep Nesting (>=3)

FILE: output/audit/analysis.json
ISSUE: inventory contains 29 functions with nesting depth >= 3
DETAIL: Deep nesting increases cognitive load and often signals missing early returns, guard clauses, or extracted decision helpers.
FIX: Refactor to guard clauses, extract predicate helpers, and reduce nested branches.

FILE: apps/web/app/(ws)/ws/(zones)/crm/ClientDetailPage/index.tsx:49-214
ISSUE: deeply nested control flow (max depth 4): ClientDetailPage
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/admin_zone/tenantsMigration.ts:29-289
ISSUE: deeply nested control flow (max depth 4): handler
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/ai_zone/services/assistantService/handleAssistantMessage.ts:17-296
ISSUE: deeply nested control flow (max depth 4): handleAssistantMessage
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: apps/admin/admin_zone/api/users.ts:5-35
ISSUE: deeply nested control flow (max depth 3): getAdminUsersPageData
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: apps/mobile/src/components/features/AIPanelResultCard.tsx:22-147
ISSUE: deeply nested control flow (max depth 3): AIPanelResultCard
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: apps/web/app/(ws)/ws/(overview)/_components/WorkspaceDashboard/WorkspaceAssistantCanvas.tsx:71-274
ISSUE: deeply nested control flow (max depth 3): WorkspaceAssistantCanvas
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: apps/web/app/(ws)/ws/(zones)/inbox/InboxPage/components/InboxSidebar.tsx:150-297
ISSUE: deeply nested control flow (max depth 3): InboxSidebar
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: apps/web/app/api/workspace/inbox/route.ts:43-139
ISSUE: deeply nested control flow (max depth 3): POST
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: apps/web/components/ai-elements/prompt-input/primitives/textarea.tsx:72-92
ISSUE: deeply nested control flow (max depth 3): <anonymous>
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: apps/web/components/shared/ag-aui/AgPropertyForm.tsx:42-273
ISSUE: deeply nested control flow (max depth 3): AgPropertyForm
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: apps/web/components/shared/ag-aui/AgPropertyFormPrimaryColumn.tsx:18-181
ISSUE: deeply nested control flow (max depth 3): AgPropertyFormPrimaryColumn
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/_core/oauth/httpAuthHandlers.ts:74-208
ISSUE: deeply nested control flow (max depth 3): <anonymous>
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/_core/oauth/httpDelegatedHandlers.ts:29-66
ISSUE: deeply nested control flow (max depth 3): <anonymous>
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/_core/oauth/httpDelegatedHandlers.ts:68-107
ISSUE: deeply nested control flow (max depth 3): <anonymous>
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/_core/security/migrations.ts:59-86
ISSUE: deeply nested control flow (max depth 3): handler
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/admin_zone/analytics.market.ts:61-164
ISSUE: deeply nested control flow (max depth 3): handler
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/admin_zone/overview.ts:11-105
ISSUE: deeply nested control flow (max depth 3): handler
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/admin_zone/users/detail/identity.ts:4-112
ISSUE: deeply nested control flow (max depth 3): resolveAdminUserIdentity
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/ai_zone/agents/anan/resultMerger.ts:141-176
ISSUE: deeply nested control flow (max depth 3): collectResults
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/ai_zone/channels/whatsapp/webhook.ts:26-104
ISSUE: deeply nested control flow (max depth 3): <anonymous>
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/ai_zone/services/voiceTranscriptionService.ts:37-119
ISSUE: deeply nested control flow (max depth 3): transcribeStoredVoiceNote
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/shared_logic/agencies/repositories/core.ts:181-202
ISSUE: deeply nested control flow (max depth 3): resolveTenantOrgIdForProfile
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/shared_logic/agencies/repositories/membership.ts:164-255
ISSUE: deeply nested control flow (max depth 3): handler
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/shared_logic/lib/retry.ts:43-61
ISSUE: deeply nested control flow (max depth 3): withRetry
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

FILE: convex/shared_logic/market/analytics/aggregate.ts:4-98
ISSUE: deeply nested control flow (max depth 3): aggregateCitiesAndAreas
DETAIL: Max depth computed by walking control-flow constructs inside the function body (excluding nested function bodies).
FIX: Extract nested blocks into helpers; flatten with guard clauses; consider splitting by intent (validation vs execution vs mapping).

<details>
<summary>Full List: Deep Nesting (>=3) (29)</summary>

FILE: convex/shared_logic/market/analytics/sellingPoints.ts:11-47
ISSUE: deeply nested control flow (max depth 3): buildSellingPoints
DETAIL: Deep nesting identified by AST traversal.
FIX: Flatten and extract decision logic; add tests for each extracted decision path.

FILE: convex/shared_logic/notificationsNode.ts:11-88
ISSUE: deeply nested control flow (max depth 3): handler
DETAIL: Deep nesting identified by AST traversal.
FIX: Flatten and extract decision logic; add tests for each extracted decision path.

FILE: convex/test.setup.ts:13-31
ISSUE: deeply nested control flow (max depth 3): walk
DETAIL: Deep nesting identified by AST traversal.
FIX: Flatten and extract decision logic; add tests for each extracted decision path.

FILE: scripts/audit/analyze.mjs:54-233
ISSUE: deeply nested control flow (max depth 3): main
DETAIL: Deep nesting identified by AST traversal.
FIX: Flatten and extract decision logic; add tests for each extracted decision path.

</details>

## TODO/FIXME/XXX Markers

FILE: output/audit/analysis.json
ISSUE: found 12 TODO/FIXME/XXX markers in tracked source
DETAIL: These are potential partial implementations or deferred refactors; each should be triaged for production risk.
FIX: Convert each TODO into a ticket with an owner and remove from production paths when possible.

<details>
<summary>Full List: TODO/FIXME/XXX (12)</summary>

FILE: apps/web/app/(public)/early-access/page.tsx:172
ISSUE: TODO/FIXME/XXX marker
DETAIL: placeholder="+966 5X XXX XXXX"
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: convex/ai_zone/channels/whatsapp/preprocess/voicePipeline.ts:27
ISSUE: TODO/FIXME/XXX marker
DETAIL: // TODO: Call transformVoiceToText(mediaId) when services/transcription exists.
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/analyze.mjs:84
ISSUE: TODO/FIXME/XXX marker
DETAIL: // Index TODO/FIXME/XXX in tracked source (exclude lockfiles).
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/analyze.mjs:85
ISSUE: TODO/FIXME/XXX marker
DETAIL: const todoMatches = collectPatternLines(content, /\b(TODO|FIXME|XXX)\b/);
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/analyzeTables.mjs:58
ISSUE: TODO/FIXME/XXX marker
DETAIL: md.push(`## TODO/FIXME/XXX (Tracked Source)\n`);
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/generateAudit.mjs:171
ISSUE: TODO/FIXME/XXX marker
DETAIL: md.push(`## TODO/FIXME/XXX Markers\n`);
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/generateAudit.mjs:176
ISSUE: TODO/FIXME/XXX marker
DETAIL: issue: "no TODO/FIXME/XXX markers found in tracked source",
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/generateAudit.mjs:177
ISSUE: TODO/FIXME/XXX marker
DETAIL: detail: `No matches for TODO/FIXME/XXX in tracked source files scanned by the analyzer.`,
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/generateAudit.mjs:185
ISSUE: TODO/FIXME/XXX marker
DETAIL: issue: `found ${analysis.todoFixme.length} TODO/FIXME/XXX markers in tracked source`,
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/generateAudit.mjs:187
ISSUE: TODO/FIXME/XXX marker
DETAIL: fix: `Convert each TODO into a ticket with an owner and remove from production paths when possible.`,
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/generateAudit.mjs:192
ISSUE: TODO/FIXME/XXX marker
DETAIL: `Full List: TODO/FIXME/XXX (${analysis.todoFixme.length})`,
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

FILE: scripts/audit/generateAudit.mjs:197
ISSUE: TODO/FIXME/XXX marker
DETAIL: issue: `TODO/FIXME/XXX marker`,
FIX: Triage: either implement, delete, or convert to an issue with a clear acceptance criterion.

</details>

# 4. CONVEX DB AUDIT

## Risky Pattern Index (Mechanical)

FILE: convex/**
ISSUE: Convex uses .collect() in 57 files (212 total occurrences)
DETAIL: In Convex, .collect() can be appropriate for bounded datasets but is a frequent source of full-table scans. Each occurrence should be verified as bounded by index/selectivity or safe admin-only usage.
FIX: Prefer indexed reads (withIndex/withSearchIndex) + pagination (paginate/take) or summary tables for UI.

<details>
<summary>Full List: Convex .collect() Occurrences (212)</summary>

FILE: convex/_core/security/migrations.ts:12
ISSUE: potential over-fetch: .collect()
DETAIL: const profiles = await ctx.db.query("userProfiles").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/_core/security/migrations.ts:60
ISSUE: potential over-fetch: .collect()
DETAIL: const profiles = await ctx.db.query("userProfiles").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/activities.ts:28
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("workspaceNotifications").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/activities.ts:29
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/activities.ts:30
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantThreads").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/activities.ts:31
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/activities.ts:32
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("knowledgeResearch").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/activities.ts:33
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("searchLogs").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/activities.ts:34
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.connections.ts:20
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("offers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.connections.ts:21
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.connections.ts:22
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("deals").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.connections.ts:23
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("orders").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.connections.ts:24
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.connections.ts:25
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.market.ts:22
ISSUE: potential over-fetch: .collect()
DETAIL: const properties = await ctx.db.query("properties").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.market.ts:65
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("offers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.market.ts:66
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.market.ts:67
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:50
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantThreads").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:51
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:52
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:53
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:54
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("users").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:153
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantThreads").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:154
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:155
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:156
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("knowledgeResearch").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.message.ts:157
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("searchLogs").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.organizations.ts:11
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.organizations.ts:12
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.organizations.ts:13
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.organizations.ts:14
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.organizations.ts:55
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.organizations.ts:56
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.organizations.ts:57
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/analytics.organizations.ts:58
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/banks.ts:9
ISSUE: potential over-fetch: .collect()
DETAIL: return ctx.db.query("banks").order("desc").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/charts.ts:39
ISSUE: potential over-fetch: .collect()
DETAIL: const logs = await ctx.db.query("searchLogs").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/charts.ts:75
ISSUE: potential over-fetch: .collect()
DETAIL: const logs = await ctx.db.query("searchLogs").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/charts.ts:106
ISSUE: potential over-fetch: .collect()
DETAIL: const logs = await ctx.db.query("searchLogs").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/compliance.ts:45
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/compliance.ts:62
ISSUE: potential over-fetch: .collect()
DETAIL: const rulesets = await ctx.db.query("complianceRulesets").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/compliance.ts:127
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/compliance.ts:168
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/developers.ts:10
ISSUE: potential over-fetch: .collect()
DETAIL: const logs = await ctx.db.query("searchLogs").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/developers.ts:32
ISSUE: potential over-fetch: .collect()
DETAIL: const logs = await ctx.db.query("searchLogs").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/knowledge.ts:9
ISSUE: potential over-fetch: .collect()
DETAIL: return ctx.db.query("knowledgePages").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/orders.test.ts:11
ISSUE: potential over-fetch: .collect()
DETAIL: return await ctx.db.query("orders").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/orders.test.ts:33
ISSUE: potential over-fetch: .collect()
DETAIL: return await ctx.db.query("orders").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/orders.test.ts:62
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/orders.test.ts:69
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/orders.ts:40
ISSUE: potential over-fetch: .collect()
DETAIL: .collect()
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/orders.ts:41
ISSUE: potential over-fetch: .collect()
DETAIL: : await ctx.db.query("orders").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:65
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:66
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:67
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:68
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:69
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:70
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:71
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("subscriptions").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:72
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("offers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:73
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxConversationParticipants").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:74
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxConversations").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:75
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:76
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("workspaceNotifications").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:77
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("orders").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/getOrganizationDetail.helpers.ts:78
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("deals").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listBrokerOrganizations.ts:16
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listBrokerOrganizations.ts:17
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listBrokerOrganizations.ts:18
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listBrokerOrganizations.ts:19
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listBrokerOrganizations.ts:20
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listDeveloperOrganizations.ts:16
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listDeveloperOrganizations.ts:17
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listDeveloperOrganizations.ts:18
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listDeveloperOrganizations.ts:19
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listDeveloperOrganizations.ts:20
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listOrganizationInvites.ts:10
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listOrganizationInvites.ts:11
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listOrganizationInvites.ts:12
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listOrganizationMemberships.ts:59
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listOrganizationMemberships.ts:60
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listOrganizationMemberships.ts:61
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/organizations/listOrganizationMemberships.ts:62
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:30
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("users").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:31
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:32
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:33
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:34
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("offers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:35
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxConversations").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:36
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("subscriptions").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:37
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("deals").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:38
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:39
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantThreads").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:40
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:41
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:42
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("knowledgeResearch").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/overview.ts:43
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("searchLogs").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/RED.ts:9
ISSUE: potential over-fetch: .collect()
DETAIL: return ctx.db.query("RED").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/RED.ts:22
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/services/usersService.ts:32
ISSUE: potential over-fetch: .collect()
DETAIL: .collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/services/usersService.ts:36
ISSUE: potential over-fetch: .collect()
DETAIL: .collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/services/usersService.ts:40
ISSUE: potential over-fetch: .collect()
DETAIL: .collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/services/usersService.ts:64
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/services/usersService.ts:74
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/tenantsMigration.test.ts:127
ISSUE: potential over-fetch: .collect()
DETAIL: const tenantOrgLinks = await t.run(async (ctx) => ctx.db.query("tenantOrgLinks").collect());
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/tenantsMigration.test.ts:128
ISSUE: potential over-fetch: .collect()
DETAIL: const profiles = await t.run(async (ctx) => ctx.db.query("userProfiles").collect());
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/tenantsMigration.ts:34
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/tenantsMigration.ts:35
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/tenantsMigration.ts:36
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/tenantsMigration.ts:37
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("organizationMemberships").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/tenantsMigration.ts:38
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("teamInvites").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/tenantsMigration.ts:39
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:5
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:6
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("users").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:7
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:8
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:9
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:10
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:11
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("subscriptions").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:12
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:40
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantThreads").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:41
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("assistantMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:42
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxMessages").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:43
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("knowledgeResearch").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:44
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("searchLogs").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:45
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("offers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:46
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxConversationParticipants").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:47
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("inboxConversations").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:48
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("workspaceNotifications").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:49
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("orders").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/detail/sources.ts:50
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("deals").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminMemberships.ts:51
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminMemberships.ts:52
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminMemberships.ts:53
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminMemberships.ts:54
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminProfiles.ts:52
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminProfiles.ts:53
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminProfiles.ts:54
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminProfiles.ts:55
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminUsers.ts:32
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminUsers.ts:33
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("users").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminUsers.ts:34
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminUsers.ts:35
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminUsers.ts:36
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("tenantOrgLinks").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminUsers.ts:37
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminUserVerification.ts:21
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/users/listAdminUserVerification.ts:22
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("verificationRequests").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/verifications.ts:19
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/verifications.ts:21
ISSUE: potential over-fetch: .collect()
DETAIL: return ctx.db.query("verificationRequests").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/verifications.ts:26
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("userProfiles").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/verifications.ts:27
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("brokers").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/verifications.ts:28
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("RED").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/verifications.ts:29
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/admin_zone/verifications.ts:255
ISSUE: potential over-fetch: .collect()
DETAIL: const requests = await ctx.db.query("verificationRequests").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/ai_zone/assistantWorkspace.streamEvents.ts:157
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/ai_zone/assistantWorkspace.streamEvents.ts:190
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/ai_zone/assistantWorkspace.streamEvents.ts:212
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/ai_zone/assistantWorkspace.streamMaintenance.ts:16
ISSUE: potential over-fetch: .collect()
DETAIL: const events = await ctx.db.query("assistantStreamEvents").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/ai_zone/services/assistantService/threads.ts:67
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/ai_zone/services/assistantService/threads.ts:73
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/ai_zone/services/assistantService/threads.ts:104
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/ai_zone/services/assistantService/threads.ts:175
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/broker_zone/repositories/overviewRepository.ts:16
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/red_zone/repositories/overviewRepository.ts:16
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/agencies/repositories/directory.helpers.ts:60
ISSUE: potential over-fetch: .collect()
DETAIL: const offers = await offersQuery.collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/agencies/repositories/directory.helpers.ts:72
ISSUE: potential over-fetch: .collect()
DETAIL: const publishedOffers = await offersQuery.collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/agencies/repositories/directory.ts:106
ISSUE: potential over-fetch: .collect()
DETAIL: .collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/agencies/repositories/directory.ts:203
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/agencies/repositories/invites.helpers.ts:76
ISSUE: potential over-fetch: .collect()
DETAIL: const invitedProfile = (await ctx.db.query("userProfiles").collect()).find(
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/content/queries.ts:28
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/content/queries.ts:30
ISSUE: potential over-fetch: .collect()
DETAIL: return ctx.db.query("knowledgePages").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/crm/repositories.ts:36
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/crm/repositories.ts:49
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/crm/repositories.ts:62
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/inbox/conversations.ts:281
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/inbox/profiles.ts:31
ISSUE: potential over-fetch: .collect()
DETAIL: const profiles = await ctx.db.query("userProfiles").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/inbox/queries.ts:27
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/inbox/queries.ts:61
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/inbox/queries.ts:77
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/inbox/queries.ts:270
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/knowledge/index.ts:26
ISSUE: potential over-fetch: .collect()
DETAIL: const pages = await ctx.db.query("knowledgePages").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/market.ts:122
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("properties").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/market.ts:123
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("knowledgeResearch").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/market.ts:124
ISSUE: potential over-fetch: .collect()
DETAIL: ctx.db.query("searchLogs").collect(),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/memory/repository/getRelevantContextInternal.ts:26
ISSUE: potential over-fetch: .collect()
DETAIL: .collect()
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/memory/repository/getRelevantContextInternal.ts:36
ISSUE: potential over-fetch: .collect()
DETAIL: .collect()
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/memory/repository/getRelevantContextInternal.ts:46
ISSUE: potential over-fetch: .collect()
DETAIL: .collect()
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/memory/repository/getRelevantMemoriesByQuery.ts:18
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/notifications.ts:252
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/authorizations.ts:19
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/authorizations.ts:97
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/delegated.ts:51
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/delegated.ts:106
ISSUE: potential over-fetch: .collect()
DETAIL: ? ctx.db.query("properties").withIndex("brokerId", (q) => q.eq("brokerId", args.brokerId!)).collect()
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/delegated.ts:109
ISSUE: potential over-fetch: .collect()
DETAIL: ? ctx.db.query("properties").withIndex("REDId", (q) => q.eq("REDId", args.REDId!)).collect()
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/tokens.test.ts:128
ISSUE: potential over-fetch: .collect()
DETAIL: const refreshFamily = await t.run(async (ctx) => ctx.db.query("oauthRefreshTokens").withIndex("familyId", (q) => q.eq("familyId", seeded.familyId)).collect());
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/tokens.test.ts:148
ISSUE: potential over-fetch: .collect()
DETAIL: t.run(async (ctx) => ctx.db.query("oauthRefreshTokens").withIndex("familyId", (q) => q.eq("familyId", seeded.familyId)).collect()),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/tokens.test.ts:149
ISSUE: potential over-fetch: .collect()
DETAIL: t.run(async (ctx) => ctx.db.query("oauthAccessTokens").withIndex("clientId", (q) => q.eq("clientId", seeded.clientId)).collect()),
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/tokens.test.ts:182
ISSUE: potential over-fetch: .collect()
DETAIL: const accessTokens = await t.run(async (ctx) => ctx.db.query("oauthAccessTokens").withIndex("clientId", (q) => q.eq("clientId", seeded.clientId)).collect());
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/tokens.ts:162
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/tokens/accessLifecycle.ts:20
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/oauth/internal/tokens/common.ts:10
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/offers/mutations/sideEffects.ts:12
ISSUE: potential over-fetch: .collect()
DETAIL: const profiles = await ctx.db.query("userProfiles").collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/offers/queries.ts:50
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/offers/queries.ts:57
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/offers/queries.ts:79
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/offers/queries.ts:86
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/offers/queries.ts:107
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/properties/history.ts:134
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/properties/history.ts:156
ISSUE: potential over-fetch: .collect()
DETAIL: .collect();
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

FILE: convex/shared_logic/verifications/index.test.ts:64
ISSUE: potential over-fetch: .collect()
DETAIL: const requests = await t.run((ctx) => ctx.db.query("verificationRequests").collect());
FIX: Confirm dataset is bounded; otherwise replace with indexed/paginated query or a precomputed projection.

</details>

<details>
<summary>Full List: Convex .filter((q)=>...) (3)</summary>

FILE: convex/broker_zone/repositories/propertiesRepository.ts:56
ISSUE: query-builder filter callback may imply scan
DETAIL: .filter((q) => q.eq(q.field("status"), status))
FIX: Verify an appropriate index exists and is used; otherwise refactor to .withIndex(...) or add an index in schema.

FILE: convex/red_zone/repositories/propertiesRepository.ts:56
ISSUE: query-builder filter callback may imply scan
DETAIL: .filter((q) => q.eq(q.field("status"), status))
FIX: Verify an appropriate index exists and is used; otherwise refactor to .withIndex(...) or add an index in schema.

FILE: convex/shared_logic/offers/queries.ts:106
ISSUE: query-builder filter callback may imply scan
DETAIL: .filter((q) => q.eq(q.field("status"), "pending"))
FIX: Verify an appropriate index exists and is used; otherwise refactor to .withIndex(...) or add an index in schema.

</details>

# 7. CODE REVIEW SUMMARY

(Manual summary buckets [CRITICAL]/[WARNING]/[SUGGESTION]/[GOOD] should be populated after manual review.)
