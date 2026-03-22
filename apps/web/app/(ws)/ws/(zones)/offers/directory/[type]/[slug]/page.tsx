import { requireWorkspaceData } from "../../../../../_lib/workspaceData";
import { getOrganizationPublicProfile } from "@/server/domains/auth/organizations/service";
import { notFound } from "next/navigation";
import OrganizationProfileUI from "./OrganizationProfileUI";

/**
 * WHY:   Pivoting from profile lists to an organization-centric partner ecosystem.
 * WHAT:  Renders the specific directory profile for an organization, showing its published offers.
 * HOW:   Fetches the public organization summary and its linked offers from the organizations domain service.
 */
export default async function OrganizationProfilePageRoute({
  params,
}: {
  params: Promise<{ type: "broker" | "developer"; slug: string }>;
}) {
  const { type, slug } = await params;
  await requireWorkspaceData(`/ws/offers/directory/${type}/${slug}`);
  
  const profile = await getOrganizationPublicProfile(type, slug);
  if (!profile) notFound();

  return <OrganizationProfileUI profile={profile} type={type} />;
}
