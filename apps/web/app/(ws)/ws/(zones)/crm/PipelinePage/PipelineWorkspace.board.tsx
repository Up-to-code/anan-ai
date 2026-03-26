"use client";

import BrandEmptyState from "../../../_components/WorkspaceBrand/BrandEmptyState";
import type { CrmClientRecord, PipelineStage } from "../crmTypes";
import { STAGE_LABELS, STAGE_ORDER } from "./PipelineWorkspace.helpers";
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
    return "space-y-3 border border-blue-400 bg-blue-50/50 p-4 outline-dashed outline-2 outline-offset-[-2px] outline-blue-300 transition duration-200 dark:border-blue-500 dark:bg-blue-500/10 dark:outline-blue-500/60";
  }
  return "space-y-3 border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 transition duration-200 dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.98)_100%)]";
}

function StageColumnHeader({ stage, count }: { stage: PipelineStage; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-black text-slate-950 dark:text-slate-100">{STAGE_LABELS[stage]}</h2>
      <span className="text-xs font-black text-slate-400 dark:text-slate-500">{count}</span>
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
        <BrandEmptyState title="لا توجد بطاقات" description="اسحب بطاقة إلى هذا العمود أو أنشئ بطاقة جديدة." />
      ) : null}
    </div>
  );
}
