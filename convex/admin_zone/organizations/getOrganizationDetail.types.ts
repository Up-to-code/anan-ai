export type DetailCollections = {
  brokers: any[];
  developers: any[];
  tenantOrgLinks: any[];
  properties: any[];
  profiles: any[];
  verificationRequests: any[];
  subscriptions: any[];
  offers: any[];
  conversationParticipants: any[];
  conversations: any[];
  inboxMessages: any[];
  notifications: any[];
  orders: any[];
  deals: any[];
};

export type ParsedOrganization = { ownerType: "broker" | "red"; id: string };

export type ScopedOrganizationData = {
  tenantLink: any | null;
  organizationProperties: any[];
  linkedProfiles: any[];
  organizationVerifications: any[];
  organizationSubscription: any | null;
  participantRows: any[];
  organizationConversations: any[];
  organizationInboxMessages: any[];
  organizationNotifications: any[];
  organizationOrders: any[];
  organizationDeals: any[];
  authUserIds: Set<string>;
};
