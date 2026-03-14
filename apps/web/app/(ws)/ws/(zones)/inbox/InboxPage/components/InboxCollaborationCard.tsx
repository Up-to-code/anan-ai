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

/**
 * WHY:   Inbox collaboration messages need a shared business-card treatment beyond plain text and offer cards.
 * WHAT:  Renders file, project, deal, invite, and role event cards with one compact CTA.
 * HOW:   Uses the typed inbox metadata union to choose a small label, summary, details row, and deep link action.
 */
export default function InboxCollaborationCard({
  isMe,
  metadata,
}: {
  isMe: boolean;
  metadata: CollaborationMetadata;
}) {
  return (
    <div className={`space-y-3 border px-4 py-4 ${isMe ? "border-white/20 bg-white/10" : "border-slate-200 bg-white"}`}>
      <div className="space-y-1">
        <div className={`text-xs font-bold ${isMe ? "text-blue-100" : "text-blue-700"}`}>{getCardLabel(metadata)}</div>
        <div className="text-sm font-black leading-6">{metadata.title}</div>
      </div>

      <div className={`text-xs font-medium ${isMe ? "text-blue-100" : "text-slate-600"}`}>
        {metadata.actor.name}
        {metadata.actor.organizationName ? ` · ${metadata.actor.organizationName}` : ""}
      </div>

      <div className={`text-sm font-medium leading-6 ${isMe ? "text-blue-50" : "text-slate-600"}`}>{metadata.summary}</div>

      <div className={`text-xs font-bold ${isMe ? "text-white" : "text-slate-700"}`}>
        {getMetaDetails(metadata)}
      </div>

      <a
        href={metadata.action.href}
        className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold transition ${
          isMe
            ? "border-white/25 text-white hover:bg-white/10"
            : "border-slate-200 text-slate-800 hover:border-blue-200 hover:text-blue-700"
        }`}
      >
        <ArrowUpLeft className="h-3.5 w-3.5" />
        {metadata.action.label}
      </a>
    </div>
  );
}
