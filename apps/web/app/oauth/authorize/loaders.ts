import { redirect } from "next/navigation";
import {
  approveAuthorizationForCurrentUser,
  getAuthorizationPromptForCurrentUser,
} from "@/server/domains/auth/oauth/service";
import { getOptionalSessionContext } from "@/server/auth/session";
import { buildSigninRedirectForFlow } from "./authorize.shared";

export type AuthorizeSearchParams = {
  flow?: string;
};

export type OAuthAuthorizationPreview = Awaited<ReturnType<typeof getAuthorizationPromptForCurrentUser>>;

export async function loadAuthorizePageState(searchParams: Promise<AuthorizeSearchParams>) {
  const { flow } = await searchParams;
  const session = await getOptionalSessionContext();

  if (!flow) {
    redirect("/signin");
  }
  if (!session) {
    redirect(buildSigninRedirectForFlow(flow));
  }

  const preview = await getAuthorizationPromptForCurrentUser(flow);

  if (!preview.requiresConsent && preview.existingAuthorization) {
    redirect((await approveAuthorizationForCurrentUser(flow)).redirectUrl);
  }

  return { preview };
}
