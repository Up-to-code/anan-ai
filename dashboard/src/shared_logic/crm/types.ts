export const CRM_STAGES = ["new", "contacted", "negotiation", "won", "lost"] as const;

export type DealStage = (typeof CRM_STAGES)[number];

export type CrmDeal = {
  _id: string;
  title: string;
  description?: string;
  value?: number;
  stage: DealStage;
  brokerName?: string | null;
  redName?: string | null;
  notes?: string;
  documentIds?: string[];
};

export const CRM_STAGE_META: Array<{ key: DealStage; label: string; color: string }> = [
  { key: "new", label: "فرصة جديدة", color: "bg-blue-500" },
  { key: "contacted", label: "تواصل أولي", color: "bg-amber-500" },
  { key: "negotiation", label: "مفاوضات", color: "bg-purple-500" },
  { key: "won", label: "منجزة", color: "bg-emerald-500" },
  { key: "lost", label: "خسارة", color: "bg-rose-500" },
];
