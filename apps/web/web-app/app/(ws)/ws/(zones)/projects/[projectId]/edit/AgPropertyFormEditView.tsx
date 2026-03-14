"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceProject } from "../../projectTypes";
import AgPropertyForm from "@/components/shared/ag-aui/AgPropertyForm";
import AgDeleteConfirmModal from "@/components/shared/ag-aui/AgDeleteConfirmModal";

/**
 * WHY:   Editing a project should use the exact same rich form as creation.
 * WHAT:  A client-side wrapper that initializes AgPropertyForm with project data.
 * HOW:   Maps WorkspaceProject to ProjectFormData and handles routing/modals.
 */
export default function AgPropertyFormEditView({ project }: { project: WorkspaceProject }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const initialData = {
    name: project.title,
    price: project.priceLabel,
    location: project.location,
    status: project.publicationState === "published" ? "active" : project.publicationState === "draft" ? "pending" : "maintenance",
    rooms: project.specs.rooms.replace(" غرف", ""),
    baths: project.specs.baths.replace(" حمامات", ""),
    area: project.specs.area.replace(" م²", ""),
    description: project.summary,
    images: [{ key: project.id, url: project.image, name: `${project.title}.jpg` }],
    video: null,
    brokerId: project.brokers[0]?.id ?? null,
  };

  return (
    <div className="flex min-h-full flex-col p-6 lg:p-12">
      <AgPropertyForm
        initialData={initialData}
        title="تعديل المشروع"
        description={`${project.title} — تعديل البيانات والصور والوسطاء المرتبطين.`}
        submitLabel="حفظ التعديلات"
        onSave={() => router.push(`/ws/projects/${project.id}`)}
        onCancel={() => router.push(`/ws/projects/${project.id}`)}
        onDelete={() => setShowDeleteModal(true)}
      />

      <AgDeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => router.push("/ws/projects")}
        title={`حذف مشروع: ${project.title}`}
        description="سيتم إزالة المشروع نهائياً مع جميع الوسطاء والوحدات المرتبطة به."
        confirmLabel="حذف المشروع"
      />
    </div>
  );
}
