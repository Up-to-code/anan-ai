"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { OrganizationApiKeyPermission } from "@/lib/auth/organizationPermissions";
import type {
  OrganizationApiKeySecretResult,
  OrganizationApiKeySummary,
} from "@/server/contracts/organizationApiKeys";
import { buildPresetPermissions, permissionKey } from "./catalog";

/**
 * WHY:   API key management mixes list state, create/revoke side effects, and one-time secret reveal state.
 * WHAT:  Centralizes local state and event handlers for the API keys settings workspace.
 * HOW:   Keeps fetch logic in one hook, resets modal state intentionally, and derives selected permissions from stable permission keys.
 */
export function useApiKeysWorkspace(args: {
  canCreate: boolean;
  canRevoke: boolean;
  initialKeys: OrganizationApiKeySummary[];
  onCreateKey: (
    input: {
      name: string;
      permissions: OrganizationApiKeyPermission[];
    },
  ) => Promise<{ ok: true; message: string; result: OrganizationApiKeySecretResult } | { ok: false; message: string }>;
  onRevokeKey: (keyId: string) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keys, setKeys] = useState(args.initialKeys);
  const [name, setName] = useState("");
  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState<string[]>(
    buildPresetPermissions("write").map(permissionKey),
  );
  const [status, setStatus] = useState<string | null>(null);
  const [revealedResult, setRevealedResult] = useState<OrganizationApiKeySecretResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedPermissions = useMemo(
    () =>
      selectedPermissionKeys.map((entry) => {
        const [resource, action] = entry.split(":");
        return { resource, action } as OrganizationApiKeyPermission;
      }),
    [selectedPermissionKeys],
  );

  function resetModalState() {
    setName("");
    setSelectedPermissionKeys(buildPresetPermissions("write").map(permissionKey));
    setStatus(null);
    setRevealedResult(null);
    setCopied(false);
  }

  async function handleCreateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!args.canCreate) {
      setStatus("إنشاء مفاتيح API متاح لمالك المنظمة فقط.");
      return;
    }
    if (selectedPermissions.length === 0) {
      setStatus("اختر صلاحية واحدة على الأقل قبل إنشاء المفتاح.");
      return;
    }

    setIsSubmitting(true);
    setStatus("جارٍ إنشاء المفتاح...");
    setRevealedResult(null);

    try {
      const result = await args.onCreateKey({
        name,
        permissions: selectedPermissions,
      });
      if (!result.ok) {
        setStatus(result.message);
        return;
      }
      setKeys((current) => [result.result.key, ...current]);
      setRevealedResult(result.result);
      setName("");
      setSelectedPermissionKeys(buildPresetPermissions("write").map(permissionKey));
      setStatus(result.message);
    } catch {
      setStatus("تعذر إنشاء المفتاح الآن. حاول مرة أخرى بعد لحظة.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!args.canRevoke) {
      setStatus("إلغاء مفاتيح API متاح فقط للمالك أو المدير.");
      return;
    }
    setIsRevoking(keyId);
    setStatus("جارٍ إلغاء المفتاح...");
    try {
      const result = await args.onRevokeKey(keyId);
      if (!result.ok) {
        setStatus(result.message);
        return;
      }
      setKeys((current) => current.map((key) => (key.keyId === keyId ? { ...key, status: "revoked", revokedAt: Date.now() } : key)));
      setStatus(result.message);
    } catch {
      setStatus("تعذر إلغاء المفتاح الآن. حاول مرة أخرى بعد لحظة.");
    } finally {
      setIsRevoking(null);
    }
  }

  function togglePermission(permission: OrganizationApiKeyPermission) {
    const key = permissionKey(permission);
    setSelectedPermissionKeys((current) => (
      current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]
    ));
  }

  function applyPreset(preset: "read" | "write" | "full") {
    setSelectedPermissionKeys(buildPresetPermissions(preset).map(permissionKey));
  }

  function handleCopy() {
    if (!revealedResult) return;
    navigator.clipboard.writeText(revealedResult.apiKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setTimeout(() => {
      resetModalState();
    }, 300);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      handleModalClose();
      return;
    }
    setIsModalOpen(true);
  }

  return {
    applyPreset,
    copied,
    handleCopy,
    handleCreateKey,
    handleModalClose,
    handleOpenChange,
    handleRevoke,
    isModalOpen,
    isRevoking,
    isSubmitting,
    keys,
    name,
    revealedResult,
    selectedPermissionKeys,
    setIsModalOpen,
    setName,
    status,
    togglePermission,
  };
}
