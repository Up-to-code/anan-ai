import AgentTeamDetailPage from "@/admin_zone/pages/AgentTeamDetailPage";

type AgentTeamPageProps = {
  params: Promise<{ teamId: string }>;
};

/**
 * WHY:   Agent teams need a dedicated detail route for route-backed management actions.
 * WHAT:  Renders the agent-team detail page.
 * HOW:   Passes the route param into the dedicated page module.
 */
export default async function AgentTeamPage({ params }: AgentTeamPageProps) {
  const { teamId } = await params;
  return <AgentTeamDetailPage teamId={teamId} />;
}
