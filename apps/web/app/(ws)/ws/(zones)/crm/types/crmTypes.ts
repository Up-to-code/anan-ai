import type { PersonBadge } from "../../../_lib/entities";
import type { BrokerPresence } from "../../../_components/Visuals/BrokerPresenceChip";
import type { UnitReference } from "../../../_lib/entities";
import type { DealRelationType, DealSelectorBroker, DealSelectorClient } from "@/server/contracts/deals";

export type PipelineStage = "new" | "qualified" | "proposal" | "won" | "lost";

export type CrmProjectReference = {
  id: string;
  title: string;
  image: string;
  location: string;
  priceLabel: string;
  summary: string;
};

export type CrmLinkedClientReference = {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  sourceClientId?: string;
};

export type CrmClientRecord = {
  id: string;
  personType: "client" | "broker";
  relationType: DealRelationType;
  avatarImage?: string;
  avatarLabel: string;
  name: string;
  stage: PipelineStage;
  budgetLabel: string;
  preference: string;
  nextFollowUpAt?: number;
  project: CrmProjectReference | null;
  linkedClient: CrmLinkedClientReference | null;
  unit: UnitReference | null;
  broker: BrokerPresence | null;
  relationLabel: string;
  notes: string;
  badges?: PersonBadge[];
};

export type DealFormProjectOption = {
  id: string;
  title: string;
  image: string;
  location: string;
  priceLabel: string;
  summary: string;
};

export type DealFormClientOption = DealSelectorClient;
export type DealFormBrokerOption = DealSelectorBroker;
