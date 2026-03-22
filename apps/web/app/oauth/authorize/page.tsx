import { approveAuthorizationAction, denyAuthorizationAction } from "./actions";
import OAuthAuthorizePageView from "./_components/OAuthAuthorizePageView";
import { loadAuthorizePageState, type AuthorizeSearchParams } from "./loaders";

type AuthorizePageProps = {
  searchParams: Promise<AuthorizeSearchParams>;
};

export default async function OAuthAuthorizePage({ searchParams }: AuthorizePageProps) {
  const { preview } = await loadAuthorizePageState(searchParams);

  return (
    <OAuthAuthorizePageView
      preview={preview}
      onApprove={approveAuthorizationAction.bind(null, preview.flowId)}
      onDeny={denyAuthorizationAction.bind(null, preview.flowId)}
    />
  );
}
