"use client";

import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { BrokerPresence } from "../../Visuals/BrokerPresenceChip";
import {
  getFirstProjectFormErrorStep,
  type ProjectFormSubmissionFeedback,
  validateProjectFormSubmission,
} from "../../../(zones)/projects/projectFormSubmission";
import { createInitialFormState, getStepDefinitions } from "./shared";
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
  const { locale } = useWebLocale();
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(initialData?.brokerId ?? null);
  const [brokerSearch, setBrokerSearch] = useState("");
  const [showSafetyConfirm, setShowSafetyConfirm] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<ProjectFormSubmissionFeedback | null>(null);
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
  const adLicenseUi = resolveLicenseStatusUi(adLicenseStatus, locale);
  const stepDefinitions = getStepDefinitions(locale);
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

  const activeStep = stepDefinitions[currentStepIndex];
  const isLastStep = currentStepIndex === stepDefinitions.length - 1;
  const previewAspectClass = getGalleryAspectClass(formState.galleryAspectRatio);
  const previewObjectClass = formState.galleryDisplayMode === "fit" ? "object-contain" : "object-cover";

  const clearSubmissionFeedback = () => setSubmissionFeedback(null);
  const setFormStateWithFeedbackReset: React.Dispatch<React.SetStateAction<AgPropertyFormState>> = (value) => {
    clearSubmissionFeedback();
    setFormState(value);
  };

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
    const validationError = validateUploadSelection(files, "image-only", locale);
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
      setUploadError(
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de televerser les images pour le moment."
            : locale === "en"
              ? "Could not upload the images right now."
              : "تعذر رفع الصور حالياً.",
      );
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
    const validationError = validateUploadSelection(files, "image-or-pdf", locale);
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
      setLicenseError(
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de televerser les documents de licence."
            : locale === "en"
              ? "Could not upload the license documents."
              : "تعذر رفع مستندات الترخيص.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handlePermitFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    const validationError = validateUploadSelection(files, "image-or-pdf", locale);
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
      setUploadError(
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de televerser les fichiers d'autorisation privee."
            : locale === "en"
              ? "Could not upload the private permit files."
              : "تعذر رفع ملفات التصريح الخاص.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleLicenseSubmit = async () => {
    if (!propertyId) {
      setLicenseError(
        locale === "fr"
          ? "Enregistrez d'abord le projet avant d'envoyer la demande de licence."
          : locale === "en"
            ? "Save the project first, then submit the license request."
            : "الرجاء حفظ المشروع أولاً ثم إرسال طلب الترخيص.",
      );
      return;
    }
    if (!formState.adLicenseNumber.trim()) {
      setLicenseError(
        locale === "fr"
          ? "Veuillez saisir le numero de licence publicitaire."
          : locale === "en"
            ? "Please enter the real estate ad license number."
            : "الرجاء إدخال رقم رخصة الإعلان العقاري.",
      );
      return;
    }
    if (licenseDocs.length === 0) {
      setLicenseError(
        locale === "fr"
          ? "Veuillez televerser au moins un document avant l'envoi."
          : locale === "en"
            ? "Please upload at least one document before submitting."
            : "الرجاء رفع مستند واحد على الأقل لإرسال الطلب.",
      );
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
        throw new Error(
          payload?.message ??
            (locale === "fr"
              ? "Impossible d'envoyer la demande."
              : locale === "en"
                ? "Could not submit the request."
                : "تعذر إرسال الطلب."),
        );
      }
      setLicenseSubmitted(true);
    } catch (error) {
      setLicenseError(
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible d'envoyer la demande."
            : locale === "en"
              ? "Could not submit the request."
              : "تعذر إرسال الطلب.",
      );
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
    const validationFeedback = validateProjectFormSubmission(payload);
    if (validationFeedback) {
      setSubmissionFeedback(validationFeedback);
      setCurrentStepIndex(getFirstProjectFormErrorStep(validationFeedback.fieldErrors));
      setShowSafetyConfirm(false);
      return;
    }

    setSavePending(true);
    try {
      if (onSave) {
        const result = await onSave(payload);
        if (!result.ok) {
          setSubmissionFeedback(result.feedback);
          setCurrentStepIndex(getFirstProjectFormErrorStep(result.feedback.fieldErrors));
          setShowSafetyConfirm(false);
          return;
        }
      }
      setSubmissionFeedback(null);
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
    setCurrentStepIndex,
    setBrokerSearch,
    setCoverImageKey,
    setFormState: setFormStateWithFeedbackReset,
    setLicenseDocs,
    setSelectedBrokerId,
    setShowSafetyConfirm,
    showSafetyConfirm,
    submissionFeedback,
    uploadError,
  };
}
