/**
 * WHY:   The Real Estate OS schema and guards need one source of truth for domain literals.
 * WHAT:  Enum-like const objects used by Convex validators and application logic.
 * HOW:   Values remain plain strings so schema modules can convert them into v.literal unions.
 */

export const USER_PROFILE_ROLE = {
  AGENT: "agent",
  MANAGER: "manager",
  DEVELOPER_STAFF: "developer_staff",
  ADMIN: "admin",
} as const;

export const ORG_TYPE = {
  BROKER: "broker",
  DEVELOPER: "developer",
} as const;

export const SUBSCRIPTION_TIER = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export const ORG_MEMBERSHIP_ROLE = {
  MANAGER: "manager",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

export const INVITE_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  EXPIRED: "expired",
} as const;

export const CODE_CHALLENGE_METHOD = {
  S256: "S256",
} as const;

export const PROPERTY_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  SOLD: "sold",
  ARCHIVED: "archived",
} as const;

export const PROPERTY_TYPE = {
  APARTMENT: "apartment",
  VILLA: "villa",
  TOWNHOUSE: "townhouse",
  PENTHOUSE: "penthouse",
  COMMERCIAL: "commercial",
  LAND: "land",
} as const;

export const PROJECT_PHASE = {
  PLANNING: "planning",
  UNDER_CONSTRUCTION: "under_construction",
  READY: "ready",
} as const;

export const PROJECT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  SOLD_OUT: "sold_out",
  ARCHIVED: "archived",
} as const;

export const UNIT_TYPE = {
  STUDIO: "studio",
  ONE_BR: "1br",
  TWO_BR: "2br",
  THREE_BR: "3br",
  FOUR_BR_PLUS: "4br_plus",
  PENTHOUSE: "penthouse",
} as const;

export const UNIT_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  SOLD: "sold",
} as const;

export const MEDIA_TYPE = {
  IMAGE: "image",
  VIDEO: "video",
  FLOOR_PLAN: "floor_plan",
  TOUR_360: "360_tour",
} as const;

export const BROKER_AUTHORIZATION_STATUS = {
  ACTIVE: "active",
  REVOKED: "revoked",
  EXPIRED: "expired",
} as const;

export const AD_LICENSE_STATUS = {
  VALID: "valid",
  EXPIRED: "expired",
  PENDING: "pending",
} as const;

export const CONTACT_TYPE = {
  BUYER: "buyer",
  INVESTOR: "investor",
  TENANT: "tenant",
  PARTNER: "partner",
} as const;

export const DEAL_STAGE = {
  NEW: "new",
  CONTACTED: "contacted",
  VIEWING: "viewing",
  OFFER: "offer",
  CONTRACT: "contract",
  WON: "won",
  LOST: "lost",
} as const;

export const SALES_ORDER_ASSIGNEE_TYPE = {
  ORG: "org",
  PROFILE: "profile",
} as const;

export const SALES_ORDER_STATUS = {
  NEW: "new",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  CLOSED: "closed",
} as const;

export const OFFER_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
  BROKER_ONLY: "broker_only",
} as const;

export const OFFER_CASE_STATUS = {
  OPEN: "open",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export const CASE_PARTICIPANT_ROLE = {
  INVENTORY_OWNER: "inventory_owner",
  CLIENT_OWNER: "client_owner",
  EXECUTION_PARTNER: "execution_partner",
  OBSERVER: "observer",
} as const;

export const CASE_ACTIVITY_TYPE = {
  STAGE_CHANGED: "stage_changed",
  DOCUMENT_UPLOADED: "document_uploaded",
  PARTICIPANT_ADDED: "participant_added",
  OFFER_SUBMITTED: "offer_submitted",
} as const;

export const CONVERSATION_CHANNEL = {
  PLATFORM: "platform",
  WHATSAPP: "whatsapp",
  EMAIL: "email",
} as const;

export const CONVERSATION_STATUS = {
  OPEN: "open",
  RESOLVED: "resolved",
  ARCHIVED: "archived",
} as const;

export const MESSAGE_CONTENT_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  DOCUMENT: "document",
  SYSTEM: "system",
} as const;

export const ASSISTANT_THREAD_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;

export const ASSISTANT_MESSAGE_ROLE = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export const ANALYSIS_RUN_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  DONE: "done",
  FAILED: "failed",
} as const;

export const CONVERSATION_ANALYSIS_STATUS = {
  DRAFT: "draft",
  PROCESSING: "processing",
  DONE: "done",
  FAILED: "failed",
} as const;
