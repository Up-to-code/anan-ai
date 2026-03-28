import InboxWorkspaceClient from "./InboxPage/InboxWorkspaceClient";
import { loadInboxWorkspaceClientProps } from "./InboxPage/loaders";

type InboxIndexPageProps = {
  searchParams: Promise<{
    conversationId?: string;
    startUserId?: string;
  }>;
};

export default async function InboxIndexPage({ searchParams }: InboxIndexPageProps) {
  return <InboxWorkspaceClient {...await loadInboxWorkspaceClientProps({ routeHref: "/ws/inbox", ...await searchParams })} />;
}
