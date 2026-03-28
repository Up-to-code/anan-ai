"use client";

import { ArrowUpLeft } from "lucide-react";
import { cn } from "@/lib/utils";
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
      className={cn(
        "min-w-0 space-y-5 rounded-2xl border p-5 shadow-sm transition-all",
        isMe
          ? "border-foreground/10 bg-foreground/5 text-foreground"
          : "border-border bg-card text-foreground"
      )}
    >
      <div className="space-y-1.5">
        <div className={cn(
          "text-[11px] font-black uppercase tracking-widest",
          isMe ? "text-foreground/60" : "text-foreground/70"
        )}>
          {getCardLabel(metadata)}
        </div>
        <div className="break-words text-sm font-black leading-6 [overflow-wrap:anywhere]">{metadata.title}</div>
      </div>
      <div className={cn("break-words text-[12px] font-bold [overflow-wrap:anywhere]", isMe ? "text-foreground/70" : "text-muted-foreground")}>
        {metadata.actor.name}
        {metadata.actor.organizationName ? ` · ${metadata.actor.organizationName}` : ""}
      </div>
      <div className={cn(
        "rounded-xl border px-4 py-3.5 text-[13px] font-medium leading-relaxed break-words [overflow-wrap:anywhere]",
        isMe 
          ? "border-foreground/20 bg-foreground/10 text-foreground" 
          : "border-border bg-muted/30 text-foreground"
      )}>
        {metadata.summary}
      </div>
      <div className={cn("break-words text-[13px] font-black [overflow-wrap:anywhere]", isMe ? "text-foreground" : "text-foreground")}>
        {getMetaDetails(metadata)}
      </div>
      <a
        href={metadata.action.href}
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-bold transition-all",
          isMe
            ? "border-foreground/20 bg-foreground text-background hover:bg-foreground/90"
            : "border-border bg-card text-foreground hover:bg-muted"
        )}
      >
        <ArrowUpLeft className="h-4 w-4" />
        <span className="truncate">{metadata.action.label}</span>
      </a>
    </div>
  );
}
