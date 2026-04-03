# Upload + Persistence Audit (2026-04-03)

This audit summarizes every upload surface, how files are uploaded, where they are persisted, how they are retrieved, and the gaps resolved in this change set.

## Upload Surfaces

1. **Project/Property Media (Workspace Projects)**
   - **Upload mechanism:** UploadThing route `propertyMedia` (`apps/web/app/api/uploadthing/core.ts`).
   - **Persistence:** UploadThing completion → `shared_logic/uploadthing.trackUploadthingFile` → `organizationAssets` (category `project_image`).
   - **Retrieval:** UI stores `UploadedFileReference[]` on the property; asset registry can be queried via `shared_logic/organizationAssets.listProjectAssetsForViewer`.

2. **Offer Attachments**
   - **Upload mechanism:** UploadThing route `offerAttachments`.
   - **Persistence:** UploadThing completion → `organizationAssets` (category `offer_attachment`).
   - **Retrieval:** Offer payload stores attachments in `offerPackages`; assets now explicitly attached to the `offerCases` id for lifecycle and access controls.

3. **Inbox File Share**
   - **Upload mechanism:** UploadThing route `crmDocuments` (now used for inbox file share).
   - **Persistence:** UploadThing completion → `organizationAssets` (category `chat_attachment`).
   - **Retrieval:** Shared file metadata stored in inbox message payload; assets now attached to the `inboxConversations` id for lifecycle and auditability.

4. **Organization Verification Documents**
   - **Upload mechanism:** UploadThing route `verificationDocuments`.
   - **Persistence:** UploadThing completion → `organizationAssets` (category `verification_document`) and `verificationRequests.attachedDocuments`.
   - **Retrieval:** Verification review surfaces read from `verificationRequests`.

5. **Property Verification (Ad License) Documents**
   - **Upload mechanism:** UploadThing route `verificationDocuments`.
   - **Persistence:** Stored in `verificationRequests.attachedDocuments`; property updated with `adLicenseStatus` and `adLicenseVerificationRequestId`.
   - **Retrieval:** Property and verification request detail views.

6. **Assistant Voice Notes / Attachments**
   - **Upload mechanism:** Convex storage `generateUploadUrl` from `ai_zone/assistantWorkspace.generateVoiceUploadUrl`.
   - **Persistence:** Storage object stored in `_storage`, then finalized into `UploadedFileReference[]` via `finalizeUploadedFiles`.
   - **Retrieval:** Assistant thread messages reference `attachments` in metadata.

## Gaps Addressed

- **Offer attachments were not linked to `organizationAssets` for the offer case.**
  - Fixed by attaching asset keys to the `offerCases` id on create + update.
- **Inbox file shares were miscategorized and not attached to conversation entities.**
  - Fixed by routing inbox file shares through `crmDocuments` and attaching assets to the `inboxConversations` id before sending the message.
- **Mock data could silently bleed into production.**
  - Added `NEXT_PUBLIC_MOCK_DATA_ENABLED` to explicitly gate mock/fallback behavior.
