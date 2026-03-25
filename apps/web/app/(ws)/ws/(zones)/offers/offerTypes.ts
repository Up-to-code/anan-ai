import type { BrokerPresence } from "../../_components/Visuals/BrokerPresenceChip";

export type OfferMarketplaceItem = {
  id: string;
  title: string;
  kind: "developer" | "broker" | "client" | "inbox";
  source: "marketplace" | "received" | "sent";
  image: string;
  location: string;
  priceLabel: string;
  propertyType: string;
  ownerLabel: string;
  summary: string;
  linkedProperty: {
    id: string;
    title: string;
    image: string;
    location: string;
    askingPriceLabel: string | null;
  } | null;
  fallbackDetails: {
    averagePriceLabel: string | null;
    locationLabel: string;
    propertyLabel: string;
  } | null;
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
