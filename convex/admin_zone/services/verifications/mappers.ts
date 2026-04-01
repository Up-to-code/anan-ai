import type {
  VerificationBrokerRecord,
  VerificationLookups,
  VerificationPropertyRecord,
  VerificationRequestRecord,
} from "../../../shared_logic/verifications/types";

function findVerificationEntities(
  request: VerificationRequestRecord,
  lookups: VerificationLookups,
) {
  const profile = request.subjectProfileId
    ? lookups.profiles.find((item) => item._id === request.subjectProfileId)
    : null;
  const broker = request.subjectBrokerId
    ? lookups.brokers.find((item) => item._id === request.subjectBrokerId)
    : null;
  const developer = request.subjectREDId
    ? lookups.developers.find((item) => item._id === request.subjectREDId)
    : null;
  const property = request.subjectPropertyId
    ? lookups.properties.find((item) => item._id === request.subjectPropertyId)
    : null;

  return { profile, broker, developer, property };
}

function resolvePropertyOwner(
  property: VerificationPropertyRecord | null | undefined,
  lookups: VerificationLookups,
) {
  if (!property) return null;
  if (property.brokerId) {
    return lookups.brokers.find((item) => item._id === property.brokerId) ?? null;
  }
  if (property.REDId) {
    return lookups.developers.find((item) => item._id === property.REDId) ?? null;
  }
  return null;
}

/**
 * WHY:   Admin verification lists need one consistent summary shape for cards and tables.
 * WHAT:  Maps a verification request into its list-item projection.
 * HOW:   Joins request rows with profile, organization, and property lookups to derive display labels.
 */
export function buildVerificationListItem(
  request: VerificationRequestRecord,
  lookups: VerificationLookups,
) {
  const entities = findVerificationEntities(request, lookups);
  const propertyOwner = resolvePropertyOwner(entities.property, lookups);

  return {
    ...request,
    subjectName:
      entities.profile?.name ??
      entities.profile?.email ??
      entities.broker?.name ??
      entities.developer?.name ??
      entities.property?.title ??
      request.title ??
      request.requestType,
    organizationName:
      entities.broker?.name ??
      entities.developer?.name ??
      propertyOwner?.name ??
      null,
    documentsCount: request.attachedDocuments.length,
  };
}

/**
 * WHY:   Verification detail pages need a typed subject block instead of ad-hoc lookup code in the handler.
 * WHAT:  Builds the subject detail payload for one verification request.
 * HOW:   Resolves the related profile, broker, developer, and property rows from the admin lookups.
 */
export function buildVerificationSubjectDetail(
  request: VerificationRequestRecord,
  lookups: VerificationLookups,
) {
  const entities = findVerificationEntities(request, lookups);

  return {
    profile: entities.profile
      ? {
          id: String(entities.profile._id),
          name: entities.profile.name ?? entities.profile.email ?? "مستخدم عنان",
          email: entities.profile.email ?? null,
          role: entities.profile.role ?? null,
          roleStatus: entities.profile.roleStatus ?? null,
        }
      : null,
    broker: entities.broker
      ? {
          id: String(entities.broker._id),
          name: entities.broker.name,
          status: entities.broker.status ?? null,
          isVerified: entities.broker.isVerified === true,
        }
      : null,
    developer: entities.developer
      ? {
          id: String(entities.developer._id),
          name: entities.developer.name,
          status: entities.developer.status ?? null,
          isVerified: entities.developer.isVerified === true,
        }
      : null,
    property: entities.property
      ? {
          id: String(entities.property._id),
          title: entities.property.title,
          address: entities.property.address,
          adLicenseNumber: entities.property.adLicenseNumber ?? null,
          adLicenseStatus: entities.property.adLicenseStatus ?? null,
        }
      : null,
  };
}

/**
 * WHY:   Review timelines should be built once so the admin detail handler stays thin.
 * WHAT:  Returns the decision-history timeline for one verification request.
 * HOW:   Always emits the submitted item and conditionally appends the reviewed/closed item.
 */
export function buildVerificationDecisionHistory(
  request: VerificationRequestRecord,
) {
  const submittedItem = {
    id: `${String(request._id)}-submitted`,
    label: "تم الإرسال",
    createdAt: request.submittedAt,
    notes: null,
    status: "new" as const,
  };

  if (!request.reviewedAt) {
    return [submittedItem];
  }

  return [
    submittedItem,
    {
      id: `${String(request._id)}-reviewed`,
      label: request.currentStatus === "closed" ? "تم الإغلاق" : "تمت المراجعة",
      createdAt: request.reviewedAt,
      notes: request.reviewerNotes ?? null,
      status: request.currentStatus,
    },
  ];
}

export function countStatus(
  requests: VerificationRequestRecord[],
  status: VerificationRequestRecord["currentStatus"],
) {
  return requests.filter((request) => request.currentStatus === status).length;
}
