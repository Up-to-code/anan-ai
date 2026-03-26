"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Eye, FilePenLine, Home, KeyRound, PlusCircle, Trash2, Users, Plus, X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  OrganizationApiKeyPermission,
  OrganizationApiKeySecretResult,
  OrganizationApiKeySummary,
} from "@/server/contracts/organizationApiKeys";

const permissionCatalog = [
  { resource: "clients", label: "العملاء", icon: Users },
  { resource: "properties", label: "العقارات", icon: Home },
] as const;

const actionCatalog = [
  { action: "read", label: "قراءة", icon: Eye },
  { action: "create", label: "إنشاء", icon: PlusCircle },
  { action: "update", label: "تحديث", icon: FilePenLine },
  { action: "delete", label: "حذف", icon: Trash2 },
] as const;

function permissionKey(permission: OrganizationApiKeyPermission) {
  return `${permission.resource}:${permission.action}`;
}

function permissionLabel(permission: OrganizationApiKeyPermission) {
  const resourceLabel = permissionCatalog.find((entry) => entry.resource === permission.resource)?.label ?? permission.resource;
  const actionLabel = actionCatalog.find((entry) => entry.action === permission.action)?.label ?? permission.action;
  return `${resourceLabel} · ${actionLabel}`;
}

function buildPresetPermissions(preset: "read" | "write" | "full") {
  const resources = permissionCatalog.map((entry) => entry.resource);
  if (preset === "read") {
    return resources.map((resource) => ({ resource, action: "read" })) as OrganizationApiKeyPermission[];
  }
  if (preset === "write") {
    return resources.flatMap((resource) => ([
      { resource, action: "read" },
      { resource, action: "create" },
      { resource, action: "update" },
    ])) as OrganizationApiKeyPermission[];
  }
  return resources.flatMap((resource) => actionCatalog.map((entry) => ({ resource, action: entry.action }))) as OrganizationApiKeyPermission[];
}

function formatDate(value?: number) {
  if (!value) return "لم يُستخدم";
  return new Date(value).toLocaleDateString("ar-EG");
}

function ApiKeyPermissions({ permissions }: { permissions: OrganizationApiKeyPermission[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {permissions.map((permission) => (
        <span
          key={permissionKey(permission)}
          className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground"
        >
          {permissionLabel(permission)}
        </span>
      ))}
    </div>
  );
}

function ApiKeysList({
  keys,
  isRevoking,
  onRevoke,
}: {
  keys: OrganizationApiKeySummary[];
  isRevoking: string | null;
  onRevoke: (keyId: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="hidden grid-cols-[1.5fr_2fr_1.5fr_1fr_120px] items-center gap-4 border-b border-border bg-muted/30 px-6 py-4 text-[12px] font-semibold text-muted-foreground lg:grid">
        <div>المفتاح</div>
        <div>الصلاحيات</div>
        <div>التفاصيل</div>
        <div>آخر استخدام</div>
        <div className="text-left">الإجراء</div>
      </div>
      <div className="divide-y divide-border/50">
        {keys.map((key) => (
          <article key={key.keyId} className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/10 lg:grid lg:grid-cols-[1.5fr_2fr_1.5fr_1fr_120px] lg:items-center lg:gap-4 lg:p-6 lg:py-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-foreground">{key.name || "بدون اسم"}</h3>
                {key.status === "active" ? (
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" title="نشط" />
                ) : (
                  <span className="flex h-2 w-2 rounded-full bg-rose-500" title="ملغي" />
                )}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">{key.prefix}••••••••</p>
            </div>
            
            <ApiKeyPermissions permissions={key.permissions} />

            <div className="flex flex-col gap-1 text-[12px]">
              <div className="flex gap-1.5 text-muted-foreground">
                <span className="font-medium text-foreground">{key.createdByName ?? key.createdBy}</span>
              </div>
              <div className="text-[11px] text-muted-foreground/70">
                في {formatDate(key.createdAt)}
              </div>
            </div>

            <div className="text-[12px] font-medium text-foreground">
              {formatDate(key.lastUsedAt)}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => onRevoke(key.keyId)}
                disabled={key.status !== "active" || isRevoking === key.keyId}
                className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-500 dark:hover:bg-rose-500/10"
              >
                {isRevoking === key.keyId ? "إلغاء..." : key.status === "active" ? "إلغاء المفتاح" : "تم الإلغاء"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/**
 * WHY:   Organization settings need one focused workspace for self-service API key management.
 * WHAT:  Lists org API keys, creates new keys with granular permissions, and revokes existing keys.
 * HOW:   Keeps permission selection and one-time secret reveal in local state while delegating persistence to gateway routes.
 */
export default function ApiKeysWorkspace({
  initialKeys,
  canManage,
  hasOrganization,
}: {
  initialKeys: OrganizationApiKeySummary[];
  canManage: boolean;
  hasOrganization: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keys, setKeys] = useState(initialKeys);
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
    () => selectedPermissionKeys.map((entry) => {
      const [resource, action] = entry.split(":");
      return { resource, action } as OrganizationApiKeyPermission;
    }),
    [selectedPermissionKeys],
  );

  if (!hasOrganization) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <KeyRound className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">مفاتيح API</h2>
        <p className="mt-2 text-sm text-muted-foreground text-balance">
          أنشئ منظمة أولاً قبل إصدار أي مفاتيح تكامل. ستتمكن من تخصيص صلاحيات محددة لكل مفتاح لضمان أمان بياناتك.
        </p>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <KeyRound className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">مفاتيح API</h2>
        <p className="mt-2 text-sm text-muted-foreground text-balance">
          إدارة مفاتيح API متاحة للمدير فقط. يمكنك طلب ترقية الصلاحية من مدير المنظمة لإنشاء مفاتيح للتطبيقات الداخلية.
        </p>
      </div>
    );
  }

  async function handleCreateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedPermissions.length === 0) {
      setStatus("اختر صلاحية واحدة على الأقل قبل إنشاء المفتاح.");
      return;
    }

    setIsSubmitting(true);
    setStatus("جارٍ إنشاء المفتاح...");
    setRevealedResult(null);

    try {
      const response = await fetch("/api/organizations/current/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          permissions: selectedPermissions,
        }),
      });
      const payload = (await response.json()) as OrganizationApiKeySecretResult & { message?: string };
      if (!response.ok) {
        setStatus(payload.message ?? "تعذر إنشاء المفتاح.");
        return;
      }
      setKeys((current) => [payload.key, ...current]);
      setRevealedResult(payload);
      setName("");
      setSelectedPermissionKeys(buildPresetPermissions("write").map(permissionKey));
      setStatus("تم إنشاء المفتاح. احفظ القيمة السرية الآن لأنها لن تظهر مرة أخرى.");
    } catch {
      setStatus("تعذر إنشاء المفتاح الآن. حاول مرة أخرى بعد لحظة.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRevoke(keyId: string) {
    setIsRevoking(keyId);
    setStatus("جارٍ إلغاء المفتاح...");
    try {
      const response = await fetch(`/api/organizations/current/api-keys/${encodeURIComponent(keyId)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setStatus(payload.message ?? "تعذر إلغاء المفتاح.");
        return;
      }
      setKeys((current) => current.map((key) => (key.keyId === keyId ? { ...key, status: "revoked", revokedAt: Date.now() } : key)));
      setStatus("تم إلغاء المفتاح ولن يعمل بعد الآن.");
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
    // Reset modal state after it closes
    setTimeout(() => {
      setName("");
      setSelectedPermissionKeys(buildPresetPermissions("write").map(permissionKey));
      setStatus(null);
      setRevealedResult(null);
      setCopied(false);
    }, 300);
  }

  return (
    <div className="flex h-full flex-col px-4 py-6 sm:px-6 lg:px-8">
      {/* Header section with Create Button */}
      <header className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">مفاتيح API</h1>
          <p className="text-[14px] text-muted-foreground">
            قم بإدارة مفاتيح تطبيقاتك الداخلية لربط بياناتك في المنظمة بأمان.
          </p>
        </div>
        
        <Dialog.Root open={isModalOpen} onOpenChange={(open) => {
          if (!open) handleModalClose();
          else setIsModalOpen(true);
        }}>
          <Dialog.Trigger className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95">
            <Plus className="h-4 w-4" />
            إنشاء مفتاح جديد
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
              <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
                  <Dialog.Title className="text-lg font-bold">
                    {revealedResult ? "تم إنشاء المفتاح بنجاح" : "إنشاء مفتاح API جديد"}
                  </Dialog.Title>
                  <Dialog.Close 
                    aria-label="إغلاق"
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
                      <h3 className="mb-2 text-xl font-bold text-foreground">احتفظ بهذا المفتاح بسرية</h3>
                      <p className="mb-8 max-w-sm text-[13px] text-muted-foreground">
                        هذه هي المرة الوحيدة التي سنعرض فيها القيمة السرية الكاملة، يُرجى نسخها وحفظها في مكان آمن.
                      </p>
                      
                      <div className="w-full max-w-md rounded-2xl border border-border bg-muted/30 p-4">
                        <div className="flex items-center gap-3">
                          <code className="block flex-1 overflow-x-auto text-left text-[14px] font-semibold text-foreground" dir="ltr">
                            {revealedResult.apiKey}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="flex shrink-0 items-center gap-2 rounded-xl bg-background px-3 py-2 text-[12px] font-semibold text-foreground shadow-sm transition-all hover:bg-muted active:scale-95"
                          >
                            <Copy className="h-4 w-4" />
                            {copied ? "تم النسخ" : "نسخ"}
                          </button>
                        </div>
                      </div>

                      <div className="mt-10">
                        <Dialog.Close className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-[14px] font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-95">
                          تم، قمت بنسخ المفتاح
                        </Dialog.Close>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateKey} className="flex flex-col gap-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-semibold text-foreground">اسم المفتاح (اختياري)</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          disabled={isSubmitting}
                          placeholder="مثلاً: تكامل تطبيق الـ CRM الداخلي"
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <label className="text-[13px] font-semibold text-foreground">الصلاحيات</label>
                            <p className="mt-1 text-[12px] text-muted-foreground">اختر الإجراءات المسموح بها لتحديد نطاق هذا المفتاح.</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/30 p-1">
                            <button type="button" onClick={() => applyPreset("read")} className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition hover:bg-background hover:text-foreground hover:shadow-sm">قراءة فقط</button>
                            <button type="button" onClick={() => applyPreset("write")} className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition hover:bg-background hover:text-foreground hover:shadow-sm">قراءة وكتابة</button>
                            <button type="button" onClick={() => applyPreset("full")} className="rounded-lg px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition hover:bg-background hover:text-foreground hover:shadow-sm">شامل</button>
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                          <div className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] sm:grid-cols-[140px_1fr_1fr_1fr_1fr] items-center border-b border-border bg-muted/40 text-center text-[12px] font-semibold text-muted-foreground">
                            <div className="px-4 py-3 text-right">المورد</div>
                            {actionCatalog.map((action) => (
                              <div key={action.action} className="px-2 py-3">{action.label}</div>
                            ))}
                          </div>
                          <div className="divide-y divide-border">
                            {permissionCatalog.map((resource) => {
                              const ResourceIcon = resource.icon;
                              return (
                                <div key={resource.resource} className="grid grid-cols-[120px_1fr_1fr_1fr_1fr] sm:grid-cols-[140px_1fr_1fr_1fr_1fr] items-center transition-colors hover:bg-muted/10">
                                  <div className="flex items-center gap-2 px-4 py-4 text-[13px] font-semibold text-foreground">
                                    <ResourceIcon className="h-4 w-4 text-primary" />
                                    <span>{resource.label}</span>
                                  </div>
                                  {actionCatalog.map((action) => {
                                    const permission = { resource: resource.resource, action: action.action } as OrganizationApiKeyPermission;
                                    const checked = selectedPermissionKeys.includes(permissionKey(permission));
                                    return (
                                      <label key={action.action} className="flex cursor-pointer items-center justify-center p-3">
                                        <span className="sr-only">{action.label} {resource.label}</span>
                                        <div className={cn(
                                          "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-200",
                                          checked 
                                            ? "bg-primary text-primary-foreground shadow-sm scale-110" 
                                            : "bg-muted text-muted-foreground hover:bg-border scale-100"
                                        )}>
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => togglePermission(permission)}
                                            className="sr-only"
                                          />
                                          {checked ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4">
                                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
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
                          {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء المفتاح"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </header>

      {/* Main List */}
      <section className="flex-1 pb-10">
        {keys.length > 0 ? (
          <ApiKeysList keys={keys} isRevoking={isRevoking} onRevoke={handleRevoke} />
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/50 p-8 text-center text-muted-foreground">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border shadow-sm">
              <KeyRound className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <p className="text-[15px] font-semibold text-foreground">لا توجد مفاتيح API حتى الآن</p>
            <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed">
              ابدأ بإنشاء مفتاح للوصول إلى نظامك من التطبيقات الداخلية الخاصة بك وبناء عمليات مرنة.
            </p>
            <button
               type="button"
               onClick={() => setIsModalOpen(true)}
               className="mt-6 font-semibold text-primary hover:underline text-[13px]"
            >
               + إنشاء أول مفتاح لك
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
