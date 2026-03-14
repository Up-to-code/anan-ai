"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AgDeleteConfirmModal from "@/components/shared/ag-aui/AgDeleteConfirmModal";
import AgPropertyForm, { type ProjectFormData } from "@/components/shared/ag-aui/AgPropertyForm";

type ProjectFormScreenProps = {
  projectId?: string;
  initialData?: Partial<ProjectFormData>;
  title: string;
  description: string;
  submitLabel: string;
  onSave: (data: ProjectFormData) => Promise<{ redirectTo: string }>;
  onDelete?: () => Promise<{ redirectTo: string }>;
};

/**
 * WHY:   Project create/edit routes need one client wrapper around the shared form and server actions.
 * WHAT:  Handles pending UI, redirects, and delete confirmation for project form flows.
 * HOW:   Invokes server actions passed from the route and navigates when they complete.
 */
export default function ProjectFormScreen({
  projectId,
  initialData,
  title,
  description,
  submitLabel,
  onSave,
  onDelete,
}: ProjectFormScreenProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="flex min-h-full flex-col p-6 lg:p-12">
      <AgPropertyForm
        initialData={initialData}
        title={title}
        description={description}
        submitLabel={pending ? "جارٍ الحفظ..." : submitLabel}
        onSave={async (data) => {
          startTransition(async () => {
            const result = await onSave(data);
            router.push(result.redirectTo);
          });
        }}
        onCancel={projectId ? () => router.push(`/ws/projects/${projectId}`) : () => router.push("/ws/projects")}
        onDelete={onDelete ? () => setShowDeleteModal(true) : undefined}
      />

      {onDelete ? (
        <AgDeleteConfirmModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            startTransition(async () => {
              const result = await onDelete();
              router.push(result.redirectTo);
            });
          }}
          title="حذف المشروع"
          description="سيتم حذف المشروع نهائياً مع جميع بياناته المرتبطة."
          confirmLabel="حذف المشروع"
        />
      ) : null}
    </div>
  );
}
