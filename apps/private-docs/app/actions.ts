"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  buildUnlockHref,
  grantPrivateDocsAccess,
  isValidPrivateDocsPin,
  sanitizePrivateDocsReturnTo,
} from "@/lib/privateAccess";

/**
 * WHY:   The private docs app needs one server-owned unlock action so the PIN is never validated on the client.
 * WHAT:  Validates the submitted PIN, issues the access cookie, and redirects to the requested docs destination.
 * HOW:   Reads the form body in a server action, compares against the internal hardcoded PIN, then sets an `HttpOnly` cookie on success.
 */
export async function unlockPrivateDocs(formData: FormData) {
  const returnTo = sanitizePrivateDocsReturnTo(formData.get("returnTo")?.toString() ?? null);
  const pin = formData.get("pin")?.toString() ?? "";

  if (!isValidPrivateDocsPin(pin)) {
    redirect(buildUnlockHref({ error: "invalid-pin", returnTo }));
  }

  const cookieStore = await cookies();
  grantPrivateDocsAccess(cookieStore);
  redirect(returnTo);
}
