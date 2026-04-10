import { buildOrganizationKey } from "./helpers";

function countActiveMembers(members: Array<{ status?: string }>) {
  return members.filter((member) => (member.status ?? "active") === "active").length;
}

function countPendingVerifications(
  requests: any[],
  matcher: (request: any) => boolean,
) {
  return requests.filter((request) => {
    const pending = request.currentStatus === "new" || request.currentStatus === "in_review";
    return pending && matcher(request);
  }).length;
}

export function buildTenantMap(
  links: any[],
  ownerKey: "ownerBrokerId" | "ownerREDId",
) {
  const tenantMap = new Map<string, string>();
  for (const link of links) {
    const ownerId = link[ownerKey];
    if (ownerId) {
      tenantMap.set(String(ownerId), link.tenantOrgId);
    }
  }
  return tenantMap;
}

export function buildBrokerSummary(args: {
  broker: any;
  profiles: any[];
  properties: any[];
  verificationRequests: any[];
  members: Array<{ status?: string }>;
}) {
  const { broker, profiles, properties, verificationRequests, members } = args;
  return {
    organizationKey: buildOrganizationKey("broker", String(broker._id)),
    id: String(broker._id),
    ownerType: "broker" as const,
    name: broker.name,
    slug: broker.slug,
    status: broker.status ?? "pending",
    isVerified: broker.isVerified === true,
    contactEmail: broker.contactEmail,
    linkedProfilesCount: profiles.filter((profile: any) => profile.brokerId === broker._id).length,
    membersCount: countActiveMembers(members),
    propertyCount: properties.filter((property: any) => property.brokerId === broker._id).length,
    pendingVerificationCount: countPendingVerifications(
      verificationRequests,
      (request) => request.subjectBrokerId === broker._id,
    ),
  };
}

export function buildDeveloperSummary(args: {
  developer: any;
  profiles: any[];
  properties: any[];
  verificationRequests: any[];
  members: Array<{ status?: string }>;
}) {
  const { developer, profiles, properties, verificationRequests, members } = args;
  return {
    organizationKey: buildOrganizationKey("red", String(developer._id)),
    id: String(developer._id),
    ownerType: "red" as const,
    name: developer.name,
    slug: developer.slug,
    status: developer.status ?? "pending",
    isVerified: developer.isVerified === true,
    contactEmail: developer.contactEmail,
    linkedProfilesCount: profiles.filter((profile: any) => profile.developerId === developer._id).length,
    membersCount: countActiveMembers(members),
    propertyCount: properties.filter((property: any) => property.REDId === developer._id).length,
    pendingVerificationCount: countPendingVerifications(
      verificationRequests,
      (request) => request.subjectREDId === developer._id,
    ),
  };
}
