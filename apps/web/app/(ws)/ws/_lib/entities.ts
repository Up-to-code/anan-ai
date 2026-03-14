/**
 * WHY:   The workspace now needs one shared UI model for people, projects, units, market insights, and threaded offer activity.
 * WHAT:  Exports serializable frontend-facing entity types used across projects, offers, CRM, AI, and organization settings.
 * HOW:   Keeps the models UI-oriented so pages can share card components without leaking backend table details.
 */

export type UnitReference = {
  id: string;
  label: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  priceLabel?: string;
};

export type ProjectReference = {
  id: string;
  title: string;
  location: string;
  image?: string;
  summary?: string;
};

export type PersonCardType = "broker" | "client";
export type PersonBadge = "verified" | "vip";

export type PersonRelation = {
  project: ProjectReference | null;
  unit: UnitReference | null;
  stageLabel?: string;
  summary?: string;
};

export type OfferThreadItem = {
  id: string;
  subject: string;
  status: "new" | "awaiting-response" | "approved" | "completed";
  sender: {
    name: string;
    type: PersonCardType | "developer";
  };
  recipient: {
    name: string;
    type: PersonCardType | "developer";
  };
  relation: PersonRelation;
  lastUpdate: string;
  nextAction: string;
  summary: string;
};

export type AgUiActionDefinition = {
  id:
    | "create_project"
    | "publish_offer"
    | "send_offer"
    | "latest_update"
    | "search_market"
    | "search_project"
    | "search_broker_demand";
  title: string;
  zone: "projects" | "offers" | "crm" | "market";
  fields: string[];
};

export type AgUiExecutionState = "draft" | "collecting" | "ready" | "executing" | "completed" | "failed";

export type AgUiDraftState = {
  actionId: AgUiActionDefinition["id"];
  title: string;
  description: string;
  fields: Record<string, string>;
  missingFields: string[];
  zone: AgUiActionDefinition["zone"];
  relation?: PersonRelation | null;
  state: AgUiExecutionState;
};

export type MarketAreaInsight = {
  city: string;
  area: string;
  demandLevel: "hot" | "warm" | "cold";
  averagePriceLabel: string;
  topConfiguration: string;
  speedToSell: string;
  recommendation: string;
};

export type OrganizationMemberDisplay = {
  id: string;
  membershipId: string;
  name: string;
  email: string;
  username?: string;
  role: "manager" | "member" | "viewer";
  statusLabel: string;
};

export type OrganizationInviteDisplay = {
  id: string;
  email: string;
  role: "manager" | "member" | "viewer";
  status: "pending" | "accepted" | "canceled";
  expiresLabel: string;
};
