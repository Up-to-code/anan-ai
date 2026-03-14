import InboxWorkspaceClient from "./InboxPage/InboxWorkspaceClient";
import { getInboxConversation, listInboxConversations } from "@/server/domains/inbox/service";
import { listIncomingOrganizationInvitesForCurrentUser } from "@/server/domains/organizations/service";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";

/**
 * WHY:   The inbox should now load real conversation data on the server before the client UI takes over.
 * WHAT:  Renders the 2-pane inbox experience using server-first loaders and a small client coordinator.
 * HOW:   Loads the current workspace identity plus the available conversation list, then hydrates the first thread if present.
 */
export default async function InboxIndexPage() {
  const [workspace, conversations, incomingInvites] = await Promise.all([
    requireWorkspaceData("/ws/inbox"),
    listInboxConversations(),
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
  const initialConversation = conversations[0]
    ? await getInboxConversation(conversations[0].id)
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
      initialConversation={initialConversation}
      initialSelectedConversationId={null}
      hasConversationRoute={false}
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
