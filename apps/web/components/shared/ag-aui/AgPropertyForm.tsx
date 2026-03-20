"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import ZonePageIntro from "../../../app/(ws)/ws/_components/ZoneShell/ZonePageIntro";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { BrokerPresence } from "../../../app/(ws)/ws/_components/Visuals/BrokerPresenceChip";
import type { AgPropertyFormState } from "./AgPropertyForm.shared";
import { AgPropertyFormHeaderActions } from "./AgPropertyFormHeaderActions";
import { AgPropertyFormPrimaryColumn } from "./AgPropertyFormPrimaryColumn";
import { AgPropertyFormSafetyOverlay } from "./AgPropertyFormSafetyOverlay";
import { AgPropertyFormSidebar } from "./AgPropertyFormSidebar";

export type ProjectFormData = {
  name: string;
  price: string;
  location: string;
  description: string;
  rooms: string;
  baths: string;
  area: string;
  status: string;
  images: UploadedFileReference[];
  video: string | null;
  brokerId: string | null;
  adLicenseNumber?: string;
  adLicenseStatus?: "pending" | "approved" | "rejected" | null;
};

type AgPropertyFormProps = {
  propertyId?: string;
  initialData?: Partial<ProjectFormData>;
  brokers?: BrokerPresence[];
  title?: string;
  description?: string;
  submitLabel?: string;
  onSave?: (data: ProjectFormData) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: () => void;
};

/**
 * WHY:   Institutional real-estate interfaces require structured, non-flex grid layouts for perfect alignment.
 * WHAT:  Evolved property engine with multi-image/video support and UX safety logic. Supports create & edit.
 * HOW:   Redesigned to follow the flat, stark, minimalist "lazy/base" aesthetic like the Market page.
 */
export default function AgPropertyForm({
  propertyId,
  initialData,
  brokers = [],
  title = "مسؤولية الاطلاع",
  description = "تكامل البيانات وإدارة الأصول العقارية المركزية. مراجعة، تدقيق، ونشر.",
  submitLabel = "تأكيد ونشر المشروع",
  onSave,
  onCancel,
  onDelete,
}: AgPropertyFormProps) {
    const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(initialData?.brokerId ?? null);
    const [brokerSearch, setBrokerSearch] = useState("");
    const [isBrokerDropdownOpen, setIsBrokerDropdownOpen] = useState(false);
    const [showSafetyConfirm, setShowSafetyConfirm] = useState(false);
    const [savePending, setSavePending] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { startUpload, isUploading } = useUploadThing("propertyMedia");
    const { startUpload: startLicenseUpload, isUploading: isLicenseUploading } = useUploadThing("verificationDocuments");

    const [formState, setFormState] = useState<AgPropertyFormState>({
        name: initialData?.name ?? "",
        price: initialData?.price ?? "",
        location: initialData?.location ?? "",
        description: initialData?.description ?? "",
        rooms: initialData?.rooms ?? "",
        baths: initialData?.baths ?? "",
        area: initialData?.area ?? "",
        status: initialData?.status ?? "active",
        images: initialData?.images ?? [],
        video: initialData?.video ?? null,
        adLicenseNumber: initialData?.adLicenseNumber ?? ""
    });
    const adLicenseStatus = initialData?.adLicenseStatus ?? null;
    const [licenseDocs, setLicenseDocs] = useState<UploadedFileReference[]>([]);
    const [licenseError, setLicenseError] = useState<string | null>(null);
    const [licenseSubmitting, setLicenseSubmitting] = useState(false);
    const [licenseSubmitted, setLicenseSubmitted] = useState(false);
    const licenseInputRef = useRef<HTMLInputElement | null>(null);

    const isEditMode = Boolean(initialData);
    const adLicenseLabel =
      adLicenseStatus === "approved"
        ? "معتمد"
        : adLicenseStatus === "rejected"
          ? "مرفوض"
          : adLicenseStatus === "pending"
            ? "قيد المراجعة"
            : "غير مكتمل";
    const adLicenseTone =
      adLicenseStatus === "approved"
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : adLicenseStatus === "rejected"
          ? "text-rose-700 bg-rose-50 border-rose-200"
          : adLicenseStatus === "pending"
            ? "text-amber-700 bg-amber-50 border-amber-200"
            : "text-slate-600 bg-slate-50 border-slate-200";

    const filteredBrokers = useMemo(() => {
        return brokers.filter(b => 
            b.name.toLowerCase().includes(brokerSearch.toLowerCase()) || 
            b.title?.toLowerCase().includes(brokerSearch.toLowerCase())
        );
    }, [brokerSearch, brokers]);

    const selectedBroker = useMemo(() => 
        brokers.find(b => b.id === selectedBrokerId), 
    [selectedBrokerId, brokers]);

    const removeImage = (index: number) => {
        setFormState(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length === 0) {
        return;
      }

      setUploadError(null);

      try {
        const uploaded = await startUpload(files);
        const nextImages =
          uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
        setFormState((prev) => ({ ...prev, images: [...prev.images, ...nextImages] }));
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "تعذر رفع الصور حالياً.");
      } finally {
        event.target.value = "";
      }
    };

    const handleLicenseFiles = async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length === 0) {
        return;
      }
      setLicenseError(null);
      setLicenseSubmitted(false);

      try {
        const uploaded = await startLicenseUpload(files);
        const nextDocs =
          uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
        setLicenseDocs((current) => [...current, ...nextDocs]);
      } catch (error) {
        setLicenseError(error instanceof Error ? error.message : "تعذر رفع مستندات الترخيص.");
      } finally {
        event.target.value = "";
      }
    };

    const handleLicenseSubmit = async () => {
      if (!propertyId) {
        setLicenseError("الرجاء حفظ المشروع أولاً ثم إرسال طلب الترخيص.");
        return;
      }
      if (!formState.adLicenseNumber?.trim()) {
        setLicenseError("الرجاء إدخال رقم رخصة الإعلان العقاري.");
        return;
      }
      if (licenseDocs.length === 0) {
        setLicenseError("الرجاء رفع مستند واحد على الأقل لإرسال الطلب.");
        return;
      }
      setLicenseSubmitting(true);
      setLicenseError(null);
      setLicenseSubmitted(false);
      try {
        const response = await fetch("/api/property-verification-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            adLicenseNumber: formState.adLicenseNumber.trim(),
            documents: licenseDocs,
          }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message ?? "تعذر إرسال الطلب.");
        }
        setLicenseSubmitted(true);
      } catch (error) {
        setLicenseError(error instanceof Error ? error.message : "تعذر إرسال الطلب.");
      } finally {
        setLicenseSubmitting(false);
      }
    };

    const handleConfirm = async () => {
      const payload: ProjectFormData = { ...formState, brokerId: selectedBrokerId, adLicenseStatus };
      setSavePending(true);
      try {
        if (onSave) {
          await onSave(payload);
        }
        setShowSafetyConfirm(false);
      } finally {
        setSavePending(false);
      }
    };

    return (
        <div className="flex flex-col min-h-full pb-32">
            {showSafetyConfirm && (
              <AgPropertyFormSafetyOverlay
                savePending={savePending}
                onConfirm={handleConfirm}
                onClose={() => setShowSafetyConfirm(false)}
              />
            )}

            <ZonePageIntro
              eyebrow="العمليات التشغيلية"
              title={title}
              description={description}
              actions={
                isEditMode ? (
                  <AgPropertyFormHeaderActions onCancel={onCancel} onDelete={onDelete} />
                ) : undefined
              }
            />

            <div className="grid gap-8 px-6 py-6 lg:px-8 lg:py-8 xl:grid-cols-[1fr_400px]">
              <AgPropertyFormPrimaryColumn
                brokerSearch={brokerSearch}
                filteredBrokers={filteredBrokers}
                formState={formState}
                isBrokerDropdownOpen={isBrokerDropdownOpen}
                selectedBroker={selectedBroker}
                setBrokerSearch={setBrokerSearch}
                setFormState={setFormState}
                setIsBrokerDropdownOpen={setIsBrokerDropdownOpen}
                setSelectedBrokerId={setSelectedBrokerId}
              />

              <AgPropertyFormSidebar
                adLicenseLabel={adLicenseLabel}
                adLicenseTone={adLicenseTone}
                formState={formState}
                handleImageSelection={handleImageSelection}
                handleLicenseFiles={handleLicenseFiles}
                handleLicenseSubmit={handleLicenseSubmit}
                inputRef={inputRef}
                isLicenseUploading={isLicenseUploading}
                isUploading={isUploading}
                licenseDocs={licenseDocs}
                licenseError={licenseError}
                licenseInputRef={licenseInputRef}
                licenseSubmitted={licenseSubmitted}
                licenseSubmitting={licenseSubmitting}
                onRemoveImage={removeImage}
                propertyId={propertyId}
                savePending={savePending}
                setFormState={setFormState}
                setLicenseDocs={setLicenseDocs}
                setShowSafetyConfirm={setShowSafetyConfirm}
                submitLabel={submitLabel}
                uploadError={uploadError}
              />
            </div>
        </div>
    );
}
