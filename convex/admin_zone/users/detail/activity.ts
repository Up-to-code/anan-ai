function buildNotificationRows(relevantNotifications: any[]) {
  return relevantNotifications
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 10)
    .map((item) => ({
      id: String(item._id),
      type: item.type,
      title: item.title,
      summary: item.summary,
      href: item.href,
      severity: item.severity,
      readAt: item.readAt ?? null,
      createdAt: item.createdAt,
    }));
}

function buildOrderRows(relevantOrders: any[]) {
  return relevantOrders
    .sort((left, right) => (right._creationTime ?? 0) - (left._creationTime ?? 0))
    .slice(0, 10)
    .map((item) => ({
      id: String(item._id),
      type: item.type,
      status: item.status,
      sourceChannel: item.sourceChannel ?? null,
      notes: item.notes ?? null,
      createdAt: item._creationTime ?? 0,
    }));
}

function buildDealRows(relevantDeals: any[]) {
  return relevantDeals
    .sort(
      (left, right) =>
        Number(String(right._creationTime ?? 0)) - Number(String(left._creationTime ?? 0))
    )
    .slice(0, 10)
    .map((item) => ({
      id: String(item._id),
      title: item.title,
      stage: item.stage,
      value: item.value ?? null,
      propertyId: item.propertyId ? String(item.propertyId) : null,
      offerId: item.offerId ? String(item.offerId) : null,
      createdAt: item._creationTime ?? 0,
    }));
}

export function buildAdminUserActivityRows(args: {
  relevantNotifications: any[];
  relevantOrders: any[];
  relevantDeals: any[];
}) {
  const notificationRows = buildNotificationRows(args.relevantNotifications);
  const orderRows = buildOrderRows(args.relevantOrders);
  const dealRows = buildDealRows(args.relevantDeals);
  return { dealRows, notificationRows, orderRows };
}

