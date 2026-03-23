import { paginationOptsValidator } from "convex/server";

export type PaginationOpts = typeof paginationOptsValidator.type;

export function paginateRows<T>(
  rows: T[],
  paginationOpts: { cursor: string | null; numItems: number }
) {
  const offset = paginationOpts.cursor ? Number(paginationOpts.cursor) : 0;
  const page = rows.slice(offset, offset + paginationOpts.numItems);
  const nextOffset = offset + paginationOpts.numItems;

  return {
    page,
    isDone: nextOffset >= rows.length,
    continueCursor: nextOffset >= rows.length ? null : String(nextOffset),
  };
}

export function buildUserKey(value: {
  authUserId?: string | null;
  externalUserId?: string | null;
  fallbackId: string;
}) {
  if (value.authUserId) {
    return `auth__${value.authUserId}`;
  }

  if (value.externalUserId) {
    return `channel__${value.externalUserId}`;
  }

  return `record__${value.fallbackId}`;
}

export function resolveVerificationStatus(
  latestStatus?: string | null,
  roleStatus?: string | null
) {
  return latestStatus ?? roleStatus ?? "none";
}

function buildBrokerProjection(
  brokerId: string,
  brokers: Array<{
    _id: unknown;
    name: string;
    isVerified?: boolean | null;
    status?: string | null;
    slug?: string | null;
  }>
) {
  const broker = brokers.find((item) => String(item._id) === String(brokerId));
  return {
    id: String(brokerId),
    organizationKey: `broker__${String(brokerId)}`,
    ownerType: "broker" as const,
    name: broker?.name ?? "وسيط غير معروف",
    isVerified: broker?.isVerified === true,
    status: broker?.status ?? "pending",
    slug: broker?.slug ?? null,
  };
}

function buildDeveloperProjection(
  redId: string,
  developers: Array<{
    _id: unknown;
    name: string;
    isVerified?: boolean | null;
    status?: string | null;
    slug?: string | null;
  }>
) {
  const developer = developers.find((item) => String(item._id) === String(redId));
  return {
    id: String(redId),
    organizationKey: `red__${String(redId)}`,
    ownerType: "red" as const,
    name: developer?.name ?? "مطور غير معروف",
    isVerified: developer?.isVerified === true,
    status: developer?.status ?? "pending",
    slug: developer?.slug ?? null,
  };
}

export function buildOrganizationProjection(
  args: {
    brokerId?: string | null;
    redId?: string | null;
  },
  brokers: Array<{
    _id: unknown;
    name: string;
    isVerified?: boolean | null;
    status?: string | null;
    slug?: string | null;
  }>,
  developers: Array<{
    _id: unknown;
    name: string;
    isVerified?: boolean | null;
    status?: string | null;
    slug?: string | null;
  }>
) {
  if (args.brokerId) {
    return buildBrokerProjection(args.brokerId, brokers);
  }

  if (args.redId) {
    return buildDeveloperProjection(args.redId, developers);
  }

  return null;
}

export function extractOfferIdFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const candidate = metadata as { offerId?: string };
  return typeof candidate.offerId === "string" ? candidate.offerId : null;
}
