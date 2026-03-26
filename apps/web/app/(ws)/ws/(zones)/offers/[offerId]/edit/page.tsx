import { notFound } from "next/navigation";
import CreateOfferForm from "../../CreateOfferForm";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceOffersZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToOfferOption } from "../../offerViewModel";
import type { UploadedFileReference } from "@/server/contracts/files";

type WorkspaceOfferEditRouteProps = {
  params: Promise<{ offerId: string }>;
};

/**
 * WHY:   Draft offer owners need a dedicated workspace route to revise offer details before publishing or archiving.
 * WHAT:  Loads one owner-editable draft offer and reuses the workspace offer form with save + archive server actions.
 * HOW:   Requires a visible live state, enforces `canEditDraft`, and routes all mutations through the workspace offers zone for the active audience.
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
  const [offer, properties] = await Promise.all([
    offersZone.getOfferLiveState(offerId),
    propertyZone.listProperties({ paginationOpts: { cursor: null, numItems: 100 } }),
  ]);

  if (!offer || !offer.isOwner || !offer.canEditDraft) {
    notFound();
  }

  async function updateOffer(data: {
    propertyId: string;
    title: string;
    description: string;
    price: string;
    visibility: "public" | "private";
    attachments: UploadedFileReference[];
  }) {
    "use server";
    await getWorkspaceOffersZone(audience, ownerContext).updateOfferDraft({
      id: offerId,
      conversationId: offer.sourceConversationId ?? undefined,
      propertyId: data.propertyId,
      price: Number(data.price.replace(/[^\d.]/g, "")) || 0,
      message: data.title.trim() || undefined,
      description: data.description.trim() || undefined,
      attachments: data.attachments,
    });
    return { redirectTo: `/ws/offers/${offerId}` };
  }

  async function archiveOffer() {
    "use server";
    await getWorkspaceOffersZone(audience, ownerContext).archiveOffer({ id: offerId });
    return { redirectTo: "/ws/offers?tab=sent" };
  }

  return (
    <CreateOfferForm
      properties={properties.page.map(mapPropertyToOfferOption)}
      pageTitle="تعديل مسودة العرض"
      pageDescription="حدّث تفاصيل المسودة قبل النشر أو قم بأرشفتها لإخفائها من القوائم النشطة."
      submitLabel="حفظ المسودة"
      allowVisibilityChange={false}
      backHref={`/ws/offers/${offerId}`}
      initialData={{
        propertyId: offer.property?.id ?? offer.propertyId,
        title: offer.message ?? "",
        description: offer.description ?? "",
        price: String(offer.price),
        visibility: offer.visibility ?? "private",
        attachments: offer.attachments ?? [],
      }}
      onSubmit={updateOffer}
      onArchive={archiveOffer}
    />
  );
}
