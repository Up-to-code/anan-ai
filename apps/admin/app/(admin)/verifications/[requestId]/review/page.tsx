import VerificationDetailPage from "@/admin_zone/pages/VerificationDetailPage";

type VerificationReviewRouteProps = {
  params: Promise<{ requestId: string }>;
};

export default async function VerificationReviewRoute({ params }: VerificationReviewRouteProps) {
  const { requestId } = await params;
  return <VerificationDetailPage requestId={requestId} tab="review" />;
}
