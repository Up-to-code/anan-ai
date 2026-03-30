"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { BrokerPresence } from "../Visuals/BrokerPresenceChip";
import { createInitialFormState, STEP_DEFINITIONS } from "./shared";
import type { AgPropertyFormState } from "./shared";
import type { AgPropertyFormProps, ProjectFormData } from "./types";
import { getGalleryAspectClass, moveItem, resolveInitialCoverImageKey, resolveLicenseStatusUi, validateUploadSelection } from "./utils";

/**
 * WHY:   The property form bundles wizard state, uploads, broker selection, and save/verification side effects.
 * WHAT:  Encapsulates all interactive state and handlers needed by the six-step property form wizard.
 * HOW:   Keeps form edits local, shares upload adapters across media inputs, and exposes derived UI state for the orchestrator and step components.
 */
export function useAgPropertyForm({
  propertyId,
  initialData,
  brokers = [],
  onSave,
}: Pick<AgPropertyFormProps, "propertyId" | "initialData" | "brokers" | "onSave">) {
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(initialData?.brokerId ?? null);
  const [brokerSearch, setBrokerSearch] = useState("");
  const [showSafetyConfirm, setShowSafetyConfirm] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const licenseInputRef = useRef<HTMLInputElement | null>(null);
  const permitInputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload, isUploading } = useUploadThing("propertyMedia");
  const { startUpload: startLicenseUpload, isUploading: isLicenseUploading } =
    useUploadThing("verificationDocuments");

  const [formState, setFormState] = useState<AgPropertyFormState>(
    createInitialFormState(initialData, resolveInitialCoverImageKey(initialData)),
  );
  const adLicenseStatus = initialData?.adLicenseStatus ?? null;
  const [licenseDocs, setLicenseDocs] = useState<UploadedFileReference[]>([]);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [licenseSubmitting, setLicenseSubmitting] = useState(false);
  const [licenseSubmitted, setLicenseSubmitted] = useState(false);

  const isEditMode = Boolean(initialData);
  const adLicenseUi = resolveLicenseStatusUi(adLicenseStatus);
  const selectedBroker = useMemo(
    () => brokers.find((broker) => broker.id === selectedBrokerId),
    [brokers, selectedBrokerId],
  );
  const filteredBrokers = useMemo(() => {
    const normalizedSearch = brokerSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return brokers.slice(0, 6);
    }

    return brokers.filter(
      (broker) =>
        broker.name.toLowerCase().includes(normalizedSearch) ||
        broker.title?.toLowerCase().includes(normalizedSearch),
    );
  }, [brokerSearch, brokers]);

  const activeStep = STEP_DEFINITIONS[currentStepIndex];
  const isLastStep = currentStepIndex === STEP_DEFINITIONS.length - 1;
  const previewAspectClass = getGalleryAspectClass(formState.galleryAspectRatio);
  const previewObjectClass = formState.galleryDisplayMode === "fit" ? "object-contain" : "object-cover";

  const setCoverImageKey = (nextCoverImageKey: string | null) => {
    setFormState((prev) => ({
      ...prev,
      coverImageKey: nextCoverImageKey ?? prev.images[0]?.key ?? null,
    }));
  };

  const removeImage = (index: number) => {
    setFormState((prev) => {
      const removedImage = prev.images[index];
      const nextImages = prev.images.filter((_, imageIndex) => imageIndex !== index);
      const nextCoverImageKey =
        removedImage?.key === prev.coverImageKey ? nextImages[0]?.key ?? null : prev.coverImageKey;

      return {
        ...prev,
        images: nextImages,
        coverImageKey: nextCoverImageKey,
      };
    });
  };

  const moveImage = (fromIndex: number, offset: -1 | 1) => {
    setFormState((prev) => ({
      ...prev,
      images: moveItem(prev.images, fromIndex, fromIndex + offset),
    }));
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploadError(null);
    const validationError = validateUploadSelection(files, "image-only");
    if (validationError) {
      setUploadError(validationError);
      event.target.value = "";
      return;
    }

    try {
      const uploaded = await startUpload(files);
      const nextImages = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setFormState((prev) => {
        const mergedImages = [...prev.images, ...nextImages];
        return {
          ...prev,
          images: mergedImages,
          coverImageKey: prev.coverImageKey ?? mergedImages[0]?.key ?? null,
        };
      });
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
    const validationError = validateUploadSelection(files, "image-or-pdf");
    if (validationError) {
      setLicenseError(validationError);
      event.target.value = "";
      return;
    }

    try {
      const uploaded = await startLicenseUpload(files);
      const nextDocs = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setLicenseDocs((current) => [...current, ...nextDocs]);
    } catch (error) {
      setLicenseError(error instanceof Error ? error.message : "تعذر رفع مستندات الترخيص.");
    } finally {
      event.target.value = "";
    }
  };

  const handlePermitFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    const validationError = validateUploadSelection(files, "image-or-pdf");
    if (validationError) {
      setUploadError(validationError);
      event.target.value = "";
      return;
    }

    try {
      const uploaded = await startLicenseUpload(files);
      const nextDocs = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setFormState((prev) => ({
        ...prev,
        privatePermitFiles: [...prev.privatePermitFiles, ...nextDocs],
      }));
      setUploadError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "تعذر رفع ملفات التصريح الخاص.");
    } finally {
      event.target.value = "";
    }
  };

  const handleLicenseSubmit = async () => {
    if (!propertyId) {
      setLicenseError("الرجاء حفظ المشروع أولاً ثم إرسال طلب الترخيص.");
      return;
    }
    if (!formState.adLicenseNumber.trim()) {
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
    const payload: ProjectFormData = {
      ...formState,
      brokerId: selectedBrokerId,
      adLicenseStatus,
      visibilityMembers: formState.visibilityMembers,
    };
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

  return {
    activeStep,
    adLicenseLabel: adLicenseUi.label,
    adLicenseStatus,
    adLicenseTone: adLicenseUi.tone,
    brokerSearch,
    currentStepIndex,
    filteredBrokers,
    formState,
    handleConfirm,
    handleImageSelection,
    handleLicenseFiles,
    handleLicenseSubmit,
    handlePermitFiles,
    inputRef,
    isEditMode,
    isLastStep,
    isLicenseUploading,
    isUploading,
    licenseDocs,
    licenseError,
    licenseInputRef,
    licenseSubmitted,
    licenseSubmitting,
    moveImage,
    permitInputRef,
    previewAspectClass,
    previewObjectClass,
    removeImage,
    savePending,
    selectedBroker,
    selectedBrokerId,
    setBrokerSearch,
    setCoverImageKey,
    setCurrentStepIndex,
    setFormState,
    setLicenseDocs,
    setSelectedBrokerId,
    setShowSafetyConfirm,
    showSafetyConfirm,
    uploadError,
  };
}
