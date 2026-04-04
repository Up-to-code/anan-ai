"use client";

import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import BrandEmptyState from "../../../../_components/WorkspaceBrand/BrandEmptyState";
import type { CrmClientRecord, PipelineStage } from "../../types/crmTypes";
import { STAGE_ORDER, getStageLabel } from "./PipelineWorkspace.helpers";
import { PipelineClientCard } from "./PipelineWorkspace.card";

type PipelineBoardProps = {
  clientsByStage: Record<PipelineStage, CrmClientRecord[]>;
  dragOverStage: PipelineStage | null;
  followUpDraftById: Record<string, string>;
  isPending: boolean;
  onDragEnterStage: (stage: PipelineStage) => void;
  onDragLeaveStage: (stage: PipelineStage) => void;
  onDropStage: (stage: PipelineStage) => void;
  onDragStartClient: (clientId: string) => void;
  onFollowUpDraftChange: (clientId: string, value: string) => void;
  onSaveFollowUp: (clientId: string) => void;
};

export function PipelineBoard(props: PipelineBoardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {STAGE_ORDER.map((stage) => (
        <PipelineStageColumn
          key={stage}
          stage={stage}
          clients={props.clientsByStage[stage]}
          dragOverStage={props.dragOverStage}
          followUpDraftById={props.followUpDraftById}
          isPending={props.isPending}
          onDragEnterStage={props.onDragEnterStage}
          onDragLeaveStage={props.onDragLeaveStage}
          onDropStage={props.onDropStage}
          onDragStartClient={props.onDragStartClient}
          onFollowUpDraftChange={props.onFollowUpDraftChange}
          onSaveFollowUp={props.onSaveFollowUp}
        />
      ))}
    </div>
  );
}

type PipelineStageColumnProps = {
  stage: PipelineStage;
  clients: CrmClientRecord[];
  dragOverStage: PipelineStage | null;
  followUpDraftById: Record<string, string>;
  isPending: boolean;
  onDragEnterStage: (stage: PipelineStage) => void;
  onDragLeaveStage: (stage: PipelineStage) => void;
  onDropStage: (stage: PipelineStage) => void;
  onDragStartClient: (clientId: string) => void;
  onFollowUpDraftChange: (clientId: string, value: string) => void;
  onSaveFollowUp: (clientId: string) => void;
};

function PipelineStageColumn({
  stage,
  clients,
  dragOverStage,
  followUpDraftById,
  isPending,
  onDragEnterStage,
  onDragLeaveStage,
  onDropStage,
  onDragStartClient,
  onFollowUpDraftChange,
  onSaveFollowUp,
}: PipelineStageColumnProps) {
  return (
    <section
      className={getStageColumnClassName(dragOverStage === stage)}
      onDragOver={(event) => (event.preventDefault(), (event.dataTransfer.dropEffect = "move"))}
      onDragEnter={(event) => (event.preventDefault(), onDragEnterStage(stage))}
      onDragLeave={(event) => (event.preventDefault(), onDragLeaveStage(stage))}
      onDrop={() => onDropStage(stage)}
    >
      <StageColumnHeader stage={stage} count={clients.length} />
      <StageClientList clients={clients} followUpDraftById={followUpDraftById} isPending={isPending} onDragStartClient={onDragStartClient} onFollowUpDraftChange={onFollowUpDraftChange} onSaveFollowUp={onSaveFollowUp} />
    </section>
  );
}

function getStageColumnClassName(isActive: boolean) {
  if (isActive) {
    return "space-y-3 rounded-2xl border border-border bg-accent/50 p-4 outline-dashed outline-2 outline-offset-[-2px] outline-border transition duration-200";
  }
  return "space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-4 transition duration-200";
}

function StageColumnHeader({ stage, count }: { stage: PipelineStage; count: number }) {
  const { locale } = useWebLocale();
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-sm font-bold text-foreground">{getStageLabel(stage, locale)}</h2>
      <span className="text-xs font-bold text-muted-foreground">{count}</span>
    </div>
  );
}

function StageClientList({
  clients,
  followUpDraftById,
  isPending,
  onDragStartClient,
  onFollowUpDraftChange,
  onSaveFollowUp,
}: {
  clients: CrmClientRecord[];
  followUpDraftById: Record<string, string>;
  isPending: boolean;
  onDragStartClient: (clientId: string) => void;
  onFollowUpDraftChange: (clientId: string, value: string) => void;
  onSaveFollowUp: (clientId: string) => void;
}) {
  const { locale } = useWebLocale();
  return (
    <div className="flex flex-col gap-3">
      {clients.map((client) => (
        <PipelineClientCard
          key={client.id}
          client={client}
          draft={followUpDraftById[client.id] ?? ""}
          isPending={isPending}
          onDragStartClient={onDragStartClient}
          onFollowUpDraftChange={onFollowUpDraftChange}
          onSaveFollowUp={onSaveFollowUp}
        />
      ))}
      {clients.length === 0 ? (
        <BrandEmptyState
          title={locale === "fr" ? "Aucune carte" : locale === "en" ? "No cards yet" : "لا توجد بطاقات"}
          description={
            locale === "fr"
              ? "Glissez une carte dans cette colonne ou creez-en une nouvelle."
              : locale === "en"
                ? "Drag a card into this column or create a new one."
                : "اسحب بطاقة إلى هذا العمود أو أنشئ بطاقة جديدة."
          }
        />
      ) : null}
    </div>
  );
}
