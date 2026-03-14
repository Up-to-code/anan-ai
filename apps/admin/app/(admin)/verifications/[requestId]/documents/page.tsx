import VerificationDetailPage from "@/admin_zone/pages/VerificationDetailPage";

type VerificationDocumentsRouteProps = {
  params: Promise<{ requestId: string }>;
};

export default async function VerificationDocumentsRoute({ params }: VerificationDocumentsRouteProps) {
  const { requestId } = await params;
  return <VerificationDetailPage requestId={requestId} tab="documents" />;
}
