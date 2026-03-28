"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceProject } from "../../projectTypes";
import { AgDeleteConfirmModal, AgPropertyForm } from "@/app/(ws)/ws/public";

function toInitialData(project: WorkspaceProject) {
  const clientVisibility: "public" | "private" =
    project.publicationState === "published" ? "public" : "private";
  return {
    name: project.title,
    price: project.priceLabel,
    location: project.location,
    status: project.publicationState === "archived" ? "maintenance" : "active",
    clientVisibility,
    shortDescription: project.shortDescription,
    amenitiesText: project.amenities.join("، "),
    hasParking: project.parking.hasParking,
    parkingSpaces: project.parking.spaces ? String(project.parking.spaces) : "",
    coverImageKey: project.gallery.coverImageKey,
    galleryDisplayMode: project.gallery.displayMode,
    galleryAspectRatio: project.gallery.aspectRatio,
    privatePermitSummary: project.permit.privateSummary ?? "",
    privatePermitFiles: project.permit.privateFiles,
    rooms: project.specs.rooms.replace(" غرف", ""),
    baths: project.specs.baths.replace(" حمامات", ""),
    area: project.specs.area.replace(" م²", ""),
    description: project.summary,
    images: [{ key: project.id, url: project.image, name: `${project.title}.jpg` }],
    video: null,
    brokerId: project.brokers[0]?.id ?? null,
    visibilityMembers: project.visibility.viewers,
  };
}

export default function AgPropertyFormEditView({ project }: { project: WorkspaceProject }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const initialData = toInitialData(project);
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
