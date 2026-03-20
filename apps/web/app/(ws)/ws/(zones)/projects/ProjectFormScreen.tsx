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
  onSave: (data: ProjectFormData) => Promise<{ redirectTo: string }>;
  onDelete?: () => Promise<{ redirectTo: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const cancelHref = args.projectId ? `/ws/projects/${args.projectId}` : "/ws/projects";
  const handleSave = async (data: ProjectFormData) => {
    startTransition(async () => router.push((await args.onSave(data)).redirectTo));
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
  onSave: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  showDeleteModal: boolean;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col p-6 lg:p-12">
      <AgPropertyForm
        propertyId={args.projectId}
        initialData={args.initialData}
        title={args.title}
        description={args.description}
        submitLabel={args.pending ? "جارٍ الحفظ..." : args.submitLabel}
        onSave={args.onSave}
        onCancel={args.onCancel}
        onDelete={args.onDelete}
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
}: ProjectFormScreenProps) {
  const {
    pending,
    showDeleteModal,
    handleSave,
    handleCancel,
    handleDeleteConfirm,
    openDeleteModal,
    closeDeleteModal,
  } = useProjectFormActions({ projectId, onSave, onDelete });

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
      showDeleteModal={showDeleteModal}
      onDeleteClose={closeDeleteModal}
      onDeleteConfirm={handleDeleteConfirm}
    />
  );
}
