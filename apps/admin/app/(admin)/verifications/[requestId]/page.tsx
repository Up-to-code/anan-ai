import VerificationDetailPage from "@/admin_zone/pages/VerificationDetailPage";

type VerificationDetailRouteProps = {
  params: Promise<{ requestId: string }>;
};

/**
 * WHY:   Admin reviewers need a stable route for each verification request.
 * WHAT:  Resolves the verification id from the route and renders the live detail page.
 * HOW:   Keeps route plumbing thin and delegates the screen logic to the page module.
 */
export default async function VerificationDetailRoute({ params }: VerificationDetailRouteProps) {
  const { requestId } = await params;
  return <VerificationDetailPage requestId={requestId} />;
}
