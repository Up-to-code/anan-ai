import CreateOfferForm from "../CreateOfferForm";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceOffersZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToOfferOption } from "../offerViewModel";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { OfferActionResult } from "@/server/contracts/offers";

/**
 * WHY:   Offer creation should run against real properties and persisted attachments instead of route-local mocks.
 * WHAT:  Loads the current audience's properties and renders the server-backed create-offer form.
 * HOW:   Resolves workspace behavior once, then submits through the shared offer zone dispatcher.
 */
export default async function CreateOfferPage() {
  const workspace = await requireWorkspaceData("/ws/offers/create");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const offersZone = getWorkspaceOffersZone(audience, ownerContext);
  const properties = await getWorkspacePropertyZone(audience, ownerContext).listProperties({
    paginationOpts: { cursor: null, numItems: 100 },
  });

  async function createOffer(data: {
    propertyId: string;
    title: string;
    description: string;
    price: string;
    visibility: "public" | "private";
    attachments: UploadedFileReference[];
  }) {
    "use server";

    const actionZone = getWorkspaceOffersZone(audience, ownerContext);
    const result: OfferActionResult = await actionZone.createOffer({
      propertyId: data.propertyId,
      price: Number(data.price.replace(/[^\d.]/g, "")) || 0,
      message: data.title,
      description: data.description,
      visibility: data.visibility,
      attachments: data.attachments,
    });

    await actionZone.publishOffer({ id: result.offerId });

    const params = new URLSearchParams();
    if (result.notification) {
      params.set("deliveryTarget", result.notification.targetName);
      params.set("deliveryOrganization", result.notification.organizationName);
      params.set("deliveryPushStatus", result.notification.pushStatus);
      params.set("deliveryConversationId", result.conversationId ?? "");
    }

    const query = params.toString();
    return { redirectTo: `/ws/offers/${result.offerId}${query ? `?${query}` : ""}` };
  }

  return <CreateOfferForm properties={properties.page.map(mapPropertyToOfferOption)} onSubmit={createOffer} />;
}
