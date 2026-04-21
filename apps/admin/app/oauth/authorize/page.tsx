import OAuthAuthorizePage from "@/admin_zone/pages/OAuthAuthorizePage";

type OAuthAuthorizeRouteProps = {
  searchParams: Promise<{ flow?: string }>;
};

/**
 * WHY:   Admin OAuth consent must be reachable through the app router so external clients can target the admin app directly.
 * WHAT:  Resolves the `flow` query string and renders the existing OAuth consent screen.
 * HOW:   Keeps routing thin and delegates the UI + action logic to the admin page module.
 */
export default async function AdminOAuthAuthorizeRoute({ searchParams }: OAuthAuthorizeRouteProps) {
  const { flow } = await searchParams;
  return <OAuthAuthorizePage flow={flow ?? null} />;
}
