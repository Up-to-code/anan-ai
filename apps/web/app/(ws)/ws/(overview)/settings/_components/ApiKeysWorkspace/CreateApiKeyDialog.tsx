"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Copy, KeyRound, Plus, X } from "lucide-react";
import type { FormEvent } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { cn } from "@/lib/utils";
import type { OrganizationApiKeyPermission } from "@/lib/auth/organizationPermissions";
import { getActionCatalog, getPermissionCatalog, permissionKey } from "./catalog";

/**
 * WHY:   API key creation combines permission design, submission, and one-time secret reveal in one contained flow.
 * WHAT:  Renders the create-key modal, including permission presets and the post-create secret reveal screen.
 * HOW:   Receives all mutable state and callbacks from the parent hook so the dialog stays presentational.
 */
export function CreateApiKeyDialog({
  canCreate,
  copied,
  isModalOpen,
  isSubmitting,
  name,
  onApplyPreset,
  onClose,
  onCopy,
  onCreateKey,
  onNameChange,
  onOpenChange,
  onTogglePermission,
  revealedResult,
  selectedPermissionKeys,
  status,
}: {
  canCreate: boolean;
  copied: boolean;
  isModalOpen: boolean;
  isSubmitting: boolean;
  name: string;
  onApplyPreset: (preset: "read" | "write" | "full") => void;
  onClose: () => void;
  onCopy: () => void;
  onCreateKey: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onNameChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onTogglePermission: (permission: OrganizationApiKeyPermission) => void;
  revealedResult: { apiKey: string } | null;
  selectedPermissionKeys: string[];
  status: string | null;
}) {
  const { dictionary, locale } = useWebLocale();
  const actionCatalog = getActionCatalog(locale);
  const permissionCatalog = getPermissionCatalog(locale);

  if (!canCreate) {
    return (
      <div className="max-w-xs rounded-2xl border border-border bg-muted/20 px-4 py-3 text-[12px] text-muted-foreground">
        {dictionary.settings.apiKeysCreateOwnerOnly}
      </div>
    );
  }

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={onOpenChange}>
      <Dialog.Trigger className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95">
        <Plus className="h-4 w-4" />
        {dictionary.settings.apiKeysCreateButton}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 outline-none transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="pointer-events-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl overscroll-contain">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
              <Dialog.Title className="text-lg font-bold">
                {revealedResult ? dictionary.settings.apiKeysCreatedTitle : dictionary.settings.apiKeysCreateDialogTitle}
              </Dialog.Title>
              <Dialog.Close
                aria-label={dictionary.settings.apiKeysClose}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {revealedResult ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <KeyRound className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-foreground">{dictionary.settings.apiKeysSecretTitle}</h3>
                  <p className="mb-8 max-w-sm text-[13px] text-muted-foreground">
                    {dictionary.settings.apiKeysSecretDescription}
                  </p>

                  <div className="w-full max-w-md rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-3">
                      <code className="block flex-1 overflow-x-auto text-left text-[14px] font-semibold text-foreground" dir="ltr">
                        {revealedResult.apiKey}
                      </code>
                      <button
                        type="button"
                        onClick={onCopy}
                        className="flex shrink-0 items-center gap-2 rounded-xl bg-background px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm transition-all hover:bg-muted active:scale-95"
                      >
                        <Copy className="h-4 w-4" />
                        {copied ? dictionary.settings.apiKeysCopied : dictionary.settings.apiKeysCopy}
                      </button>
                    </div>
                  </div>

                  <div className="mt-10">
                    <Dialog.Close
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-[14px] font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-95"
                    >
                      {dictionary.settings.apiKeysCopiedConfirm}
                    </Dialog.Close>
                  </div>
                </div>
              ) : (
                <form onSubmit={(event) => void onCreateKey(event)} className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-foreground">{dictionary.settings.apiKeysNameLabel}</label>
                    <input
                      type="text"
                      name="apiKeyName"
                      autoComplete="off"
                      value={name}
                      onChange={(event) => onNameChange(event.target.value)}
                      disabled={isSubmitting}
                      placeholder={dictionary.settings.apiKeysNamePlaceholder}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <label className="text-[13px] font-semibold text-foreground">{dictionary.settings.apiKeysPermissionsLabel}</label>
                        <p className="mt-1 text-[12px] text-muted-foreground">{dictionary.settings.apiKeysPermissionsHint}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/30 p-1">
                        <button type="button" onClick={() => onApplyPreset("read")} className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition hover:bg-background hover:text-foreground hover:shadow-sm">{dictionary.settings.apiKeysReadOnly}</button>
                        <button type="button" onClick={() => onApplyPreset("write")} className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition hover:bg-background hover:text-foreground hover:shadow-sm">{dictionary.settings.apiKeysReadWrite}</button>
                        <button type="button" onClick={() => onApplyPreset("full")} className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition hover:bg-background hover:text-foreground hover:shadow-sm">{dictionary.settings.apiKeysFullAccess}</button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                      <div className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] items-center border-b border-border bg-muted/40 text-center text-[12px] font-semibold text-muted-foreground sm:grid-cols-[140px_1fr_1fr_1fr_1fr]">
                        <div className="px-4 py-3 text-right">{dictionary.settings.apiKeysResourceColumn}</div>
                        {actionCatalog.map((action) => (
                          <div key={action.action} className="px-2 py-3">{action.label}</div>
                        ))}
                      </div>
                      <div className="divide-y divide-border">
                        {permissionCatalog.map((resource) => {
                          const ResourceIcon = resource.icon;
                          return (
                            <div key={resource.resource} className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] items-center transition-colors hover:bg-muted/10 sm:grid-cols-[140px_1fr_1fr_1fr_1fr]">
                              <div className="flex items-center gap-2 px-4 py-4 text-[13px] font-semibold text-foreground">
                                <ResourceIcon className="h-4 w-4 text-primary" />
                                <span>{resource.label}</span>
                              </div>
                              {actionCatalog.map((action) => {
                                const supported = resource.allowedActions.includes(action.action);
                                const permission = { resource: resource.resource, action: action.action } as OrganizationApiKeyPermission;
                                const checked = selectedPermissionKeys.includes(permissionKey(permission));
                                return (
                                  <label
                                    key={action.action}
                                    className={cn(
                                      "flex items-center justify-center p-3",
                                      supported ? "cursor-pointer" : "cursor-not-allowed opacity-35",
                                    )}
                                  >
                                    <span className="sr-only">{action.label} {resource.label}</span>
                                    <div
                                      className={cn(
                                        "flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 sm:h-8 sm:w-8",
                                        checked
                                          ? "scale-110 bg-primary text-primary-foreground shadow-sm"
                                          : "scale-100 bg-muted text-muted-foreground",
                                      )}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={!supported}
                                        onChange={() => supported && onTogglePermission(permission)}
                                        className="sr-only"
                                      />
                                      {!supported ? (
                                        <span className="text-[10px] font-bold">-</span>
                                      ) : checked ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
                                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      ) : (
                                        <div className="h-2 w-2 rounded-full bg-current opacity-40" />
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                    <div aria-live="polite" className="text-[13px] font-medium text-rose-600">
                      {status}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-6 py-3 text-[13px] font-bold tracking-wide text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? dictionary.settings.apiKeysCreatingStatus : dictionary.settings.apiKeysCreateButton}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
