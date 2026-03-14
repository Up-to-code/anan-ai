import InboxWorkspaceClient from "../InboxPage/InboxWorkspaceClient";
import { getInboxConversation, listInboxConversations } from "@/server/domains/inbox/service";
import { listIncomingOrganizationInvitesForCurrentUser } from "@/server/domains/organizations/service";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";

export default async function InboxConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const [workspace, conversations, conversation, incomingInvites] = await Promise.all([
    requireWorkspaceData(`/ws/inbox/${conversationId}`),
    listInboxConversations(),
    getInboxConversation(conversationId),
    listIncomingOrganizationInvitesForCurrentUser(),
  ]);
  const collaborationData = workspace.audience === "broker" || workspace.audience === "developer"
    ? await Promise.all([
        getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).listProperties({
          paginationOpts: { cursor: null, numItems: 50 },
        }),
        getWorkspaceCrmZone(workspace.audience, workspace.ownerContext).listDeals(),
      ])
    : null;

  return (
    <InboxWorkspaceClient
      canUseBusinessActions={workspace.audience === "broker" || workspace.audience === "developer"}
      currentUserId={workspace.user.id}
      dealOptions={(collaborationData?.[1] ?? []).map((deal) => ({
        id: deal.id,
        title: deal.title,
        stage: deal.stage,
        value: deal.value,
        contactName: deal.contactName ?? null,
      }))}
      initialConversations={conversations}
      initialConversation={conversation}
      initialSelectedConversationId={conversationId}
      hasConversationRoute
      incomingInvites={incomingInvites}
      projectOptions={(collaborationData?.[0]?.page ?? []).map((property) => ({
        id: property._id,
        title: property.title,
        location: property.location ?? property.address ?? "",
        imageUrl: property.heroImage?.url ?? property.media?.[0]?.url ?? null,
        price: property.price,
      }))}
    />
  );
}
