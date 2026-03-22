import SigninPageView from "./_components/SigninPageView";
import { loadSigninPageState, type SigninSearchParams } from "./loaders";

type SigninPageProps = {
  searchParams: Promise<SigninSearchParams>;
};

export default async function SigninPage({ searchParams }: SigninPageProps) {
  return <SigninPageView redirectTo={(await loadSigninPageState(searchParams)).redirectTo} />;
}
