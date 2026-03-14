import type { BrokerPresence } from "../../_components/Visuals/BrokerPresenceChip";

export type OfferMarketplaceItem = {
  id: string;
  title: string;
  kind: "developer" | "broker" | "client" | "inbox";
  image: string;
  location: string;
  priceLabel: string;
  propertyType: string;
  ownerLabel: string;
  summary: string;
  project: {
    id: string;
    title: string;
    rooms: string;
    baths: string;
    area: string;
  };
  projectRefId: string;
  unit: {
    id: string;
    label: string;
    bedrooms?: number;
    bathrooms?: number;
    priceLabel?: string;
  } | null;
  broker: BrokerPresence | null;
  demandLabel: string | null;
};
