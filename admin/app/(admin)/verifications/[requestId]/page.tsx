import VerificationDetailPage from "@/admin_zone/pages/VerificationDetailPage";

type VerificationDetailRouteProps = {
  params: Promise<{ requestId: string }>;
};

export default async function VerificationDetailRoute({ params }: VerificationDetailRouteProps) {
  const { requestId } = await params;
  return <VerificationDetailPage requestId={requestId} />;
}
