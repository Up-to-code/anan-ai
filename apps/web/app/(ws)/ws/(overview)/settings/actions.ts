"use server";

import { normalizeDomainError } from "@/server/contracts/errors";
import { createOrganizationInviteInputSchema, type CreateOrganizationInviteInput, type DirectorySearchResult, type UpdateOrganizationInput, type UpdateOrganizationMemberRoleInput } from "@/server/contracts/organizations";
import type { CreateOrganizationApiKeyInput, OrganizationApiKeySecretResult } from "@/server/contracts/organizationApiKeys";
import type { OrganizationSummary } from "@/server/contracts/organizations";
import {
  cancelCurrentOrganizationInvite,
  createCurrentOrganizationInvite,
  searchCurrentOrganizationDirectoryExact,
  updateCurrentOrganizationForCurrentUser,
  updateCurrentOrganizationMemberRole,
} from "@/server/domains/auth/organizations/service";
import {
  createCurrentOrganizationApiKeyForCurrentUser,
  revokeCurrentOrganizationApiKeyForCurrentUser,
} from "@/server/domains/auth/organizationApiKeys/service";
import { revokeAuthorizedAppForCurrentOrganization } from "@/server/domains/auth/oauth/service";

type ActionResult = { ok: true; message: string } | { ok: false; message: string };

/**
 * WHY:   Organization settings should submit through server actions instead of an internal route handler.
 * WHAT:  Updates the current organization's editable fields and returns a stable result envelope.
 * HOW:   Calls the organizations domain service directly and converts failures into user-facing messages.
 */
export async function saveOrganizationSettingsAction(
  input: UpdateOrganizationInput,
): Promise<ActionResult & { organization?: OrganizationSummary }> {
  try {
    const organization = await updateCurrentOrganizationForCurrentUser(input);
    return { ok: true, message: "تم تحديث بيانات المنظمة.", organization };
  } catch (error) {
    return { ok: false, message: normalizeDomainError(error).message };
  }
}

/**
 * WHY:   API key creation is an app-internal workspace command and does not need an internal HTTP hop.
 * WHAT:  Creates a current-organization API key and returns the one-time secret result envelope.
 * HOW:   Delegates to the API key domain service and preserves the current success message contract for the UI.
 */
export async function createOrganizationApiKeyAction(
  input: CreateOrganizationApiKeyInput,
): Promise<
  | { ok: true; message: string; result: OrganizationApiKeySecretResult }
  | { ok: false; message: string }
> {
  try {
    const result = await createCurrentOrganizationApiKeyForCurrentUser(input);
    return {
      ok: true,
      message: "تم إنشاء المفتاح. احفظ القيمة السرية الآن لأنها لن تظهر مرة أخرى.",
      result,
    };
  } catch (error) {
    return { ok: false, message: normalizeDomainError(error).message };
  }
}

/**
 * WHY:   API key revocation should stay inside the workspace app instead of posting to an internal API route.
 * WHAT:  Revokes one current-organization API key.
 * HOW:   Calls the domain service directly and returns the same status-style result the client already expects.
 */
export async function revokeOrganizationApiKeyAction(keyId: string): Promise<ActionResult> {
  try {
    await revokeCurrentOrganizationApiKeyForCurrentUser(keyId);
    return { ok: true, message: "تم إلغاء المفتاح ولن يعمل بعد الآن." };
  } catch (error) {
    return { ok: false, message: normalizeDomainError(error).message };
  }
}

/**
 * WHY:   Connected app revocation belongs inside organization settings alongside other integration controls.
 * WHAT:  Revokes one organization-owned OAuth app authorization.
 * HOW:   Delegates to the org OAuth domain service and returns the same compact action envelope used elsewhere in settings.
 */
export async function revokeOrganizationConnectedAppAction(clientId: string): Promise<ActionResult> {
  try {
    await revokeAuthorizedAppForCurrentOrganization(clientId);
    return { ok: true, message: "تم إلغاء ربط التطبيق عن هذه المنظمة." };
  } catch (error) {
    return { ok: false, message: normalizeDomainError(error).message };
  }
}

/**
 * WHY:   Member role updates are workspace-only commands and do not need an app-internal route boundary.
 * WHAT:  Updates one membership role in the current organization.
 * HOW:   Delegates to the organizations domain service and returns a compact success/failure envelope.
 */
export async function updateOrganizationMemberRoleAction(
  membershipId: string,
  input: UpdateOrganizationMemberRoleInput,
): Promise<ActionResult> {
  try {
    await updateCurrentOrganizationMemberRole(membershipId, input);
    return { ok: true, message: "ok" };
  } catch (error) {
    return { ok: false, message: normalizeDomainError(error).message };
  }
}

/**
 * WHY:   Pending team invites are managed inside the workspace settings UI and should skip internal HTTP routes.
 * WHAT:  Cancels one current-organization invite.
 * HOW:   Calls the organizations domain service directly and returns a stable UI result.
 */
export async function cancelOrganizationInviteAction(inviteId: string): Promise<ActionResult> {
  try {
    await cancelCurrentOrganizationInvite(inviteId);
    return { ok: true, message: "تم إلغاء الدعوة." };
  } catch (error) {
    return { ok: false, message: normalizeDomainError(error).message };
  }
}

/**
 * WHY:   Team invite creation belongs to the workspace settings surface and should not bounce through `/api/workspace/team-invites`.
 * WHAT:  Creates an invite for the current organization after validating the request payload.
 * HOW:   Reuses the shared invite schema, then delegates to the organizations domain service.
 */
export async function createOrganizationInviteAction(
  input: CreateOrganizationInviteInput,
): Promise<ActionResult & { inviteId?: string }> {
  const parsed = createOrganizationInviteInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid invite payload" };
  }

  try {
    const inviteId = await createCurrentOrganizationInvite(parsed.data);
    return { ok: true, message: "تم إرسال الدعوة بنجاح.", inviteId };
  } catch (error) {
    return { ok: false, message: normalizeDomainError(error).message };
  }
}

/**
 * WHY:   Exact-match directory lookup is an app-internal settings helper and should not require a Next route handler.
 * WHAT:  Searches the current organization directory by full email or username.
 * HOW:   Delegates to the organizations domain service and preserves the existing empty-result fallback for missing tenant orgs.
 */
export async function searchOrganizationDirectoryAction(
  query: string,
): Promise<{ ok: true; results: DirectorySearchResult[] } | { ok: false; message: string }> {
  try {
    return { ok: true, results: await searchCurrentOrganizationDirectoryExact(query) };
  } catch (error) {
    const domainError = normalizeDomainError(error);
    if (domainError.code === "FORBIDDEN" && domainError.message.includes("Tenant organization")) {
      return { ok: true, results: [] };
    }
    return { ok: false, message: domainError.message };
  }
}
