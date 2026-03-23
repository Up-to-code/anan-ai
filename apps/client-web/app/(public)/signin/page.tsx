import { SigninPage } from "@/client_zone/pages/SigninPage";
import { sanitizeInternalReturnTo } from "@/lib/serverSession";

type SigninRouteProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function ClientSigninRoute({ searchParams }: SigninRouteProps) {
  return <SigninPage redirectTo={sanitizeInternalReturnTo((await searchParams).returnTo, "/app")} />;
}
