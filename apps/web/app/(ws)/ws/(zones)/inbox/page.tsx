import InboxWorkspaceClient from "./InboxPage/InboxWorkspaceClient";
import { getInboxConversation, listInboxConversations } from "@/server/domains/inbox/service";
import { listIncomingOrganizationInvitesForCurrentUser } from "@/server/domains/organizations/service";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";

type InboxIndexPageProps = {
  searchParams: Promise<{
    startUserId?: string;
  }>;
};

function mapDealOption(deal: {
  id: string;
  title: string;
  stage: Awaited<ReturnType<ReturnType<typeof getWorkspaceCrmZone>["listDeals"]>>[number]["stage"];
  value?: number | null;
  contactName?: string | null;
}) {
  return {
    id: deal.id,
    title: deal.title,
    stage: deal.stage,
    value: deal.value ?? undefined,
    contactName: deal.contactName ?? null,
  };
}

function mapProjectOption(property: {
  _id: string;
  title: string;
  location?: string | null;
  address?: string | null;
  heroImage?: { url?: string | null } | null;
  media?: Array<{ url?: string | null }> | null;
  price?: number | null;
}) {
  return {
    id: property._id,
    title: property.title,
    location: property.location ?? property.address ?? "",
    imageUrl: property.heroImage?.url ?? property.media?.[0]?.url ?? null,
    price: property.price ?? undefined,
  };
}

async function resolveCollaborationData(workspace: Awaited<ReturnType<typeof requireWorkspaceData>>) {
  if (workspace.audience !== "broker" && workspace.audience !== "developer") {
    return null;
  }
  return Promise.all([
    getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).listProperties({
      paginationOpts: { cursor: null, numItems: 50 },
    }),
    getWorkspaceCrmZone(workspace.audience, workspace.ownerContext).listDeals(),
  ]);
}

/**
 * WHY:   The inbox should now load real conversation data on the server before the client UI takes over.
 * WHAT:  Renders the 2-pane inbox experience using server-first loaders and a small client coordinator.
 * HOW:   Loads the current workspace identity plus the available conversation list, then hydrates the first thread if present.
 */
export default async function InboxIndexPage({ searchParams }: InboxIndexPageProps) {
  const { startUserId } = await searchParams;
  const workspace = await requireWorkspaceData("/ws/inbox");
  const [conversations, incomingInvites] = await Promise.all([
    listInboxConversations(),
    listIncomingOrganizationInvitesForCurrentUser(),
  ]);
  const collaborationData = await resolveCollaborationData(workspace);
  const initialConversation = conversations[0]
    ? await getInboxConversation(conversations[0].id)
    : null;

  return (
    <InboxWorkspaceClient
      canUseBusinessActions={workspace.audience === "broker" || workspace.audience === "developer"}
      currentUserId={workspace.user.id}
      dealOptions={(collaborationData?.[1] ?? []).map(mapDealOption)}
      initialStartUserId={startUserId ?? null}
      initialConversations={conversations}
      initialConversation={initialConversation}
      initialSelectedConversationId={null}
      hasConversationRoute={false}
      incomingInvites={incomingInvites}
      projectOptions={(collaborationData?.[0]?.page ?? []).map(mapProjectOption)}
    />
  );
}
