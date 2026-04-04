"use client";

import Link from "next/link";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import PersonCard from "../../../../_components/Visuals/PersonCard";
import type { CrmClientRecord } from "../../types/crmTypes";
import { formatFollowUpLabel, getFollowUpPresentation, getStageLabel } from "./PipelineWorkspace.helpers";

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
  const { locale } = useWebLocale();
  const followUp = getFollowUpPresentation(client.nextFollowUpAt, locale);
  return (
    <div draggable onDragStart={() => onDragStartClient(client.id)} className="cursor-grab active:cursor-grabbing">
      <PersonCard
        person={buildCardPerson(client, locale)}
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
  const { locale } = useWebLocale();
  return (
    <div className="space-y-3 border-t border-border/60 pt-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">{client.budgetLabel}</div>
        <div className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold tracking-wide ${followUpTone}`}>
          {locale === "fr" ? "Suivi :" : locale === "en" ? "Follow-up:" : "متابعة:"} {followUpLabel}
        </div>
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
  const { locale } = useWebLocale();
  return (
    <div className="space-y-2 mt-2">
      <label className="block text-[11px] font-bold text-muted-foreground">
        {locale === "fr" ? "Prochain suivi" : locale === "en" ? "Next follow-up" : "المتابعة القادمة"}
      </label>
      <input
        type="datetime-local"
        value={draft}
        onChange={(event) => onFollowUpDraftChange(client.id, event.currentTarget.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="text-[11px] font-medium text-muted-foreground">{formatFollowUpLabel(client.nextFollowUpAt, locale)}</div>
        <button
          type="button"
          disabled={isPending || !draft}
          onClick={() => onSaveFollowUp(client.id)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-bold text-foreground transition hover:border-foreground/30 hover:bg-muted/50 disabled:opacity-50"
        >
          {locale === "fr" ? "Enregistrer le suivi" : locale === "en" ? "Save follow-up" : "حفظ المتابعة"}
        </button>
      </div>
    </div>
  );
}

function ClientCardActions({ clientId }: { clientId: string }) {
  const { locale } = useWebLocale();
  return (
    <div className="pt-1">
      <Link
        href={`/ws/crm/clients/${clientId}`}
        className="inline-flex rounded-lg border border-border bg-foreground px-4 py-2 text-[11px] font-bold tracking-wide text-background transition hover:bg-foreground/90 hover:opacity-90"
      >
        {locale === "fr" ? "Ouvrir la fiche" : locale === "en" ? "Open record" : "فتح السجل"}
      </Link>
      <div className="mt-2 text-[11px] leading-relaxed font-medium text-muted-foreground">
        {locale === "fr"
          ? "La modification des relations et des documents se fait depuis la fiche reelle de la transaction, pas depuis une simulation locale."
          : locale === "en"
            ? "Relationship and document edits happen from the real deal record, not from this local simulation."
            : "تعديل العلاقات والمستندات يتم من سجل الصفقة الفعلي وليس من محاكاة محلية."}
      </div>
    </div>
  );
}

function buildCardPerson(client: CrmClientRecord, locale: "ar" | "en" | "fr") {
  return {
    id: client.id,
    type: client.personType,
    name: client.name,
    title: client.relationLabel,
    avatarImage: client.avatarImage,
    avatarLabel: client.avatarLabel,
    location: client.project?.location,
    summary: client.preference,
    stageLabel: getStageLabel(client.stage, locale),
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
      stageLabel:
        client.broker?.state === "client-linked"
          ? locale === "fr"
            ? "Suivi courtier"
            : locale === "en"
              ? "Broker follow-up"
              : "متابعة وسيط"
          : undefined,
      summary: client.notes,
    },
  };
}
