"use client";

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
  title = "إدارة المشروع",
  description = "أنشئ صفحة مشروع واضحة وسهلة التحديث مع صور، وصف، ومعلومات المشاركة الخاصة.",
  submitLabel = "حفظ المشروع",
  onSave,
  onCancel,
  onDelete,
  onRevokeViewer,
}: AgPropertyFormProps) {
  const form = useAgPropertyForm({ propertyId, initialData, brokers, onSave });

  const renderCurrentStep = () => {
    if (form.activeStep.key === "basic") {
      return <BasicStep formState={form.formState} fieldErrors={form.submissionFeedback?.fieldErrors ?? {}} setFormState={form.setFormState} />;
    }
    if (form.activeStep.key === "content") {
      return <ContentStep formState={form.formState} fieldErrors={form.submissionFeedback?.fieldErrors ?? {}} setFormState={form.setFormState} />;
    }
    if (form.activeStep.key === "gallery") {
      return (
        <GalleryStep
          fieldErrors={form.submissionFeedback?.fieldErrors ?? {}}
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
          fieldErrors={form.submissionFeedback?.fieldErrors ?? {}}
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
          fieldErrors={form.submissionFeedback?.fieldErrors ?? {}}
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
        submitLabel={submitLabel}
      />
    );
  };

  return (
    <div className="flex min-h-full w-full flex-col pb-12">
      {form.showSafetyConfirm ? (
        <AgPropertyFormSafetyOverlay
          savePending={form.savePending}
          onConfirm={form.handleConfirm}
          onClose={() => form.setShowSafetyConfirm(false)}
        />
      ) : null}

      <ZonePageIntro
        eyebrow={form.isEditMode ? "تعديل المشروع" : "إنشاء مشروع جديد"}
        title={title}
        description={description}
        actions={form.isEditMode ? <AgPropertyFormHeaderActions onCancel={onCancel} onDelete={onDelete} /> : undefined}
      />

      <div className="space-y-6 py-4 lg:py-6">
        {form.submissionFeedback ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-right text-sm font-semibold text-rose-700">
            {form.submissionFeedback.message}
          </div>
        ) : null}

        <StepNavigation
          activeStepTitle={form.activeStep.title}
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
