"use client";

import { Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import FilterChipBar from "../../../../_components/Visuals/FilterChipBar";
import ZonePageIntro from "../../../../_components/ZoneShell/ZonePageIntro";
import type { CrmClientRecord, PipelineStage } from "../../types/crmTypes";
import { DEAL_STAGE_BY_PIPELINE_STAGE, STAGE_ORDER, toDateTimeLocalValue } from "./PipelineWorkspace.helpers";
import { PipelineBoard } from "./PipelineWorkspace.board";

type PipelineWorkspaceProps = {
  initialClients: CrmClientRecord[];
  onStageChange?: (input: { dealId: string; stage: "new" | "contacted" | "negotiation" | "won" | "lost" }) => Promise<void>;
  onFollowUpChange?: (input: { dealId: string; nextFollowUpAt: number }) => Promise<void>;
  onCreateClient?: (input: { name: string }) => Promise<void>;
};

type PipelineState = {
  clientsByStage: Record<PipelineStage, CrmClientRecord[]>;
  activeFilter: string;
  setActiveFilter: (value: string) => void;
  draftName: string;
  setDraftName: (value: string) => void;
  followUpDraftById: Record<string, string>;
  setFollowUpDraftById: Dispatch<SetStateAction<Record<string, string>>>;
  draggedId: string | null;
  setDraggedId: (value: string | null) => void;
  dragOverStage: PipelineStage | null;
  setDragOverStage: (value: PipelineStage | null) => void;
  setClients: Dispatch<SetStateAction<CrmClientRecord[]>>;
};

function makeInitialFollowUpDrafts(clients: CrmClientRecord[]) {
  return clients.reduce<Record<string, string>>((acc, client) => {
    acc[client.id] = toDateTimeLocalValue(client.nextFollowUpAt);
    return acc;
  }, {});
}

function matchesFilter(client: CrmClientRecord, activeFilter: string) {
  if (activeFilter === "all") return true;
  if (activeFilter === "unlinked") return !client.project && !client.broker;
  if (activeFilter === "project-only") return Boolean(client.project) && !client.broker;
  if (activeFilter === "fully-linked") return Boolean(client.project) && Boolean(client.broker);
  return activeFilter !== "vip" || client.badges?.includes("vip");
}

function groupByStage(clients: CrmClientRecord[]) {
  const grouped = STAGE_ORDER.reduce<Record<PipelineStage, CrmClientRecord[]>>(
    (acc, stage) => ({ ...acc, [stage]: [] }),
    {} as Record<PipelineStage, CrmClientRecord[]>,
  );
  for (const client of clients) grouped[client.stage].push(client);
  return grouped;
}

function usePipelineState(initialClients: CrmClientRecord[]): PipelineState {
  const [clients, setClients] = useState(initialClients);
  const [activeFilter, setActiveFilter] = useState("all");
  const [draftName, setDraftName] = useState("");
  const [followUpDraftById, setFollowUpDraftById] = useState<Record<string, string>>(() => makeInitialFollowUpDrafts(initialClients));
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const visibleClients = useMemo(() => clients.filter((client) => matchesFilter(client, activeFilter)), [clients, activeFilter]);
  const clientsByStage = useMemo(() => groupByStage(visibleClients), [visibleClients]);
  return { clientsByStage, activeFilter, setActiveFilter, draftName, setDraftName, followUpDraftById, setFollowUpDraftById, draggedId, setDraggedId, dragOverStage, setDragOverStage, setClients };
}

type PipelineActionsParams = {
  state: PipelineState;
  onCreateClient?: PipelineWorkspaceProps["onCreateClient"];
  onStageChange?: PipelineWorkspaceProps["onStageChange"];
  onFollowUpChange?: PipelineWorkspaceProps["onFollowUpChange"];
};

function usePipelineActions({ state, onCreateClient, onStageChange, onFollowUpChange }: PipelineActionsParams) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const createClient = () => {
    const trimmedName = state.draftName.trim();
    if (!trimmedName || !onCreateClient) return;
    startTransition(() => void onCreateClient({ name: trimmedName }).then(() => {
      state.setDraftName("");
      router.refresh();
    }));
  };
  const dropStage = (stage: PipelineStage) => {
    state.setDragOverStage(null);
    if (!state.draggedId || !onStageChange) return;
    state.setClients((current) => current.map((client) => (client.id === state.draggedId ? { ...client, stage } : client)));
    startTransition(() => void onStageChange({ dealId: state.draggedId as string, stage: DEAL_STAGE_BY_PIPELINE_STAGE[stage] }).then(() => router.refresh()));
    state.setDraggedId(null);
  };
  const saveFollowUp = (dealId: string) => {
    const draftValue = state.followUpDraftById[dealId];
    const nextFollowUpAt = Date.parse(draftValue ?? "");
    if (!draftValue || Number.isNaN(nextFollowUpAt) || !onFollowUpChange) return;
    state.setClients((current) => current.map((client) => (client.id === dealId ? { ...client, nextFollowUpAt } : client)));
    startTransition(() => void onFollowUpChange({ dealId, nextFollowUpAt }).then(() => router.refresh()));
  };
  return { isPending, createClient, dropStage, saveFollowUp };
}

function PipelineCreateClientActions({
  draftName,
  isPending,
  canCreate,
  createLabel,
  createPlaceholder,
  onDraftNameChange,
  onCreateClick,
}: {
  draftName: string;
  isPending: boolean;
  canCreate: boolean;
  createLabel: string;
  createPlaceholder: string;
  onDraftNameChange: (value: string) => void;
  onCreateClick: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        value={draftName}
        onChange={(event) => onDraftNameChange(event.currentTarget.value)}
        placeholder={createPlaceholder}
        className="w-64 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-500/20"
      />
      <button
        type="button"
        disabled={!canCreate || isPending}
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-xs font-black tracking-[0.18em] text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-950"
      >
        <Plus className="h-4 w-4" />
        {createLabel}
      </button>
    </div>
  );
}

type PipelineWorkspaceViewProps = {
  state: PipelineState;
  isPending: boolean;
  canCreate: boolean;
  onCreateClick: () => void;
  onDropStage: (stage: PipelineStage) => void;
  onSaveFollowUp: (dealId: string) => void;
};

function PipelineWorkspaceView({ state, isPending, canCreate, onCreateClick, onDropStage, onSaveFollowUp }: PipelineWorkspaceViewProps) {
  const { dictionary } = useWebLocale();

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow={dictionary.crm.eyebrow}
        title={dictionary.crm.title}
        description=""
        actions={(
          <PipelineCreateClientActions
            draftName={state.draftName}
            isPending={isPending}
            canCreate={canCreate}
            createLabel={dictionary.crm.create}
            createPlaceholder={dictionary.crm.createPlaceholder}
            onDraftNameChange={state.setDraftName}
            onCreateClick={onCreateClick}
          />
        )}
      />
      <PipelineWorkspaceBoard state={state} isPending={isPending} onDropStage={onDropStage} onSaveFollowUp={onSaveFollowUp} />
    </div>
  );
}

type PipelineWorkspaceBoardProps = {
  state: PipelineState;
  isPending: boolean;
  onDropStage: (stage: PipelineStage) => void;
  onSaveFollowUp: (dealId: string) => void;
};

function PipelineWorkspaceBoard({ state, isPending, onDropStage, onSaveFollowUp }: PipelineWorkspaceBoardProps) {
  const { dictionary } = useWebLocale();

  return (
    <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
      <FilterChipBar
        chips={[
          { key: "all", label: dictionary.crm.all },
          { key: "unlinked", label: dictionary.crm.unlinked },
          { key: "project-only", label: dictionary.crm.projectOnly },
          { key: "fully-linked", label: dictionary.crm.fullyLinked },
          { key: "vip", label: "VIP" },
        ]}
        activeKey={state.activeFilter}
        onChange={state.setActiveFilter}
      />
      <PipelineBoard
        clientsByStage={state.clientsByStage}
        dragOverStage={state.dragOverStage}
        followUpDraftById={state.followUpDraftById}
        isPending={isPending}
        onDragEnterStage={state.setDragOverStage}
        onDragLeaveStage={(stage) => {
          if (state.dragOverStage === stage) state.setDragOverStage(null);
        }}
        onDropStage={onDropStage}
        onDragStartClient={state.setDraggedId}
        onFollowUpDraftChange={(clientId, value) => state.setFollowUpDraftById((current) => ({ ...current, [clientId]: value }))}
        onSaveFollowUp={onSaveFollowUp}
      />
    </div>
  );
}

/**
 * WHY:   CRM needs a real pipeline board that reflects persisted deals instead of route-local mutations.
 * WHAT:  Renders the draggable deal board and delegates all writes to server actions passed from the route.
 * HOW:   Uses optimistic local stage updates for responsiveness, then refreshes from the server after each mutation.
 */
export default function PipelineWorkspace(props: PipelineWorkspaceProps) {
  const state = usePipelineState(props.initialClients);
  const actions = usePipelineActions({ state, onCreateClient: props.onCreateClient, onStageChange: props.onStageChange, onFollowUpChange: props.onFollowUpChange });
  return <PipelineWorkspaceView state={state} isPending={actions.isPending} canCreate={Boolean(props.onCreateClient)} onCreateClick={actions.createClient} onDropStage={actions.dropStage} onSaveFollowUp={actions.saveFollowUp} />;
}
