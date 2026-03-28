import type { ConversationDetail, ConversationSummary } from "@/server/contracts/inbox";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";

export type InboxProjectOption = {
  id: string;
  title: string;
  location: string;
  imageUrl?: string | null;
  price?: number;
  shortDescription?: string;
  organizationName?: string | null;
  publicationState?: "published" | "draft" | "archived";
};

export type InboxDealOption = {
  id: string;
  title: string;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  value?: number;
  contactName?: string | null;
};

export type InboxWorkspaceClientProps = {
  canUseBusinessActions: boolean;
  currentUserId: string;
  dealOptions: InboxDealOption[];
  initialConversations: ConversationSummary[];
  initialConversation: ConversationDetail | null;
  initialSelectedConversationId: string | null;
  initialStartUserId?: string | null;
  hasConversationRoute: boolean;
  incomingInvites: IncomingOrganizationInvite[];
  projectOptions: InboxProjectOption[];
};
