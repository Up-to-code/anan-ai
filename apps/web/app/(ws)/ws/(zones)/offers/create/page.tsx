import CreateOfferForm from "../CreateOfferForm";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceOrganizationTeam } from "../../../_lib/organizationTeam";
import { getWorkspaceOffersZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToOfferOption } from "../offerViewModel";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { OfferActionResult } from "@/server/contracts/offers";

export default async function CreateOfferPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const workspace = await requireWorkspaceData("/ws/offers/create");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const [properties, organizationTeam] = await Promise.all([
    getWorkspacePropertyZone(audience, ownerContext).listProperties({
      paginationOpts: { cursor: null, numItems: 100 },
    }),
    getWorkspaceOrganizationTeam(),
  ]);
  const params = await searchParams;
  const propertyId = Array.isArray(params.propertyId) ? params.propertyId[0] : params.propertyId;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const clientName = Array.isArray(params.clientName) ? params.clientName[0] : params.clientName;
  const clientPhone = Array.isArray(params.clientPhone) ? params.clientPhone[0] : params.clientPhone;
  const clientBudget = Array.isArray(params.clientBudget) ? params.clientBudget[0] : params.clientBudget;
  const clientBudgetMin = Array.isArray(params.clientBudgetMin) ? params.clientBudgetMin[0] : params.clientBudgetMin;
  const clientBudgetMax = Array.isArray(params.clientBudgetMax) ? params.clientBudgetMax[0] : params.clientBudgetMax;
  const clientLocation = Array.isArray(params.clientLocation) ? params.clientLocation[0] : params.clientLocation;
  const clientArea = Array.isArray(params.clientArea) ? params.clientArea[0] : params.clientArea;
  const clientBedsMin = Array.isArray(params.clientBedsMin) ? params.clientBedsMin[0] : params.clientBedsMin;
  const clientBathsMin = Array.isArray(params.clientBathsMin) ? params.clientBathsMin[0] : params.clientBathsMin;
  const clientSqftMin = Array.isArray(params.clientSqftMin) ? params.clientSqftMin[0] : params.clientSqftMin;
  const clientSqftMax = Array.isArray(params.clientSqftMax) ? params.clientSqftMax[0] : params.clientSqftMax;
  const clientNeed = Array.isArray(params.clientNeed) ? params.clientNeed[0] : params.clientNeed;

  async function createOffer(data: {
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
      budgetMin?: number;
      budgetMax?: number;
      location?: string;
      area?: string;
      bedsMin?: number;
      bathsMin?: number;
      sqftMin?: number;
      sqftMax?: number;
    };
    attachments: UploadedFileReference[];
  }) {
    "use server";
    const actionZone = getWorkspaceOffersZone(audience, ownerContext);
    const inferredCaseType =
      data.mode === "collaboration_case"
        ? "collaboration_case"
        : audience === "broker" && (data.recipientEmail || data.recipientPhone)
          ? "private_offer"
          : "open_offer";
    const result: OfferActionResult = await actionZone.createOffer({
      propertyId: data.propertyId,
      price: Number(data.price.replace(/[^\d.]/g, "")) || 0,
      message: data.title,
      description: data.description,
      visibility: inferredCaseType === "open_offer" ? "public" : "private",
      caseType: inferredCaseType,
      allowedAudience: data.allowedAudience,
      commissionText: data.commissionText,
      permitStatus: data.permitStatus,
      productStatus: data.productStatus,
      recipientEmail: data.recipientEmail,
      recipientPhone: data.recipientPhone,
      clientContext: data.clientContext,
      attachments: data.attachments,
    });
    await actionZone.publishOffer({ id: result.offerId });
    return { redirectTo: `/ws/offers/${result.offerId}` };
  }

  return (
    <CreateOfferForm
      properties={properties.page.map(mapPropertyToOfferOption)}
      audience={audience}
      organization={organizationTeam.organization}
      simplifiedFieldsOnly
      initialData={{
        propertyId,
        mode: mode === "collaboration_case" ? "collaboration_case" : "open_offer",
        clientName,
        clientPhone,
        clientBudget,
        clientBudgetMin,
        clientBudgetMax,
        title: mode === "collaboration_case" ? clientName : undefined,
        price: mode === "collaboration_case" ? clientBudgetMax ?? clientBudget : undefined,
        clientLocation,
        clientArea,
        clientBedsMin,
        clientBathsMin,
        clientSqftMin,
        clientSqftMax,
        clientNeed,
        description: mode === "collaboration_case" ? clientNeed : undefined,
      }}
      onSubmit={createOffer}
    />
  );
}
