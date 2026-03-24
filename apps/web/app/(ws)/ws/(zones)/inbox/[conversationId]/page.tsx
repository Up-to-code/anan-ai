import InboxWorkspaceClient from "../InboxPage/InboxWorkspaceClient";
import { loadInboxWorkspaceClientProps } from "../InboxPage/loaders";

export default async function InboxConversationPage({
  params,
}: {
  params: { conversationId: string } | Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await Promise.resolve(params);
  return <InboxWorkspaceClient {...await loadInboxWorkspaceClientProps({ conversationId, routeHref: `/ws/inbox/${conversationId}` })} />;
}
