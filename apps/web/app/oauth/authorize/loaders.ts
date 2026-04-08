import { redirect } from "next/navigation";
import {
  approveAuthorizationForCurrentUser,
  getAuthorizationPromptForCurrentUser,
} from "@/server/domains/auth/oauth/service";
import { getOptionalSessionContext } from "@/server/auth/session";
import { buildSigninRedirectForFlow } from "./authorize.shared";

export type AuthorizeSearchParams = {
  flow?: string;
  org?: string;
};

export type OAuthAuthorizationPreview = Awaited<ReturnType<typeof getAuthorizationPromptForCurrentUser>>;

export async function loadAuthorizePageState(searchParams: Promise<AuthorizeSearchParams>) {
  const { flow, org } = await searchParams;
  const session = await getOptionalSessionContext();

  if (!flow) {
    redirect("/signin");
  }
  if (!session) {
    redirect(buildSigninRedirectForFlow(flow, org));
  }

  const preview = await getAuthorizationPromptForCurrentUser(flow, org);

  if (!preview.requiresConsent && preview.existingAuthorization && preview.selectedTenantOrgId) {
    redirect((await approveAuthorizationForCurrentUser(flow, preview.selectedTenantOrgId)).redirectUrl);
  }

  return { preview };
}
