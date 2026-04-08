"use server";

import { getWorkspaceLocale } from "../../_lib/workspaceLocale";
import { normalizeDomainError } from "@/server/contracts/errors";
import type { UpdateProfileInput } from "@/server/contracts/profiles";
import { updateCurrentProfileForCurrentUser } from "@/server/domains/auth/profiles/service";

/**
 * WHY:   The account center should update the current profile without going through an app-internal HTTP route.
 * WHAT:  Executes the current-user profile update and returns a stable UI-friendly result.
 * HOW:   Delegates to the profile domain service, then normalizes any thrown domain/transport error into a message.
 */
export async function saveProfileAction(
  input: UpdateProfileInput,
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  try {
    const locale = await getWorkspaceLocale();
    await updateCurrentProfileForCurrentUser(input);
    return {
      ok: true,
      message:
        locale === "en"
          ? "Changes saved successfully."
          : locale === "fr"
            ? "Les modifications ont ete enregistrees avec succes."
            : "تم حفظ التعديلات بنجاح.",
    };
  } catch (error) {
    return { ok: false, message: normalizeDomainError(error).message };
  }
}
