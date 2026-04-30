import type { LocationValue } from "@anan/location-map";

/**
 * WHY:   The workspace now needs one shared UI model for people, projects, units, market insights, and threaded offer activity.
 * WHAT:  Exports serializable frontend-facing entity types used across projects, offers, CRM, AI, and organization settings.
 * HOW:   Keeps the models UI-oriented so pages can share card components without leaking backend table details.
 */

export type UnitReference = {
  id: string;
  label: string;
  unitKind?: "unit_type" | "unit";
  status?: "available" | "reserved" | "sold" | "draft";
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  sizeSqm?: number;
  floor?: string;
  view?: string;
  price?: number;
  priceLabel?: string;
  handoverAt?: number;
  location?: LocationValue | null;
  floorPlanMedia?: import("@/server/contracts/files").UploadedFileReference[];
};

export type ProjectReference = {
  id: string;
  title: string;
  location: string;
  locationDetails?: LocationValue | null;
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

export type { AgUiActionDefinition, AgUiDraftState, AgUiExecutionState } from "@anan/ag-ui";

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
  authUserId: string;
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
