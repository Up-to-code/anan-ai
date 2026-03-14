import { requireAdminSession } from "@/server/auth/guards";
import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminUsersRepository } from "@/server/infrastructure/convex/adminUsersRepository";

/**
 * WHY:   Admin pages should not repeat session resolution and token plumbing for user management.
 * WHAT:  Exposes server-side readers and writers for the users list and detail screens.
 * HOW:   Requires an admin session, then delegates to the users repository.
 */
export async function getAdminUsersPageData(input: {
  tab?: "users" | "profiles" | "memberships" | "verification";
  role?: "admin" | "broker" | "developer" | "user" | "RED";
  cursor?: string | null;
  numItems?: number;
}) {
  const session = await requireAdminPageSession("/users");
  const paginationOpts = {
    numItems: input.numItems ?? 20,
    cursor: input.cursor ?? null,
  };
  const tab = input.tab ?? "users";
  const users =
    tab === "profiles"
      ? await convexAdminUsersRepository.listAdminProfiles(session.token, { paginationOpts })
      : tab === "memberships"
        ? await convexAdminUsersRepository.listAdminMemberships(session.token, { paginationOpts })
        : tab === "verification"
          ? await convexAdminUsersRepository.listAdminUserVerification(session.token, { paginationOpts })
          : await convexAdminUsersRepository.listAdminUsers(session.token, {
              paginationOpts,
              role: input.role,
            });

  return { session, tab, users };
}

/**
 * WHY:   The user detail page needs all related operational panels loaded together.
 * WHAT:  Returns the admin user detail record plus related research, logs, and memory items.
 * HOW:   Resolves the admin session once, then loads each dataset in parallel.
 */
export async function getAdminUserDetailPageData(userKey: string) {
  const session = await requireAdminPageSession(`/users/${encodeURIComponent(userKey)}`);
  const detail = await convexAdminUsersRepository.getDetail(session.token, userKey);

  return {
    session,
    detail,
  };
}

/**
 * WHY:   User edits should flow through one admin-only server entrypoint.
 * WHAT:  Updates the editable user fields allowed by the backend.
 * HOW:   Requires an admin session, then forwards the patch to the users repository.
 */
export async function updateAdminUser(input: {
  userId: string;
  displayName?: string;
  channel?: "whatsapp" | "app" | "web";
}) {
  const session = await requireAdminSession();
  await convexAdminUsersRepository.update(session.token, input);
}
