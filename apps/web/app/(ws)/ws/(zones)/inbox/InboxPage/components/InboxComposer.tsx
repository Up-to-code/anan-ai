"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { SendHorizontal, Sparkles } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { ConversationDetail } from "@/server/contracts/inbox";
import type { OfferActionResult } from "@/server/contracts/offers";
import {
  buildDefaultOfferForm,
  InboxInlineSharePanel,
  InboxOfferModal,
  InboxQuickShareMenu,
  type ComposerOfferFormState,
  type ComposerProjectOption,
  type InboxShareAction,
} from "./InboxComposerActions";

type ShareActionResult = { error: string | null; didMutate: boolean };

function buildOfferPayload(offerForm: ComposerOfferFormState) {
  return {
    propertyId: offerForm.propertyId,
    price: Number(offerForm.price.replace(/[^\d.]/g, "")) || 0,
    message: offerForm.title.trim() || undefined,
    description: offerForm.description.trim() || undefined,
    attachments: offerForm.attachments ?? [],
  };
}

async function executeShareAction(params: {
  activeAction: Exclude<InboxShareAction, "offer"> | null;
  selectedFile: UploadedFileReference | null;
  shareFileNote: string;
  selectedProjectId: string;
  projectNote: string;
  onShareFile: (file: UploadedFileReference, note?: string) => Promise<void>;
  onShareProject: (propertyId: string, note?: string) => Promise<void>;
}): Promise<ShareActionResult> {
  if (params.activeAction === "file") {
    if (!params.selectedFile) return { error: "اختر ملفًا قبل الإرسال.", didMutate: false };
    await params.onShareFile(params.selectedFile, params.shareFileNote.trim() || undefined);
    return { error: null, didMutate: true };
  }

  if (params.activeAction === "project") {
    if (!params.selectedProjectId) return { error: "اختر عقارًا أو مشروعًا للمشاركة.", didMutate: false };
    await params.onShareProject(params.selectedProjectId, params.projectNote.trim() || undefined);
    return { error: null, didMutate: true };
  }

  return { error: null, didMutate: false };
}

/**
 * WHY:   Composer keyboard behavior should stay testable without a browser-specific harness.
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
 * WHY:   The thread composer should expose one stable rule for when sending is allowed.
 * WHAT:  Returns whether the current draft should disable the send action.
 * HOW:   Disables send when a mutation is in flight or the trimmed draft is empty.
 */
export function isInboxComposerSendDisabled(draft: string, isSending = false) {
  return isSending || draft.trim().length === 0;
}

/**
 * WHY:   Broker↔developer inbox threads need one practical composer that keeps messaging and sharing lightweight.
 * WHAT:  Renders the simplified textarea, compact share menu, and quick offer modal for a selected conversation.
 * HOW:   Keeps text replies primary, opens one share flow at a time, and routes all business actions through focused callbacks.
 */
export default function InboxComposer({
  activeShareAction,
  canUseBusinessActions = false,
  conversation,
  initialValue = "",
  isSending = false,
  onCreatePrivateOfferDraft,
  onPublishConversationOffer,
  onSend,
  onShareActionChange,
  onShareFile,
  onShareProject,
  projectOptions,
  sendError,
}: {
  activeShareAction: InboxShareAction | null;
  canUseBusinessActions?: boolean;
  conversation: ConversationDetail;
  initialValue?: string;
  isSending?: boolean;
  onCreatePrivateOfferDraft: (input: {
    propertyId: string;
    price: number;
    message?: string;
    description?: string;
    attachments?: UploadedFileReference[];
  }) => Promise<OfferActionResult | void | null>;
  onPublishConversationOffer: (offerId: string) => Promise<OfferActionResult | void | null>;
  onSend: (message: string) => Promise<void>;
  onShareActionChange: (action: InboxShareAction | null) => void;
  onShareFile: (file: UploadedFileReference, note?: string) => Promise<void>;
  onShareProject: (propertyId: string, note?: string) => Promise<void>;
  projectOptions: ComposerProjectOption[];
  sendError?: string | null;
}) {
  const [draft, setDraft] = useState(initialValue);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<ComposerOfferFormState>(() => buildDefaultOfferForm(projectOptions));
  const [projectNote, setProjectNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<UploadedFileReference | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(projectOptions[0]?.id ?? "");
  const [shareFileNote, setShareFileNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const offerFileInputRef = useRef<HTMLInputElement>(null);
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
    setDraft(initialValue);
    setLocalError(null);
    setIsShareMenuOpen(false);
    setSelectedFile(null);
    setShareFileNote("");
    setProjectNote("");
    setSelectedProjectId(projectOptions[0]?.id ?? "");
    setOfferForm(buildDefaultOfferForm(projectOptions));
  }, [conversation.id, initialValue, projectOptions]);

  useEffect(() => {
    if (!selectedProjectId && projectOptions[0]?.id) {
      setSelectedProjectId(projectOptions[0].id);
    }
  }, [projectOptions, selectedProjectId]);

  useEffect(() => {
    if (!offerForm.propertyId && projectOptions[0]?.id) {
      setOfferForm(buildDefaultOfferForm(projectOptions));
    }
  }, [offerForm.propertyId, projectOptions]);

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

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleUploadOfferAttachments = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setLocalError(null);
    try {
      const uploaded = await startUpload(files);
      const nextAttachments = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setOfferForm((current) => ({
        ...current,
        attachments: [...current.attachments, ...nextAttachments],
      }));
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "تعذر رفع مرفقات العرض.");
    } finally {
      event.target.value = "";
    }
  };

  const resetShareState = () => {
    setSelectedFile(null);
    setShareFileNote("");
    setProjectNote("");
    onShareActionChange(null);
    setIsShareMenuOpen(false);
  };

  const handleShareAction = async () => {
    setLocalError(null);
    try {
      const result = await executeShareAction({
        activeAction:
          activeShareAction === "file" || activeShareAction === "project"
            ? activeShareAction
            : null,
        selectedFile,
        shareFileNote,
        selectedProjectId,
        projectNote,
        onShareFile,
        onShareProject,
      });

      if (result.error) {
        setLocalError(result.error);
        return;
      }

      if (result.didMutate) {
        resetShareState();
      }
    } catch {
      // Parent surfaces stable server errors through `sendError`.
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerForm.propertyId || !offerForm.price.trim()) {
      setLocalError("اختر عقارًا وحدد السعر قبل إرسال العرض.");
      return;
    }

    setLocalError(null);
    try {
      const created = await onCreatePrivateOfferDraft(buildOfferPayload(offerForm));
      if (created && typeof created === "object" && "offerId" in created) {
        await onPublishConversationOffer(created.offerId);
      }
      setOfferForm(buildDefaultOfferForm(projectOptions));
      onShareActionChange(null);
      setIsShareMenuOpen(false);
    } catch {
      // Parent surfaces stable server errors through `sendError`.
    }
  };

  const inlineShareAction =
    activeShareAction === "file" || activeShareAction === "project" ? activeShareAction : null;

  return (
    <>
      <div className="border-t border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-4xl">
          {sendError || localError ? (
            <div className="mb-3 rounded-2xl border border-rose-500/22 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
              {sendError || localError}
            </div>
          ) : null}

          {canUseBusinessActions ? (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setIsShareMenuOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-3 py-2 text-xs font-bold text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-elevated)]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[var(--workspace-highlight)]" />
                مشاركة سريعة
              </button>

              {isShareMenuOpen || activeShareAction ? (
                <div className="mt-3">
                  <InboxQuickShareMenu
                    activeAction={activeShareAction}
                    canCreateOffer={projectOptions.length > 0}
                    canShareProjects={projectOptions.length > 0}
                    onSelectAction={(action) => {
                      onShareActionChange(action);
                      setIsShareMenuOpen(false);
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {inlineShareAction ? (
            <div className="mb-3">
              <InboxInlineSharePanel
                activeAction={inlineShareAction}
                fileInputRef={fileInputRef}
                handleUploadFile={handleUploadFile}
                isUploading={isUploading}
                onClose={resetShareState}
                onSubmit={handleShareAction}
                projectNote={projectNote}
                projectOptions={projectOptions}
                selectedFile={selectedFile}
                selectedProjectId={selectedProjectId}
                setProjectNote={setProjectNote}
                setSelectedProjectId={setSelectedProjectId}
                setShareFileNote={setShareFileNote}
                shareFileNote={shareFileNote}
              />
            </div>
          ) : null}

          <div className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] p-3 shadow-[0_18px_46px_rgba(0,0,0,0.12)]">
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] px-2 pb-3">
              <div className="text-right">
                <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
                  اكتب رسالتك
                </div>
                <div className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
                  رسالة واحدة واضحة، ثم استخدم المشاركة السريعة عند الحاجة.
                </div>
              </div>
              <div className="rounded-full bg-[var(--workspace-elevated)] px-3 py-1 text-[11px] font-bold text-[var(--workspace-muted)]">
                إلى {conversation.otherUser.name}
              </div>
            </div>

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
              className="max-h-[220px] min-h-[74px] w-full resize-none bg-transparent px-2 py-2 text-sm font-medium leading-7 text-[var(--workspace-bubble-other-foreground)] outline-none placeholder:text-[var(--workspace-muted)]"
            />

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] pt-3">
              <div className="text-xs font-medium text-[var(--workspace-muted)]">
                Enter للإرسال، و Shift + Enter لسطر جديد.
              </div>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isInboxComposerSendDisabled(draft, isSending)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_34%,transparent)] bg-[var(--workspace-highlight)] px-4 py-2.5 text-sm font-bold text-[var(--primary-foreground)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] disabled:bg-[var(--workspace-elevated)] disabled:text-[var(--workspace-muted)]"
              >
                <SendHorizontal className="h-4 w-4" />
                {isSending ? "جاري الإرسال" : "إرسال"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <InboxOfferModal
        conversationLabel={conversation.otherUser.name}
        fileInputRef={offerFileInputRef}
        handleUploadOfferAttachments={handleUploadOfferAttachments}
        isOpen={activeShareAction === "offer"}
        isSending={isSending}
        isUploading={isUploading}
        offerForm={offerForm}
        onClose={() => onShareActionChange(null)}
        onSubmit={handleSubmitOffer}
        projectOptions={projectOptions}
        setOfferForm={setOfferForm}
      />
    </>
  );
}
