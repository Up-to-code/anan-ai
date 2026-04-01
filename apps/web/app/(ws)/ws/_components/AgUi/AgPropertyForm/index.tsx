"use client";

import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import ZonePageIntro from "../../ZoneShell/ZonePageIntro";
import { AgPropertyFormHeaderActions } from "../AgPropertyFormHeaderActions";
import { AgPropertyFormSafetyOverlay } from "../AgPropertyFormSafetyOverlay";
import { useAgPropertyForm } from "./useAgPropertyForm";
import type { AgPropertyFormProps } from "./types";
import {
  BasicStep,
  ContentStep,
  GalleryStep,
  ReviewStep,
  SharingStep,
  SpecsStep,
  StepNavigation,
} from "./steps";

/**
 * WHY:   Project create and edit need one simplified, Safari-safe flow instead of long split-column forms.
 * WHAT:  Renders a six-step one-column wizard for project data, media, sharing, and final review.
 * HOW:   Keeps all form state local, delegates wizard side effects to a local hook, and splits step rendering into focused local modules.
 */
export default function AgPropertyForm({
  propertyId,
  initialData,
  brokers = [],
  title,
  description,
  submitLabel,
  onSave,
  onCancel,
  onDelete,
  onRevokeViewer,
}: AgPropertyFormProps) {
  const { locale } = useWebLocale();
  const form = useAgPropertyForm({ propertyId, initialData, brokers, onSave });
  const resolvedTitle =
    title ??
    (locale === "fr"
      ? "Gerer le projet"
      : locale === "en"
        ? "Manage project"
        : "إدارة المشروع");
  const resolvedDescription =
    description ??
    (locale === "fr"
      ? "Creez une page projet claire et facile a mettre a jour avec images, description et acces prive."
      : locale === "en"
        ? "Create a clear, easy-to-update project page with images, description, and private sharing details."
        : "أنشئ صفحة مشروع واضحة وسهلة التحديث مع صور، وصف، ومعلومات المشاركة الخاصة.");
  const resolvedSubmitLabel =
    submitLabel ??
    (locale === "fr"
      ? "Enregistrer le projet"
      : locale === "en"
        ? "Save project"
        : "حفظ المشروع");
  const eyebrow =
    form.isEditMode
      ? locale === "fr"
        ? "Modifier le projet"
        : locale === "en"
          ? "Edit project"
          : "تعديل المشروع"
      : locale === "fr"
        ? "Nouveau projet"
        : locale === "en"
          ? "Create project"
          : "إنشاء مشروع جديد";

  const renderCurrentStep = () => {
    if (form.activeStep.key === "basic") {
      return <BasicStep formState={form.formState} setFormState={form.setFormState} />;
    }
    if (form.activeStep.key === "content") {
      return <ContentStep formState={form.formState} setFormState={form.setFormState} />;
    }
    if (form.activeStep.key === "gallery") {
      return (
        <GalleryStep
          formState={form.formState}
          handleImageSelection={form.handleImageSelection}
          inputRef={form.inputRef}
          isUploading={form.isUploading}
          moveImage={form.moveImage}
          previewAspectClass={form.previewAspectClass}
          previewObjectClass={form.previewObjectClass}
          removeImage={form.removeImage}
          setCoverImageKey={form.setCoverImageKey}
          setFormState={form.setFormState}
          uploadError={form.uploadError}
        />
      );
    }
    if (form.activeStep.key === "specs") {
      return (
        <SpecsStep
          adLicenseLabel={form.adLicenseLabel}
          adLicenseTone={form.adLicenseTone}
          formState={form.formState}
          handleLicenseFiles={form.handleLicenseFiles}
          handleLicenseSubmit={form.handleLicenseSubmit}
          isLicenseUploading={form.isLicenseUploading}
          licenseDocs={form.licenseDocs}
          licenseError={form.licenseError}
          licenseInputRef={form.licenseInputRef}
          licenseSubmitted={form.licenseSubmitted}
          licenseSubmitting={form.licenseSubmitting}
          propertyId={propertyId}
          setFormState={form.setFormState}
          setLicenseDocs={form.setLicenseDocs}
        />
      );
    }
    if (form.activeStep.key === "sharing") {
      return (
        <SharingStep
          brokerSearch={form.brokerSearch}
          filteredBrokers={form.filteredBrokers}
          formState={form.formState}
          handlePermitFiles={form.handlePermitFiles}
          onRevokeViewer={onRevokeViewer}
          permitInputRef={form.permitInputRef}
          selectedBroker={form.selectedBroker}
          setBrokerSearch={form.setBrokerSearch}
          setFormState={form.setFormState}
          setSelectedBrokerId={form.setSelectedBrokerId}
        />
      );
    }
    return (
        <ReviewStep
          formState={form.formState}
          savePending={form.savePending}
          selectedBroker={form.selectedBroker}
          setShowSafetyConfirm={form.setShowSafetyConfirm}
          submitLabel={resolvedSubmitLabel}
        />
      );
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col pb-12">
      {form.showSafetyConfirm ? (
        <AgPropertyFormSafetyOverlay
          savePending={form.savePending}
          onConfirm={form.handleConfirm}
          onClose={() => form.setShowSafetyConfirm(false)}
        />
      ) : null}

      <ZonePageIntro
        eyebrow={eyebrow}
        title={resolvedTitle}
        description={resolvedDescription}
        actions={form.isEditMode ? <AgPropertyFormHeaderActions onCancel={onCancel} onDelete={onDelete} /> : undefined}
      />

      <div className="space-y-6 px-1 py-4 lg:py-6">
        <StepNavigation
          activeStepSummary={form.activeStep.summary}
          currentStepIndex={form.currentStepIndex}
          isLastStep={form.isLastStep}
          setCurrentStepIndex={form.setCurrentStepIndex}
        />

        {renderCurrentStep()}
      </div>
    </div>
  );
}
