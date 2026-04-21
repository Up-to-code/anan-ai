"use client";

import { memo } from "react"
import { ArrowUpLeft } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { formatLocaleNumber } from "@/lib/locale";
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

function getCardLabel(metadata: CollaborationMetadata, dictionary: ReturnType<typeof useWebLocale>["dictionary"]) {
  switch (metadata.contextType) {
    case "file_share":
      return dictionary.inbox.fileShareLabel;
    case "project_share":
      return dictionary.inbox.projectShareLabel;
    case "deal_share":
      return dictionary.inbox.dealShareLabel;
    case "invite_event":
      return dictionary.inbox.inviteUpdateLabel;
    case "role_event":
      return dictionary.inbox.roleUpdateLabel;
  }
}

function getMetaDetails(metadata: CollaborationMetadata, locale: ReturnType<typeof useWebLocale>["locale"], dictionary: ReturnType<typeof useWebLocale>["dictionary"]) {
  switch (metadata.contextType) {
    case "file_share":
      return metadata.file.mime
        ? `${metadata.file.name} · ${metadata.file.mime}`
        : metadata.file.name;
    case "project_share":
      return metadata.location ?? dictionary.inbox.workspaceProject;
    case "deal_share":
      return metadata.value
        ? `${formatLocaleNumber(locale, metadata.value, { maximumFractionDigits: 0 })} ر.س`
        : metadata.stage;
    case "invite_event":
      return `${metadata.organizationName} · ${metadata.inviteRole}`;
    case "role_event":
      return metadata.previousRole
        ? `${metadata.previousRole} ← ${metadata.organizationRole}`
        : metadata.organizationRole;
  }
}

const InboxCollaborationCardComponent = function InboxCollaborationCard({
  isMe,
  metadata,
}: {
  isMe: boolean;
  metadata: CollaborationMetadata;
}) {
  const { dictionary, locale } = useWebLocale();
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
          {getCardLabel(metadata, dictionary)}
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
        {getMetaDetails(metadata, locale, dictionary)}
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

export default memo(InboxCollaborationCardComponent)
