import InboxWorkspaceClient from "./pages/InboxPage/InboxWorkspaceClient";
import { loadInboxWorkspaceClientProps } from "./pages/InboxPage/loaders";

type InboxIndexPageProps = {
  searchParams: Promise<{
    conversationId?: string;
    startUserId?: string;
  }>;
};

export default async function InboxIndexPage({ searchParams }: InboxIndexPageProps) {
  return <InboxWorkspaceClient {...await loadInboxWorkspaceClientProps({ routeHref: "/ws/inbox", ...await searchParams })} />;
}
