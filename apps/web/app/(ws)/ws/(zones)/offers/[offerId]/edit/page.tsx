import { notFound } from "next/navigation";
import CreateOfferForm from "../../CreateOfferForm";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceOrganizationTeam } from "../../../../_lib/organizationTeam";
import { getWorkspaceOffersZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToOfferOption } from "../../offerViewModel";
import type { UploadedFileReference } from "@/server/contracts/files";

type WorkspaceOfferEditRouteProps = {
  params: Promise<{ offerId: string }>;
};

/**
 * WHY:   Draft case owners need one focused route to revise package and collaboration details before publish.
 * WHAT:  Loads one editable draft case and reuses the offers 2.0 form with save + archive actions.
 * HOW:   Requires `canEditDraft` from the case detail payload, then delegates all writes back through the offers zone.
 */
export default async function WorkspaceOfferEditRoute({
  params,
}: WorkspaceOfferEditRouteProps) {
  const { offerId } = await params;
  const workspace = await requireWorkspaceData(`/ws/offers/${offerId}/edit`);
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const offersZone = getWorkspaceOffersZone(audience, ownerContext);
  const propertyZone = getWorkspacePropertyZone(audience, ownerContext);
  const [offer, properties, organizationTeam] = await Promise.all([
    offersZone.getOfferLiveState(offerId),
    propertyZone.listProperties({ paginationOpts: { cursor: null, numItems: 100 } }),
    getWorkspaceOrganizationTeam(),
  ]);

  if (!offer || !offer.canEditDraft) {
    notFound();
  }

  const resolvedOffer = offer;

  async function updateOffer(data: {
    propertyId?: string;
    mode: "open_offer" | "private_offer" | "collaboration_case";
    title: string;
    description: string;
    price: string;
    allowedAudience: "brokers" | "developers" | "both";
    commissionText?: string;
    permitStatus?: string;
    productStatus?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    clientContext?: {
      clientName: string;
      clientPhone?: string;
      clientBudget?: string;
      clientNeed: string;
    };
    attachments: UploadedFileReference[];
  }) {
    "use server";
    await getWorkspaceOffersZone(audience, ownerContext).updateOfferDraft({
      id: offerId,
      conversationId: resolvedOffer.sourceConversationId ?? undefined,
      propertyId: data.propertyId,
      price: Number(data.price.replace(/[^\d.]/g, "")) || 0,
      message: data.title.trim() || undefined,
      description: data.description.trim() || undefined,
      attachments: data.attachments,
      commissionText: data.commissionText,
      permitStatus: data.permitStatus,
      productStatus: data.productStatus,
      allowedAudience: data.allowedAudience,
      clientContext: data.clientContext,
    });
    return { redirectTo: `/ws/offers/${offerId}` };
  }

  async function archiveOffer() {
    "use server";
    await getWorkspaceOffersZone(audience, ownerContext).archiveOffer({ id: offerId });
    return { redirectTo: "/ws/offers" };
  }

  return (
    <CreateOfferForm
      properties={properties.page.map(mapPropertyToOfferOption)}
      audience={audience}
      organization={organizationTeam.organization}
      pageTitle="تعديل مسودة العرض"
      pageDescription="حدّث العرض المنشور باسم المنظمة، سواء كان عرض عقار أو مشاركة موجّهة أو طلب عميل."
      submitLabel="حفظ المسودة"
      backHref={`/ws/offers/${offerId}`}
      initialData={{
        propertyId: resolvedOffer.propertyId ?? undefined,
        mode: resolvedOffer.type,
        title: resolvedOffer.message ?? "",
        description: resolvedOffer.description ?? undefined,
        price: String(resolvedOffer.price),
        allowedAudience: resolvedOffer.allowedAudience,
        commissionText: resolvedOffer.commissionText ?? undefined,
        permitStatus: resolvedOffer.permitStatus ?? undefined,
        productStatus: resolvedOffer.productStatus ?? undefined,
        clientName: resolvedOffer.clientContext?.clientName ?? undefined,
        clientPhone: resolvedOffer.clientContext?.clientPhone ?? undefined,
        clientBudget: resolvedOffer.clientContext?.clientBudget ?? undefined,
        clientNeed: resolvedOffer.clientContext?.clientNeed ?? undefined,
        attachments: resolvedOffer.attachments ?? [],
      }}
      onSubmit={updateOffer}
      onArchive={archiveOffer}
    />
  );
}
