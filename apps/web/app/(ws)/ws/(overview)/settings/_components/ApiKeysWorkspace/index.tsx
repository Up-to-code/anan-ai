"use client";

import { KeyRound } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { ApiKeysList } from "./ApiKeysList";
import { CreateApiKeyDialog } from "./CreateApiKeyDialog";
import { useApiKeysWorkspace } from "./useApiKeysWorkspace";
import type { ApiKeysWorkspaceProps } from "./types";

/**
 * WHY:   Organization settings need one focused workspace for self-service API key management.
 * WHAT:  Lists org API keys, lets owners create keys, and lets owners/managers revoke keys.
 * HOW:   Keeps permission selection and one-time secret reveal in local state while delegating persistence to server actions.
 */
export default function ApiKeysWorkspace({
  initialKeys,
  canCreate,
  canRevoke,
  canView,
  hasOrganization,
  onCreateKey,
  onRevokeKey,
}: ApiKeysWorkspaceProps) {
  const { dictionary } = useWebLocale();
  const workspace = useApiKeysWorkspace({ canCreate, canRevoke, initialKeys, onCreateKey, onRevokeKey });

  if (!hasOrganization) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <KeyRound className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">{dictionary.settings.apiKeysNoOrgTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground text-balance">
          {dictionary.settings.apiKeysNoOrgDescription}
        </p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <KeyRound className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">{dictionary.settings.apiKeysRestrictedTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground text-balance">
          {dictionary.settings.apiKeysRestrictedDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{dictionary.settings.apiKeysPageTitle}</h1>
          <p className="text-[14px] text-muted-foreground">
            {dictionary.settings.apiKeysPageDescription}
          </p>
        </div>

        <CreateApiKeyDialog
          canCreate={canCreate}
          copied={workspace.copied}
          isModalOpen={workspace.isModalOpen}
          isSubmitting={workspace.isSubmitting}
          name={workspace.name}
          onApplyPreset={workspace.applyPreset}
          onClose={workspace.handleModalClose}
          onCopy={workspace.handleCopy}
          onCreateKey={workspace.handleCreateKey}
          onNameChange={workspace.setName}
          onOpenChange={workspace.handleOpenChange}
          onTogglePermission={workspace.togglePermission}
          revealedResult={workspace.revealedResult}
          selectedPermissionKeys={workspace.selectedPermissionKeys}
          status={workspace.status}
        />
      </header>

      {workspace.status ? (
        <div className="mb-4 rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-[12px] text-muted-foreground">
          {workspace.status}
        </div>
      ) : null}

      <section className="flex-1 pb-10">
        {workspace.keys.length > 0 ? (
          <ApiKeysList keys={workspace.keys} canRevoke={canRevoke} isRevoking={workspace.isRevoking} onRevoke={workspace.handleRevoke} />
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/50 p-8 text-center text-muted-foreground">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background">
              <KeyRound className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <p className="text-[15px] font-semibold text-foreground">{dictionary.settings.apiKeysEmptyTitle}</p>
            <p className="mt-2 max-w-[320px] text-[13px] leading-relaxed">
              {dictionary.settings.apiKeysEmptyDescription}
            </p>
            {canCreate ? (
              <button
                type="button"
                onClick={() => workspace.setIsModalOpen(true)}
                className="mt-6 text-[13px] font-semibold text-primary hover:underline"
              >
                {dictionary.settings.apiKeysCreateFirst}
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
