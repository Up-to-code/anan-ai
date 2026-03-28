"use client";

import { useMemo, useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { RequirementItem, RequirementSourceLink } from "./requirements";
import { filterRequirements } from "./requirements";
import { DocumentsCard, postVerificationRequest, RequirementsChecklist, StepActions } from "./VerificationDocsStep.parts";

type VerificationDocsStepProps = {
  organizationType: "broker" | "red";
  requirements: RequirementItem[];
  sources: RequirementSourceLink[];
  countryLabel?: string | null;
  onBack: () => void;
  onSkip: () => void;
};

type VerificationDocsModel = {
  countryLabel?: string | null;
  error: string | null;
  filteredRequirements: RequirementItem[];
  handleProofFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRequiredFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isUploading: boolean;
  onBack: () => void;
  onSkip: () => void;
  proofDocs: UploadedFileReference[];
  proofInputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  requiredDocs: UploadedFileReference[];
  requiredInputRef: React.RefObject<HTMLInputElement | null>;
  selected: Record<string, boolean>;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelected: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setProofDocs: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>;
  setRequiredDocs: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>;
  sources: RequirementSourceLink[];
  typeLabel: string;
};

async function uploadDocuments(args: {
  files: File[];
  startUpload: ReturnType<typeof useUploadThing>["startUpload"];
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setDocs: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>;
}) {
  if (args.files.length === 0) return;
  args.setError(null);
  try {
    const uploaded = await args.startUpload(args.files);
    const nextDocs = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
    args.setDocs((current) => [...current, ...nextDocs]);
  } catch (uploadError) {
    args.setError(uploadError instanceof Error ? uploadError.message : "تعذر رفع الملفات.");
  }
}

function useVerificationDocsModel(props: VerificationDocsStepProps): VerificationDocsModel {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [requiredDocs, setRequiredDocs] = useState<UploadedFileReference[]>([]);
  const [proofDocs, setProofDocs] = useState<UploadedFileReference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requiredInputRef = useRef<HTMLInputElement | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload, isUploading } = useUploadThing("verificationDocuments");
  const filteredRequirements = useMemo(() => filterRequirements(props.requirements, query), [props.requirements, query]);
  const typeLabel = props.organizationType === "red" ? "مطور عقاري" : "وسيط عقاري";

  const handleRequiredFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await uploadDocuments({ files: Array.from(event.target.files ?? []), startUpload, setError, setDocs: setRequiredDocs });
    event.target.value = "";
  };
  const handleProofFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await uploadDocuments({ files: Array.from(event.target.files ?? []), startUpload, setError, setDocs: setProofDocs });
    event.target.value = "";
  };
  const handleSubmit = async () => {
    setError(null);
    if (requiredDocs.length === 0) return setError("الرجاء رفع مستند واحد على الأقل من المستندات الأساسية.");
    setIsSubmitting(true);
    try {
      await postVerificationRequest({ requiredDocs, proofDocs, selected, sources: props.sources, organizationType: props.organizationType });
      props.onSkip();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { ...props, countryLabel: props.countryLabel, error, filteredRequirements, handleProofFiles, handleRequiredFiles, handleSubmit, isSubmitting, isUploading, proofDocs, proofInputRef, query, requiredDocs, requiredInputRef, selected, setProofDocs, setQuery, setRequiredDocs, setSelected, typeLabel };
}

function VerificationDocsView(model: VerificationDocsModel) {
  return (
    <div className="space-y-10">
      <div className="space-y-2 text-right">
        <div className="text-xl font-black tracking-tight text-foreground">التوثيق والمستندات</div>
        <p className="text-sm font-medium text-muted-foreground">ارفع مستنداتك لإثبات الهوية والنشاط. القائمة أدناه مرجع إرشادي ويمكن تحديثها لاحقاً.</p>
      </div>
      
      <RequirementsChecklist 
        countryLabel={model.countryLabel} 
        typeLabel={model.typeLabel} 
        query={model.query} 
        onQueryChange={model.setQuery} 
        selected={model.selected} 
        filteredRequirements={model.filteredRequirements} 
        onToggleRequirement={(id) => model.setSelected((current) => ({ ...current, [id]: !current[id] }))} 
        sources={model.sources} 
      />

      <div className="grid gap-8 md:grid-cols-2">
        <DocumentsCard title="المستندات الأساسية" subtitle="ملفات الهوية والسجلات النظامية الأساسية." uploadingLabel="جارٍ رفع الملفات..." idleLabel="رفع ملفات PDF أو صور" docs={model.requiredDocs} isUploading={model.isUploading} onRemoveDoc={(docKey) => model.setRequiredDocs((current) => current.filter((item) => item.key !== docKey))} inputRef={model.requiredInputRef} onFilesChange={model.handleRequiredFiles} />
        <DocumentsCard title="إثبات العمل (اختياري)" subtitle="نماذج أعمال أو مستندات داعمة لنشاطك." uploadingLabel="جارٍ رفع الملفات..." idleLabel="أضف نماذج أعمال أو موافقات مشاريع" docs={model.proofDocs} isUploading={model.isUploading} onRemoveDoc={(docKey) => model.setProofDocs((current) => current.filter((item) => item.key !== docKey))} inputRef={model.proofInputRef} onFilesChange={model.handleProofFiles} />
      </div>

      {model.error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-[13px] font-bold text-red-700 dark:text-red-300">
          {model.error}
        </div>
      ) : null}

      <StepActions isSubmitting={model.isSubmitting} onBack={model.onBack} onSkip={model.onSkip} onSubmit={() => void model.handleSubmit()} />
    </div>
  );
}

/**
 * WHY:   Verification needs a clean, guided flow with premium geometry.
 * WHAT:  Modernizes the verification step with rounded-3xl cards and high-contrast actions.
 * HOW:   Adopts rounded-3xl for cards and rounded-full for action buttons.
 */
export default function VerificationDocsStep(props: VerificationDocsStepProps) {
  const model = useVerificationDocsModel(props);
  return <VerificationDocsView {...model} />;
}
