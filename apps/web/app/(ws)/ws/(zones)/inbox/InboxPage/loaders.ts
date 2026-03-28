import { getInboxConversation, listInboxConversations } from "@/server/domains/workspace/inbox/service";
import { listIncomingOrganizationInvitesForCurrentUser } from "@/server/domains/auth/organizations/service";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import type {
  InboxDealOption,
  InboxProjectOption,
  InboxWorkspaceClientProps,
} from "./InboxWorkspaceClient.types";

type WorkspaceData = Awaited<ReturnType<typeof requireWorkspaceData>>;
type WorkspaceCrmDeal = Awaited<ReturnType<ReturnType<typeof getWorkspaceCrmZone>["listDeals"]>>[number];
type WorkspaceProperty = Awaited<ReturnType<ReturnType<typeof getWorkspacePropertyZone>["listProperties"]>>["page"][number];

function canUseBusinessActions(audience: WorkspaceData["audience"]) {
  return audience === "broker" || audience === "developer";
}

function toDealOption(deal: WorkspaceCrmDeal): InboxDealOption {
  return {
    id: deal.id,
    title: deal.title,
    stage: deal.stage,
    value: deal.value ?? undefined,
    contactName: deal.contactName ?? null,
  };
}

function toProjectOption(property: WorkspaceProperty): InboxProjectOption {
  return {
    id: property._id,
    title: property.title,
    location: property.location ?? property.address ?? "",
    imageUrl: property.heroImage?.url ?? property.media?.[0]?.url ?? null,
    price: property.price ?? undefined,
    shortDescription:
      (property.body as { presentation?: { descriptionShort?: string } } | undefined)?.presentation?.descriptionShort ??
      property.description,
    publicationState: property.publicationState ?? "draft",
  };
}

async function loadCollaborationOptions(workspace: WorkspaceData) {
  if (!canUseBusinessActions(workspace.audience)) {
    return {
      dealOptions: [],
      projectOptions: [],
    };
  }

  const [properties, deals] = await Promise.all([
    getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).listProperties({
      paginationOpts: { cursor: null, numItems: 50 },
    }),
    getWorkspaceCrmZone(workspace.audience, workspace.ownerContext).listDeals(),
  ]);

  return {
    dealOptions: deals.map(toDealOption),
    projectOptions: properties.page.map((property) => ({
      ...toProjectOption(property),
      organizationName: workspace.primaryOrganization?.name ?? null,
    })),
  };
}

type LoadInboxWorkspaceClientPropsArgs = {
  conversationId?: string;
  routeHref: string;
  startUserId?: string | null;
};

export async function loadInboxWorkspaceClientProps({
  conversationId,
  routeHref,
  startUserId = null,
}: LoadInboxWorkspaceClientPropsArgs): Promise<InboxWorkspaceClientProps> {
  const [workspace, conversations, incomingInvites] = await Promise.all([
    requireWorkspaceData(routeHref),
    listInboxConversations(),
    listIncomingOrganizationInvitesForCurrentUser(),
  ]);
  const [collaborationOptions, initialConversation] = await Promise.all([
    loadCollaborationOptions(workspace),
    conversationId
      ? getInboxConversation(conversationId)
      : conversations[0]
        ? getInboxConversation(conversations[0].id)
        : Promise.resolve(null),
  ]);

  return {
    canUseBusinessActions: canUseBusinessActions(workspace.audience),
    currentUserId: workspace.user.id,
    dealOptions: collaborationOptions.dealOptions,
    hasConversationRoute: Boolean(conversationId),
    incomingInvites,
    initialConversation,
    initialConversations: conversations,
    initialSelectedConversationId: conversationId ?? null,
    initialStartUserId: startUserId,
    projectOptions: collaborationOptions.projectOptions,
  };
}
