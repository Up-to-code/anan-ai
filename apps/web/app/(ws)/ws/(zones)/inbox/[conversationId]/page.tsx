import InboxWorkspaceClient from "../InboxPage/InboxWorkspaceClient";
import { getInboxConversation, listInboxConversations } from "@/server/domains/inbox/service";
import { listIncomingOrganizationInvitesForCurrentUser } from "@/server/domains/organizations/service";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";

function toDealOption(deal: Awaited<ReturnType<ReturnType<typeof getWorkspaceCrmZone>["listDeals"]>>[number]) {
  return {
    id: deal.id,
    title: deal.title,
    stage: deal.stage,
    value: deal.value,
    contactName: deal.contactName ?? null,
  };
}

function toProjectOption(property: Awaited<ReturnType<ReturnType<typeof getWorkspacePropertyZone>["listProperties"]>>["page"][number]) {
  return {
    id: property._id,
    title: property.title,
    location: property.location ?? property.address ?? "",
    imageUrl: property.heroImage?.url ?? property.media?.[0]?.url ?? null,
    price: property.price,
  };
}

export default async function InboxConversationPage({
  params,
}: {
  params: { conversationId: string } | Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await Promise.resolve(params);
  const workspace = await requireWorkspaceData(`/ws/inbox/${conversationId}`);
  const [conversations, conversation, incomingInvites] = await Promise.all([
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
      dealOptions={(collaborationData?.[1] ?? []).map(toDealOption)}
      initialConversations={conversations}
      initialConversation={conversation}
      initialSelectedConversationId={conversationId}
      hasConversationRoute
      incomingInvites={incomingInvites}
      projectOptions={(collaborationData?.[0]?.page ?? []).map(toProjectOption)}
    />
  );
}
