"use client";

import Link from "next/link";
import {
  BarChart3,
  MessageSquareMore,
  MoreHorizontal,
  PencilLine,
  PlusCircle,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";
import type { WorkspaceProject } from "../../types/projectTypes";
import type { ProjectMutationActionResult } from "../../pages/ProjectsPage/actionTypes";

type ProjectActionsMenuProps = {
  project: WorkspaceProject;
  isPending: boolean;
  onPublish?: () => void;
  onDelete?: () => void;
  onTrackProjectEvent?: (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<ProjectMutationActionResult>;
};

const itemClassName =
  "flex w-full cursor-pointer items-center justify-end gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] font-black text-foreground focus:bg-[var(--workspace-elevated)]";

export default function ProjectActionsMenu({
  project,
  isPending,
  onPublish,
  onDelete,
  onTrackProjectEvent,
}: ProjectActionsMenuProps) {
  const editHref =
    project.inventoryKind === "standalone_unit" && project.units[0]
      ? `/ws/projects/${project.id}/units/${project.units[0].id}/edit`
      : `/ws/projects/${project.id}/edit`;
  const hiddenLabels = [
    "تحليل المشروع",
    project.canEdit ? "تعديل المشروع" : null,
    project.canEdit && project.publicationState === "draft" && onPublish ? "نشر المشروع" : null,
    project.canEdit && project.inventoryKind === "project" ? "إضافة وحدة داخل المشروع" : null,
    "إنشاء عرض",
    "فتح المحادثات",
    project.canEdit && onDelete ? "حذف المشروع" : null,
  ].filter(Boolean).join(" ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <button
            type="button"
            disabled={isPending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--workspace-panel)_78%,transparent)] text-foreground shadow-sm backdrop-blur-xl transition hover:bg-[var(--workspace-panel)] disabled:opacity-60"
            aria-label="إجراءات المشروع"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{hiddenLabels}</span>
          </button>
        )}
      />
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(21rem,calc(100vw-1rem))] min-w-0 rounded-[18px] bg-[var(--workspace-panel)] p-2 shadow-2xl ring-1 ring-black/5"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2 text-right text-[11px] font-black text-[var(--workspace-muted)]">
            إجراءات المشروع
          </DropdownMenuLabel>
          <DropdownMenuItem
            render={<Link href={`/ws/projects/${project.id}/analytics`} />}
            className={itemClassName}
            onClick={() => {
              void onTrackProjectEvent?.({ eventType: "project_analyze_click", source: "project_detail_top_nav" });
            }}
          >
            <span className="min-w-0 flex-1">تحليل المشروع</span>
            <BarChart3 className="h-4 w-4 text-[var(--workspace-muted)]" />
          </DropdownMenuItem>
          {project.canEdit ? (
            <DropdownMenuItem
              render={<Link href={editHref} data-testid="project-detail-edit" />}
              className={itemClassName}
              onClick={() => {
                void onTrackProjectEvent?.({ eventType: "project_edit_click", source: "project_detail_top_nav" });
              }}
            >
              <span className="min-w-0 flex-1">تعديل المشروع</span>
              <PencilLine className="h-4 w-4 text-[var(--workspace-muted)]" />
            </DropdownMenuItem>
          ) : null}
          {project.canEdit && project.publicationState === "draft" && onPublish ? (
            <DropdownMenuItem
              nativeButton
              render={<button type="button" data-testid="project-detail-publish" />}
              className={itemClassName}
              onClick={onPublish}
            >
              <span className="min-w-0 flex-1">نشر المشروع</span>
              <UploadCloud className="h-4 w-4 text-[var(--workspace-muted)]" />
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-2 bg-[var(--workspace-border)]" />
        <DropdownMenuGroup>
          {project.canEdit && project.inventoryKind === "project" ? (
            <DropdownMenuItem render={<Link href={`/ws/projects/${project.id}/units/create`} />} className={itemClassName}>
              <span className="min-w-0 flex-1">إضافة وحدة داخل المشروع</span>
              <PlusCircle className="h-4 w-4 text-[var(--workspace-muted)]" />
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            render={<Link href={`/ws/offers/create?propertyId=${project.propertyId}&mode=open_offer`} />}
            className={itemClassName}
            onClick={() => {
              void onTrackProjectEvent?.({ eventType: "project_create_offer_click", source: "project_detail_top_nav" });
            }}
          >
            <span className="min-w-0 flex-1">إنشاء عرض</span>
            <PlusCircle className="h-4 w-4 text-[var(--workspace-muted)]" />
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/ws/inbox" />}
            className={itemClassName}
            onClick={() => {
              void onTrackProjectEvent?.({ eventType: "project_open_inbox_click", source: "project_detail_top_nav" });
            }}
          >
            <span className="min-w-0 flex-1">فتح المحادثات</span>
            <MessageSquareMore className="h-4 w-4 text-[var(--workspace-muted)]" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {project.canEdit && onDelete ? (
          <>
            <DropdownMenuSeparator className="my-2 bg-[var(--workspace-border)]" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                nativeButton
                render={<button type="button" data-testid="project-detail-delete" />}
                className="flex w-full cursor-pointer items-center justify-end gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] font-black text-rose-700 focus:bg-rose-500/10 dark:text-rose-300"
                onClick={onDelete}
              >
                <span className="min-w-0 flex-1">حذف المشروع</span>
                <Trash2 className="h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
