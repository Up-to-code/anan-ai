"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AgDeleteConfirmModal, AgPropertyForm, type ProjectFormData } from "@/app/(ws)/ws/public";
import { toProjectFormClientResult, type ProjectFormActionResult, type ProjectFormClientResult } from "./projectFormSubmission";

type ProjectFormScreenProps = {
  projectId?: string;
  initialData?: Partial<ProjectFormData>;
  title: string;
  description: string;
  submitLabel: string;
  onSave: (data: ProjectFormData) => Promise<ProjectFormActionResult>;
  onDelete?: () => Promise<{ redirectTo: string }>;
  onRevokeViewer?: (viewerAuthUserId: string) => Promise<void>;
};

function ProjectDeleteModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AgDeleteConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="حذف المشروع"
      description="سيتم حذف المشروع نهائياً مع جميع بياناته المرتبطة."
      confirmLabel="حذف المشروع"
    />
  );
}

function useProjectFormActions(args: {
  projectId?: string;
  onSave: (data: ProjectFormData) => Promise<ProjectFormActionResult>;
  onDelete?: () => Promise<{ redirectTo: string }>;
  onRevokeViewer?: (viewerAuthUserId: string) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const cancelHref = args.projectId ? `/ws/projects/${args.projectId}` : "/ws/projects";
  const handleSave = async (data: ProjectFormData): Promise<ProjectFormClientResult> => {
    const result = await args.onSave(data);
    if (!result.ok) {
      return toProjectFormClientResult(result);
    }

    startTransition(() => router.push(result.redirectTo));
    return toProjectFormClientResult(result);
  };
  const handleDeleteConfirm = () => {
    if (!args.onDelete) return;
    const onDelete = args.onDelete;
    startTransition(async () => router.push((await onDelete()).redirectTo));
  };
  const handleCancel = () => router.push(cancelHref);
  return {
    pending,
    showDeleteModal,
    handleSave,
    handleCancel,
    handleDeleteConfirm,
    openDeleteModal: () => setShowDeleteModal(true),
    closeDeleteModal: () => setShowDeleteModal(false),
  };
}

function ProjectFormLayout(args: {
  projectId?: string;
  initialData?: Partial<ProjectFormData>;
  title: string;
  description: string;
  submitLabel: string;
  pending: boolean;
  onSave: (data: ProjectFormData) => Promise<ProjectFormClientResult>;
  onCancel: () => void;
  onDelete?: () => void;
  onRevokeViewer?: (viewerAuthUserId: string) => Promise<void>;
  showDeleteModal: boolean;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
}) {
  return (
    <div className="min-h-full bg-background px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <AgPropertyForm
        propertyId={args.projectId}
        initialData={args.initialData}
        title={args.title}
        description={args.description}
        submitLabel={args.pending ? "جارٍ الحفظ..." : args.submitLabel}
        onSave={args.onSave}
        onCancel={args.onCancel}
        onDelete={args.onDelete}
        onRevokeViewer={args.onRevokeViewer}
      />
      {args.onDelete ? (
        <ProjectDeleteModal open={args.showDeleteModal} onClose={args.onDeleteClose} onConfirm={args.onDeleteConfirm} />
      ) : null}
    </div>
  );
}

export default function ProjectFormScreen({
  projectId,
  initialData,
  title,
  description,
  submitLabel,
  onSave,
  onDelete,
  onRevokeViewer,
}: ProjectFormScreenProps) {
  const {
    pending,
    showDeleteModal,
    handleSave,
    handleCancel,
    handleDeleteConfirm,
    openDeleteModal,
    closeDeleteModal,
  } = useProjectFormActions({ projectId, onSave, onDelete, onRevokeViewer });

  return (
    <ProjectFormLayout
      projectId={projectId}
      initialData={initialData}
      title={title}
      description={description}
      submitLabel={submitLabel}
      pending={pending}
      onSave={handleSave}
      onCancel={handleCancel}
      onDelete={onDelete ? openDeleteModal : undefined}
      onRevokeViewer={onRevokeViewer}
      showDeleteModal={showDeleteModal}
      onDeleteClose={closeDeleteModal}
      onDeleteConfirm={handleDeleteConfirm}
    />
  );
}
