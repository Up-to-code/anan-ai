"use client";

import Link from "next/link";
import PersonCard from "../../../_components/Visuals/PersonCard";
import type { CrmClientRecord } from "../crmTypes";
import { formatFollowUpLabel, getFollowUpPresentation, STAGE_LABELS } from "./PipelineWorkspace.helpers";

type PipelineClientCardProps = {
  client: CrmClientRecord;
  draft: string;
  isPending: boolean;
  onDragStartClient: (clientId: string) => void;
  onFollowUpDraftChange: (clientId: string, value: string) => void;
  onSaveFollowUp: (clientId: string) => void;
};

export function PipelineClientCard({
  client,
  draft,
  isPending,
  onDragStartClient,
  onFollowUpDraftChange,
  onSaveFollowUp,
}: PipelineClientCardProps) {
  const followUp = getFollowUpPresentation(client.nextFollowUpAt);
  return (
    <div draggable onDragStart={() => onDragStartClient(client.id)} className="cursor-grab active:cursor-grabbing">
      <PersonCard
        person={buildCardPerson(client)}
        footer={
          <PipelineClientFooter
            client={client}
            draft={draft}
            followUpTone={followUp.tone}
            followUpLabel={followUp.label}
            isPending={isPending}
            onFollowUpDraftChange={onFollowUpDraftChange}
            onSaveFollowUp={onSaveFollowUp}
          />
        }
      />
    </div>
  );
}

type PipelineClientFooterProps = {
  client: CrmClientRecord;
  draft: string;
  followUpTone: string;
  followUpLabel: string;
  isPending: boolean;
  onFollowUpDraftChange: (clientId: string, value: string) => void;
  onSaveFollowUp: (clientId: string) => void;
};

function PipelineClientFooter({
  client,
  draft,
  followUpTone,
  followUpLabel,
  isPending,
  onFollowUpDraftChange,
  onSaveFollowUp,
}: PipelineClientFooterProps) {
  return (
    <div className="space-y-3 border-t border-slate-200 pt-3">
      <div className="text-xs font-medium text-slate-500">{client.budgetLabel}</div>
      <div className={`inline-flex border px-2 py-1 text-[10px] font-black tracking-[0.14em] ${followUpTone}`}>
        متابعة: {followUpLabel}
      </div>
      <FollowUpEditor
        client={client}
        draft={draft}
        isPending={isPending}
        onFollowUpDraftChange={onFollowUpDraftChange}
        onSaveFollowUp={onSaveFollowUp}
      />
      <ClientCardActions clientId={client.id} />
    </div>
  );
}

function FollowUpEditor({
  client,
  draft,
  isPending,
  onFollowUpDraftChange,
  onSaveFollowUp,
}: {
  client: CrmClientRecord;
  draft: string;
  isPending: boolean;
  onFollowUpDraftChange: (clientId: string, value: string) => void;
  onSaveFollowUp: (clientId: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">المتابعة القادمة</label>
      <input
        type="datetime-local"
        value={draft}
        onChange={(event) => onFollowUpDraftChange(client.id, event.currentTarget.value)}
        className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-medium text-slate-500">{formatFollowUpLabel(client.nextFollowUpAt)}</div>
        <button
          type="button"
          disabled={isPending || !draft}
          onClick={() => onSaveFollowUp(client.id)}
          className="border border-slate-300 bg-white px-3 py-2 text-[10px] font-black tracking-[0.16em] text-slate-700 transition hover:border-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          حفظ المتابعة
        </button>
      </div>
    </div>
  );
}

function ClientCardActions({ clientId }: { clientId: string }) {
  return (
    <>
      <Link
        href={`/ws/crm/clients/${clientId}`}
        className="inline-flex border border-blue-500 bg-blue-500 px-3 py-2 text-[10px] font-black tracking-[0.18em] text-white"
      >
        فتح
      </Link>
      <div className="text-[11px] font-medium text-slate-500">
        تعديل العلاقات والمستندات يتم من سجل الصفقة الفعلي وليس من محاكاة محلية.
      </div>
    </>
  );
}

function buildCardPerson(client: CrmClientRecord) {
  return {
    id: client.id,
    type: client.personType,
    name: client.name,
    title: client.personType === "broker" ? "وسيط" : "عميل",
    avatarImage: client.avatarImage,
    avatarLabel: client.avatarLabel,
    location: client.project?.location,
    summary: client.preference,
    stageLabel: STAGE_LABELS[client.stage],
    badges: client.badges,
    relation: {
      project: client.project
        ? {
            id: client.project.id,
            title: client.project.title,
            location: client.project.location,
          }
        : null,
      unit: client.unit,
      summary: client.notes,
    },
  };
}
