import { redirect } from "next/navigation";
import { getAuthenticatedSession, sanitizeInternalReturnTo } from "@/lib/serverSession";

export type SigninSearchParams = {
  returnTo?: string;
};

export type SigninPageState = {
  redirectTo: string;
};

async function getSigninSession() {
  try {
    return await getAuthenticatedSession();
  } catch (error) {
    if (
      error
      && typeof error === "object"
      && "code" in error
      && error.code === "AUTH_CONFIGURATION_ERROR"
    ) {
      return { token: null, user: null, role: null };
    }
    throw error;
  }
}

export async function loadSigninPageState(searchParams: Promise<SigninSearchParams>): Promise<SigninPageState> {
  const [{ returnTo }, session] = await Promise.all([searchParams, getSigninSession()]);
  const redirectTo = sanitizeInternalReturnTo(returnTo, "/ws");

  if (session.token) {
    redirect(redirectTo);
  }

  return { redirectTo };
}
