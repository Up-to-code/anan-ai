export type AdminRange = "30d" | "90d";

export type OverviewMetric = {
  key: string;
  label: string;
  value: number;
  delta: number;
  hint: string;
};

export type OverviewChartPoint = {
  label: string;
  activeUsers: number;
};

export type OverviewDistributionPoint = {
  label: string;
  value: number;
  color: string;
};

export type OverviewCountPoint = {
  label: string;
  count: number;
  color: string;
};

export type ActivityFeedItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  createdAt: number;
};

export type QueueItem = {
  id: string;
  label: string;
  count: number;
  status: string;
  note: string;
};

export type ProjectStage = "draft" | "active";

export type ProjectRecord = {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  stage: ProjectStage;
  assistantEnabled: boolean;
  city: string;
  propertyCount: number;
  offerCount: number;
  updatedAt: number;
  summary: string;
};

export type PropertyRecord = {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  organizationId: string;
  organizationName: string;
  type: string;
  publicationStatus: string;
  inventoryStatus: string;
  price: number;
  city: string;
};

export type BankProductRecord = {
  id: string;
  name: string;
  reason: string;
  apr: number;
  termYears: number;
  assistantEnabled: boolean;
};

export type BankRecord = {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  status: string;
  assistantEnabled: boolean;
  notes: string;
  products: BankProductRecord[];
};

export type OrganizationRecord = {
  id: string;
  name: string;
  kind: "broker" | "developer";
  verificationStatus: string;
  documentationStatus: string;
  budgetBand: string;
  projectsCount: number;
  membersCount: number;
  offersCount: number;
  lastActiveAt: number;
};

export type UserRecord = {
  id: string;
  name: string;
  role: "admin" | "broker" | "developer" | "user";
  organizationId: string;
  organizationName: string;
  verificationStatus: string;
  status: string;
  lastActiveAt: number;
  email: string;
};

export type OfferRecord = {
  id: string;
  title: string;
  organizationId: string;
  organizationName: string;
  submittedBy: string;
  projectId: string;
  projectName: string;
  propertyId: string;
  propertyName: string;
  status: string;
  amount: number;
  createdAt: number;
  body: string;
  reviewHistory: Array<{
    id: string;
    action: string;
    actor: string;
    note: string;
    createdAt: number;
  }>;
};

export type KnowledgeItemRecord = {
  id: string;
  title: string;
  source: string;
  submittedBy: string;
  status: "pending" | "accepted" | "rejected";
  summary: string;
};

export type ModelRecord = {
  id: string;
  name: string;
  provider: string;
  team: string;
  status: string;
  monthlyTokens: number;
  burnedTokens: number;
  pricePerMillion: number;
};

export type AgentTeamRecord = {
  id: string;
  name: string;
  defaultModel: string;
  fallbackModel: string;
  enabled: boolean;
  routingRule: string;
  budgetLimit: number;
};

export type TeamMemberRecord = {
  id: string;
  name: string;
  email: string;
  team: string;
  permission: string;
  status: string;
};
