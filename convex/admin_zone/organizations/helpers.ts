import { ConvexError } from "convex/values";

export function buildOrganizationKey(ownerType: "broker" | "red", id: string) {
  return `${ownerType}__${id}`;
}

export function parseOrganizationKey(value: string) {
  if (value.startsWith("broker__")) {
    return { ownerType: "broker" as const, id: value.slice("broker__".length) };
  }

  if (value.startsWith("red__")) {
    return { ownerType: "red" as const, id: value.slice("red__".length) };
  }

  throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Invalid organization key" });
}

export function buildOrganizationProjection(
  args: {
    brokerId?: string | null;
    redId?: string | null;
  },
  brokers: Array<{ _id: unknown; name: string; isVerified?: boolean | null; status?: string | null; slug?: string | null }>,
  developers: Array<{ _id: unknown; name: string; isVerified?: boolean | null; status?: string | null; slug?: string | null }>
) {
  if (args.brokerId) {
    const broker = brokers.find((item) => String(item._id) === String(args.brokerId));
    return {
      id: String(args.brokerId),
      organizationKey: buildOrganizationKey("broker", String(args.brokerId)),
      ownerType: "broker" as const,
      name: broker?.name ?? "وسيط غير معروف",
      isVerified: broker?.isVerified === true,
      status: broker?.status ?? "pending",
      slug: broker?.slug ?? null,
    };
  }

  if (args.redId) {
    const developer = developers.find((item) => String(item._id) === String(args.redId));
    return {
      id: String(args.redId),
      organizationKey: buildOrganizationKey("red", String(args.redId)),
      ownerType: "red" as const,
      name: developer?.name ?? "مطور غير معروف",
      isVerified: developer?.isVerified === true,
      status: developer?.status ?? "pending",
      slug: developer?.slug ?? null,
    };
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

