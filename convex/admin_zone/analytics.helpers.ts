type Range = "day" | "week" | "month";

export function getLookbackMs(range: Range) {
  switch (range) {
    case "day":
      return 24 * 60 * 60 * 1000;
    case "week":
      return 7 * 24 * 60 * 60 * 1000;
    case "month":
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

export function getBucketMs(range: Range) {
  return range === "day" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
}

export function toBucketLabels(buckets: Map<number, number>) {
  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .map(([timestamp, value]) => ({
      label: new Date(timestamp).toISOString().slice(0, 10),
      value,
    }));
}

export function buildOrganizationProjection(
  args: {
    brokerId?: string | null;
    redId?: string | null;
  },
  brokers: Array<{ _id: unknown; name: string }>,
  developers: Array<{ _id: unknown; name: string }>,
) {
  if (args.brokerId) {
    const broker = brokers.find((item) => String(item._id) === String(args.brokerId));
    return {
      organizationKey: `broker__${String(args.brokerId)}`,
      ownerType: "broker" as const,
      name: broker?.name ?? "وسيط غير معروف",
    };
  }

  if (args.redId) {
    const developer = developers.find((item) => String(item._id) === String(args.redId));
    return {
      organizationKey: `red__${String(args.redId)}`,
      ownerType: "red" as const,
      name: developer?.name ?? "مطور غير معروف",
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
