"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";

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

type ComposerProjectOption = {
  id: string;
  title: string;
  location: string;
  imageUrl?: string | null;
  price?: number;
};

type ComposerDealOption = {
  id: string;
  title: string;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  value?: number;
  contactName?: string | null;
};

type ComposerAction = "file" | "project" | "deal" | "offer";

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
  const [offerForm, setOfferForm] = useState<{
    propertyId: string;
    title: string;
    description: string;
    price: string;
  }>({
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
      if (activeAction === "file") {
        if (!selectedFile) {
          setLocalError("اختر ملفًا قبل الإرسال.");
          return;
        }

        await onShareFile(selectedFile, shareFileNote);
        resetActionState();
        return;
      }

      if (activeAction === "project") {
        if (!selectedProjectId) {
          setLocalError("اختر مشروعًا للمشاركة.");
          return;
        }

        await onShareProject(selectedProjectId, projectNote);
        resetActionState();
        return;
      }

      if (activeAction === "deal") {
        if (!selectedDealId) {
          setLocalError("اختر صفقة للمشاركة.");
          return;
        }

        await onShareDeal(selectedDealId, dealNote);
        resetActionState();
        return;
      }

      if (activeAction === "offer") {
        if (!offerForm.propertyId || !offerForm.price.trim()) {
          setLocalError("اختر مشروعًا وحدد السعر قبل إنشاء العرض.");
          return;
        }

        await onCreatePrivateOffer({
          propertyId: offerForm.propertyId,
          price: Number(offerForm.price.replace(/[^\d.]/g, "")) || 0,
          message: offerForm.title.trim() || undefined,
          description: offerForm.description.trim() || undefined,
          attachments: [],
        });
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

        {canUseBusinessActions ? (
          <div className="mb-3 border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "file" as const, label: "مشاركة ملف" },
                { id: "project" as const, label: "مشاركة مشروع" },
                { id: "deal" as const, label: "مشاركة صفقة" },
                { id: "offer" as const, label: "عرض خاص" },
              ].map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setActiveAction((current) => current === action.id ? null : action.id)}
                  className={`border px-3 py-2 text-xs font-bold transition ${
                    activeAction === action.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {activeAction ? (
              <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3">
                {activeAction === "file" ? (
                  <>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleUploadFile} />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        {isUploading ? "جارٍ رفع الملف..." : "اختر ملفًا"}
                      </button>
                      {selectedFile ? (
                        <span className="text-xs font-medium text-slate-600">{selectedFile.name}</span>
                      ) : null}
                    </div>
                    <input
                      type="text"
                      value={shareFileNote}
                      onChange={(event) => setShareFileNote(event.target.value)}
                      placeholder="ملاحظة قصيرة مع الملف"
                      className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    />
                  </>
                ) : null}

                {activeAction === "project" ? (
                  <>
                    <select
                      value={selectedProjectId}
                      onChange={(event) => setSelectedProjectId(event.target.value)}
                      className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    >
                      {projectOptions.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title} - {project.location}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={projectNote}
                      onChange={(event) => setProjectNote(event.target.value)}
                      placeholder="ماذا تريد أن توضّح حول هذا المشروع؟"
                      className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    />
                  </>
                ) : null}

                {activeAction === "deal" ? (
                  <>
                    <select
                      value={selectedDealId}
                      onChange={(event) => setSelectedDealId(event.target.value)}
                      className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    >
                      {dealOptions.map((deal) => (
                        <option key={deal.id} value={deal.id}>
                          {deal.title} - {deal.contactName ?? deal.stage}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={dealNote}
                      onChange={(event) => setDealNote(event.target.value)}
                      placeholder="ملاحظة قصيرة مع الصفقة"
                      className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    />
                  </>
                ) : null}

                {activeAction === "offer" ? (
                  <>
                    <select
                      value={offerForm.propertyId}
                      onChange={(event) => {
                        const nextProperty = projectOptions.find((project) => project.id === event.target.value);
                        setOfferForm((current) => ({
                          ...current,
                          propertyId: event.target.value,
                          price: nextProperty?.price ? String(nextProperty.price) : current.price,
                        }));
                      }}
                      className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    >
                      {projectOptions.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title} - {project.location}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={offerForm.title}
                      onChange={(event) => setOfferForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder="عنوان العرض"
                      className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    />
                    <textarea
                      rows={3}
                      value={offerForm.description}
                      onChange={(event) => setOfferForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="وصف مختصر لهذا العرض الخاص"
                      className="w-full resize-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    />
                    <input
                      type="text"
                      value={offerForm.price}
                      onChange={(event) => setOfferForm((current) => ({ ...current, price: event.target.value }))}
                      placeholder="السعر"
                      className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
                    />
                  </>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
                  >
                    إغلاق
                  </button>
                  <button
                    type="button"
                    disabled={isSending || isUploading}
                    onClick={() => void handleShareAction()}
                    className="border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:border-blue-600 hover:bg-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {activeAction === "offer" ? "إنشاء العرض" : "إرسال البطاقة"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

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
