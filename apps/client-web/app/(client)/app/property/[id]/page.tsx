import { PropertyDetailPage } from "@/client_zone/pages/PropertyDetailPage";

type PropertyRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyRoute({ params }: PropertyRouteProps) {
  return <PropertyDetailPage propertyId={(await params).id} />;
}
