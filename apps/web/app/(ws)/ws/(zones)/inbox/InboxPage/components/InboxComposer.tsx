"use client";
import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import {
  InboxComposerActions,
  type ComposerAction,
  type ComposerDealOption,
  type ComposerOfferFormState,
  type ComposerProjectOption,
} from "./InboxComposerActions";
type ShareActionParams = {
  activeAction: ComposerAction | null;
  selectedFile: UploadedFileReference | null;
  shareFileNote: string;
  selectedProjectId: string;
  projectNote: string;
  selectedDealId: string;
  dealNote: string;
  offerForm: ComposerOfferFormState;
  onShareFile: (file: UploadedFileReference, note?: string) => Promise<void>;
  onShareProject: (propertyId: string, note?: string) => Promise<void>;
  onShareDeal: (dealId: string, note?: string) => Promise<void>;
  onCreatePrivateOffer: (input: {
    propertyId: string;
    price: number;
    message?: string;
    description?: string;
    attachments?: UploadedFileReference[];
  }) => Promise<void | null>;
};
type ShareActionResult = { error: string | null; didMutate: boolean };
function buildOfferPayload(offerForm: ComposerOfferFormState) {
  return {
    propertyId: offerForm.propertyId,
    price: Number(offerForm.price.replace(/[^\d.]/g, "")) || 0,
    message: offerForm.title.trim() || undefined,
    description: offerForm.description.trim() || undefined,
    attachments: [],
  };
}
async function executeShareAction(params: ShareActionParams): Promise<ShareActionResult> {
  if (params.activeAction === "file") {
    if (!params.selectedFile) return { error: "اختر ملفًا قبل الإرسال.", didMutate: false };
    await params.onShareFile(params.selectedFile, params.shareFileNote);
    return { error: null, didMutate: true };
  }
  if (params.activeAction === "project") {
    if (!params.selectedProjectId) return { error: "اختر مشروعًا للمشاركة.", didMutate: false };
    await params.onShareProject(params.selectedProjectId, params.projectNote);
    return { error: null, didMutate: true };
  }
  if (params.activeAction === "deal") {
    if (!params.selectedDealId) return { error: "اختر صفقة للمشاركة.", didMutate: false };
    await params.onShareDeal(params.selectedDealId, params.dealNote);
    return { error: null, didMutate: true };
  }
  if (params.activeAction === "offer") {
    if (!params.offerForm.propertyId || !params.offerForm.price.trim()) {
      return { error: "اختر مشروعًا وحدد السعر قبل إنشاء العرض.", didMutate: false };
    }
    await params.onCreatePrivateOffer(buildOfferPayload(params.offerForm));
    return { error: null, didMutate: true };
  }
  return { error: null, didMutate: false };
}
/**
 * WHY:   Composer keyboard behavior should stay testable without a browser-specific test harness.
 * WHAT:  Resolves whether a given key press should trigger an inbox send action.
 * HOW:   Treats Enter as submit only when Shift is not pressed, leaving all other combinations as normal typing.
 */
export function getInboxComposerKeyAction(key: string, shiftKey: boolean) {
  if (key === "Enter" && !shiftKey) {
    return "send";
  }
  return "none";
}
/**
 * WHY:   The thread composer should expose a single rule for when sending is allowed.
 * WHAT:  Returns whether the current draft should disable the send action.
 * HOW:   Disables send when the mutation is in flight or the trimmed draft is empty.
 */
export function isInboxComposerSendDisabled(draft: string, isSending = false) {
  return isSending || draft.trim().length === 0;
}
/**
 * WHY:   Broker↔developer inbox threads need a minimal launcher for sharing business objects without leaving chat.
 * WHAT:  Renders the reply textarea, business-action launcher, and send/share controls for the active thread.
 * HOW:   Keeps text replies lightweight, uses UploadThing for file sharing, and submits business actions through focused callbacks.
 */
export default function InboxComposer({
  canUseBusinessActions = false,
  dealOptions,
  initialValue = "",
  isSending = false,
  onCreatePrivateOffer,
  onSend,
  onShareDeal,
  onShareFile,
  onShareProject,
  projectOptions,
  sendError,
}: {
  canUseBusinessActions?: boolean;
  dealOptions: ComposerDealOption[];
  initialValue?: string;
  isSending?: boolean;
  onCreatePrivateOffer: (input: {
    propertyId: string;
    price: number;
    message?: string;
    description?: string;
    attachments?: UploadedFileReference[];
  }) => Promise<void | null>;
  onSend: (message: string) => Promise<void>;
  onShareDeal: (dealId: string, note?: string) => Promise<void>;
  onShareFile: (file: UploadedFileReference, note?: string) => Promise<void>;
  onShareProject: (propertyId: string, note?: string) => Promise<void>;
  projectOptions: ComposerProjectOption[];
  sendError?: string | null;
}) {
  const [activeAction, setActiveAction] = useState<ComposerAction | null>(null);
  const [dealNote, setDealNote] = useState("");
  const [draft, setDraft] = useState(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<ComposerOfferFormState>({
    propertyId: projectOptions[0]?.id ?? "",
    title: "",
    description: "",
    price: projectOptions[0]?.price ? String(projectOptions[0].price) : "",
  });
  const [projectNote, setProjectNote] = useState("");
  const [selectedDealId, setSelectedDealId] = useState(dealOptions[0]?.id ?? "");
  const [selectedFile, setSelectedFile] = useState<UploadedFileReference | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(projectOptions[0]?.id ?? "");
  const [shareFileNote, setShareFileNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startUpload, isUploading } = useUploadThing("offerAttachments");
  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
  }, [draft]);
  useEffect(() => {
    if (!selectedProjectId && projectOptions[0]?.id) {
      setSelectedProjectId(projectOptions[0].id);
    }
    if (!offerForm.propertyId && projectOptions[0]?.id) {
      setOfferForm((current) => ({
        ...current,
        propertyId: projectOptions[0].id,
        price: projectOptions[0].price ? String(projectOptions[0].price) : current.price,
      }));
    }
  }, [offerForm.propertyId, projectOptions, selectedProjectId]);
  useEffect(() => {
    if (!selectedDealId && dealOptions[0]?.id) {
      setSelectedDealId(dealOptions[0].id);
    }
  }, [dealOptions, selectedDealId]);
  const handleSubmit = async () => {
    if (isInboxComposerSendDisabled(draft, isSending)) {
      return;
    }
    const message = draft.trim();
    setLocalError(null);
    try {
      await onSend(message);
      setDraft("");
    } catch {
      setLocalError("تعذر إرسال الرسالة. يمكنك المحاولة مرة أخرى.");
    }
  };
  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    setLocalError(null);
    try {
      const uploaded = await startUpload([files[0]]);
      setSelectedFile((uploaded?.[0]?.serverData as UploadedFileReference | undefined) ?? null);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "تعذر رفع الملف.");
    } finally {
      event.target.value = "";
    }
  };
  const resetActionState = () => {
    setActiveAction(null);
    setSelectedFile(null);
    setShareFileNote("");
    setProjectNote("");
    setDealNote("");
    setOfferForm({
      propertyId: projectOptions[0]?.id ?? "",
      title: "",
      description: "",
      price: projectOptions[0]?.price ? String(projectOptions[0].price) : "",
    });
  };
  const handleShareAction = async () => {
    setLocalError(null);
    try {
      const result = await executeShareAction({
        activeAction,
        selectedFile,
        shareFileNote,
        selectedProjectId,
        projectNote,
        selectedDealId,
        dealNote,
        offerForm,
        onShareFile,
        onShareProject,
        onShareDeal,
        onCreatePrivateOffer,
      });
      if (result.error) {
        setLocalError(result.error);
        return;
      }
      if (result.didMutate) {
        resetActionState();
      }
    } catch {
      // Parent surfaces the stable domain/server message through `sendError`.
    }
  };
  return (
    <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {sendError || localError ? (
          <div className="mb-3 border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {sendError || localError}
          </div>
        ) : null}
        <InboxComposerActions
          activeAction={activeAction}
          canUseBusinessActions={canUseBusinessActions}
          dealNote={dealNote}
          dealOptions={dealOptions}
          fileInputRef={fileInputRef}
          handleUploadFile={handleUploadFile}
          isSending={isSending}
          isUploading={isUploading}
          offerForm={offerForm}
          onShareAction={handleShareAction}
          projectNote={projectNote}
          projectOptions={projectOptions}
          selectedDealId={selectedDealId}
          selectedFile={selectedFile}
          selectedProjectId={selectedProjectId}
          setActiveAction={setActiveAction}
          setDealNote={setDealNote}
          setOfferForm={setOfferForm}
          setProjectNote={setProjectNote}
          setSelectedDealId={setSelectedDealId}
          setSelectedProjectId={setSelectedProjectId}
          setShareFileNote={setShareFileNote}
          shareFileNote={shareFileNote}
        />
        <div className="border border-slate-200 bg-white p-3">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="اكتب رسالة واضحة ومباشرة..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (getInboxComposerKeyAction(event.key, event.shiftKey) === "send") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            className="max-h-[220px] min-h-[52px] w-full resize-none bg-transparent px-1 py-1 text-sm font-medium leading-7 text-slate-900 outline-none placeholder:text-slate-400"
          />
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <div className="text-xs font-medium text-slate-500">اضغط Enter للإرسال و Shift + Enter لسطر جديد.</div>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isInboxComposerSendDisabled(draft, isSending)}
              className="inline-flex items-center gap-2 border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:border-blue-600 hover:bg-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <SendHorizontal className="h-4 w-4" />
              {isSending ? "جاري الإرسال" : "إرسال"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
