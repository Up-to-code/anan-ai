import type { PersonBadge } from "../../_lib/entities";
import type { BrokerPresence } from "../../_components/Visuals/BrokerPresenceChip";
import type { UnitReference } from "../../_lib/entities";

export type PipelineStage = "new" | "qualified" | "proposal" | "won";

export type CrmProjectReference = {
  id: string;
  title: string;
  image: string;
  location: string;
};

export type CrmClientRecord = {
  id: string;
  personType: "client" | "broker";
  avatarImage?: string;
  avatarLabel: string;
  name: string;
  stage: PipelineStage;
  budgetLabel: string;
  preference: string;
  project: CrmProjectReference | null;
  unit: UnitReference | null;
  broker: BrokerPresence | null;
  notes: string;
  badges?: PersonBadge[];
};
