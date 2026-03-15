import OAuthAuthorizePage from "@/admin_zone/pages/OAuthAuthorizePage";

type AuthorizePageProps = {
  searchParams: Promise<{
    flow?: string;
  }>;
};

/**
 * WHY:   OAuth consent needs a dedicated admin route that stays thin and delegates to the admin page module.
 * WHAT:  Bridges the authorize query params into the admin OAuth consent orchestrator.
 * HOW:   Awaits `searchParams` and passes the flow id into the admin zone page.
 */
export default async function AuthorizePage({ searchParams }: AuthorizePageProps) {
  const { flow } = await searchParams;
  return <OAuthAuthorizePage flow={flow} />;
}
