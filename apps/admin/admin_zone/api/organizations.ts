import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminOrganizationsRepository } from "@/server/infrastructure/convex/adminOrganizationsRepository";

/**
 * WHY:   Organization routes should not know how tokens or Convex references are wired.
 * WHAT:  Exposes server-side loaders for organization tab pages and organization detail tabs.
 * HOW:   Resolves the admin session once, then delegates to the organizations repository.
 */
export async function getOrganizationsPageData(tab: "brokers" | "developers" | "memberships" | "invites") {
  const session = await requireAdminPageSession("/organizations");
  const token = session.token;

  if (tab === "brokers") {
    return { session, tab, rows: await convexAdminOrganizationsRepository.listBrokers(token) };
  }

  if (tab === "developers") {
    return { session, tab, rows: await convexAdminOrganizationsRepository.listDevelopers(token) };
  }

  if (tab === "memberships") {
    return { session, tab, rows: await convexAdminOrganizationsRepository.listMemberships(token) };
  }

  return { session, tab, rows: await convexAdminOrganizationsRepository.listInvites(token) };
}

/**
 * WHY:   Organization detail screens need one admin-owned loader that resolves the selected organization and its related tabs.
 * WHAT:  Returns the admin session plus the joined organization detail payload for the requested organization key.
 * HOW:   Encodes the route key into the page session path, then delegates the actual detail lookup to the repository.
 */
export async function getOrganizationDetailPageData(organizationKey: string) {
  const session = await requireAdminPageSession(`/organizations/${encodeURIComponent(organizationKey)}`);
  const detail = await convexAdminOrganizationsRepository.getDetail(session.token, organizationKey);

  return {
    session,
    detail,
  };
}
