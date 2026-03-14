import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import { mapOfferToMarketplaceItem } from "../offerViewModel";
import SearchOffersClient from "./SearchOffersClient";

export default async function SearchOffersPage() {
  const workspace = await requireWorkspaceData("/ws/offers/search");
  const snapshot = await getWorkspaceOffersZone(workspace.audience, workspace.ownerContext).getSnapshot();
  const items = [...snapshot.marketplace, ...snapshot.received, ...snapshot.sent].map(mapOfferToMarketplaceItem);

  return <SearchOffersClient items={items} />;
}
