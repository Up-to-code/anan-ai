import SignInPage from "@/client_zone/public/SignInPage";
import { sanitizeInternalReturnTo } from "@/lib/serverSession";

export default async function SignInRoute({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const returnTo = Array.isArray(resolved?.returnTo) ? resolved?.returnTo[0] : resolved?.returnTo;
  const intent = Array.isArray(resolved?.intent) ? resolved?.intent[0] : resolved?.intent;

  return <SignInPage returnTo={sanitizeInternalReturnTo(returnTo)} intent={intent} />;
}
