import type { BrokerPresence } from "../../_components/Visuals/BrokerPresenceChip";
import type { UnitReference } from "../../_lib/entities";

export type WorkspaceProject = {
  id: string;
  title: string;
  location: string;
  priceLabel: string;
  summary: string;
  image: string;
  specs: {
    rooms: string;
    baths: string;
    area: string;
    status: string;
  };
  publicationState: "published" | "draft" | "archived";
  units: UnitReference[];
  brokers: BrokerPresence[];
};
