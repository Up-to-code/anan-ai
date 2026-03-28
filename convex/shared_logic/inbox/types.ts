export type OfferCardMetadata = {
  contextType: "offer_card";
  bootstrapSource: "offer_send" | "offer_apply" | "offer_detail";
  offerId: string;
  propertyId: string;
  offerTitle: string;
  authorName: string;
  organizationName: string;
  price: number;
  visibility: "public" | "private";
  href: string;
  recipientAuthUserId?: string;
};

export type CollaborationActor = {
  authUserId: string;
  name: string;
  role: "broker" | "developer" | "user" | "admin";
  organizationId?: string | null;
  organizationType?: "broker" | "developer" | null;
  organizationName?: string | null;
};

export type CollaborationRecipient = {
  recipientAuthUserId: string;
  organizationId?: string | null;
  organizationType?: "broker" | "developer" | null;
  organizationName?: string | null;
};

export type CollaborationAction = {
  type:
    | "open_file"
    | "open_project"
    | "open_deal"
    | "open_offer"
    | "open_invite"
    | "open_membership";
  label: string;
  href: string;
};

export type FileShareMetadata = {
  contextType: "file_share";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  file: {
    key: string;
    url: string;
    name: string;
    size?: number;
    mime?: string;
  };
};

export type ProjectShareMetadata = {
  contextType: "project_share";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  propertyId: string;
  location?: string | null;
  imageUrl?: string | null;
};

export type DealShareMetadata = {
  contextType: "deal_share";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  dealId: string;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  value?: number | null;
  propertyId?: string | null;
};

export type InviteEventMetadata = {
  contextType: "invite_event";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  inviteId: string;
  inviteRole: "manager" | "member" | "viewer";
  inviteStatus: "pending" | "accepted" | "canceled";
  organizationName: string;
  organizationType: "broker" | "developer";
};

export type RoleEventMetadata = {
  contextType: "role_event";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  membershipId: string;
  organizationRole: "manager" | "member" | "viewer";
  previousRole?: "manager" | "member" | "viewer" | null;
  organizationName: string;
  organizationType: "broker" | "developer";
};

export type EnsureOfferConversationStarterResult = {
  conversationId: string;
  recipientUserId: string;
  starterMessageCreated: boolean;
};

export function isOfferCardMetadata(value: unknown): value is OfferCardMetadata {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<OfferCardMetadata>;
  return (
    candidate.contextType === "offer_card" &&
    typeof candidate.offerId === "string" &&
    typeof candidate.propertyId === "string" &&
    typeof candidate.offerTitle === "string" &&
    typeof candidate.authorName === "string" &&
    typeof candidate.organizationName === "string" &&
    typeof candidate.price === "number" &&
    (candidate.visibility === "public" || candidate.visibility === "private") &&
    typeof candidate.href === "string"
  );
}
