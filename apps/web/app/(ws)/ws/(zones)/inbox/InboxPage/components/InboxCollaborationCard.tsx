"use client";

import { ArrowUpLeft } from "lucide-react";
import type {
  DealShareMetadata,
  FileShareMetadata,
  InviteEventMetadata,
  ProjectShareMetadata,
  RoleEventMetadata,
} from "@/server/contracts/inbox";

type CollaborationMetadata =
  | FileShareMetadata
  | ProjectShareMetadata
  | DealShareMetadata
  | InviteEventMetadata
  | RoleEventMetadata;

function getCardLabel(metadata: CollaborationMetadata) {
  switch (metadata.contextType) {
    case "file_share":
      return "مشاركة ملف";
    case "project_share":
      return "مشاركة مشروع";
    case "deal_share":
      return "مشاركة صفقة";
    case "invite_event":
      return "تحديث دعوة";
    case "role_event":
      return "تحديث صلاحية";
  }
}

function getMetaDetails(metadata: CollaborationMetadata) {
  switch (metadata.contextType) {
    case "file_share":
      return metadata.file.mime
        ? `${metadata.file.name} · ${metadata.file.mime}`
        : metadata.file.name;
    case "project_share":
      return metadata.location ?? "مشروع مرتبط بالمساحة";
    case "deal_share":
      return metadata.value
        ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(metadata.value)} ر.س`
        : metadata.stage;
    case "invite_event":
      return `${metadata.organizationName} · ${metadata.inviteRole}`;
    case "role_event":
      return metadata.previousRole
        ? `${metadata.previousRole} ← ${metadata.organizationRole}`
        : metadata.organizationRole;
  }
}

export default function InboxCollaborationCard({
  isMe,
  metadata,
}: {
  isMe: boolean;
  metadata: CollaborationMetadata;
}) {
  return (
    <div
      className={`space-y-4 rounded-[24px] border px-4 py-4 shadow-sm ${
        isMe
          ? "border-[color:color-mix(in_srgb,var(--workspace-border)_60%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-bubble-self)_84%,var(--workspace-panel))] text-[var(--workspace-bubble-self-foreground)]"
          : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-bubble-other-foreground)]"
      }`}
    >
      <div className="space-y-1">
        <div className={`text-[11px] font-black tracking-[0.18em] ${isMe ? "text-[var(--workspace-bubble-self-muted)]" : "text-[var(--workspace-highlight)]"}`}>{getCardLabel(metadata)}</div>
        <div className="text-sm font-black leading-6">{metadata.title}</div>
      </div>
      <div className={`text-xs font-medium ${isMe ? "text-[var(--workspace-bubble-self-muted)]" : "text-[var(--workspace-bubble-other-muted)]"}`}>
        {metadata.actor.name}
        {metadata.actor.organizationName ? ` · ${metadata.actor.organizationName}` : ""}
      </div>
      <div className={`rounded-2xl border px-3 py-3 text-sm font-medium leading-6 ${isMe ? "border-[color:color-mix(in_srgb,var(--workspace-border)_52%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-bubble-self)_74%,var(--workspace-panel))] text-[var(--workspace-bubble-self-foreground)]" : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)]"}`}>{metadata.summary}</div>
      <div className={`text-xs font-bold ${isMe ? "text-[var(--workspace-bubble-self-foreground)]" : "text-[var(--workspace-bubble-other-foreground)]"}`}>
        {getMetaDetails(metadata)}
      </div>
      <a
        href={metadata.action.href}
        className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold transition ${
          isMe
            ? "rounded-xl border-[color:color-mix(in_srgb,var(--workspace-border)_52%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-bubble-self)_74%,var(--workspace-panel))] text-[var(--workspace-bubble-self-foreground)] hover:brightness-110"
            : "rounded-xl border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-accent-soft)] hover:text-[var(--workspace-highlight)]"
        }`}
      >
        <ArrowUpLeft className="h-3.5 w-3.5" />
        {metadata.action.label}
      </a>
    </div>
  );
}
