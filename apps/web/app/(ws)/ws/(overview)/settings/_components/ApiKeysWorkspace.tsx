"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Eye, FilePenLine, Home, KeyRound, PlusCircle, Trash2, Users } from "lucide-react";
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
    <div className="flex flex-wrap gap-2">
      {permissions.map((permission) => (
        <span
          key={permissionKey(permission)}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black tracking-wide text-slate-600"
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
    <div className="space-y-4">
      {keys.map((key) => (
        <article key={key.keyId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-black text-slate-950">{key.name}</h3>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
                    key.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700",
                  )}
                >
                  {key.status === "active" ? "نشط" : "ملغي"}
                </span>
              </div>
              <div className="grid gap-3 text-sm text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Key ID</div>
                  <div className="mt-1 font-semibold text-slate-700">{key.keyId}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prefix</div>
                  <div className="mt-1 font-semibold text-slate-700">{key.prefix}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Created By</div>
                  <div className="mt-1 font-semibold text-slate-700">{key.createdByName ?? key.createdBy}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Last Used</div>
                  <div className="mt-1 font-semibold text-slate-700">{formatDate(key.lastUsedAt)}</div>
                </div>
              </div>
              <ApiKeyPermissions permissions={key.permissions} />
            </div>
            <div className="flex min-w-[180px] flex-col gap-3 text-sm text-slate-500 lg:items-end">
              <div>تم الإنشاء: {formatDate(key.createdAt)}</div>
              <button
                type="button"
                onClick={() => onRevoke(key.keyId)}
                disabled={key.status !== "active" || isRevoking === key.keyId}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-4 py-2 text-xs font-black tracking-[0.18em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRevoking === key.keyId ? "جارٍ الإلغاء..." : key.status === "active" ? "إلغاء المفتاح" : "تم الإلغاء"}
              </button>
            </div>
          </div>
        </article>
      ))}
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
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("");
  const [selectedPermissionKeys, setSelectedPermissionKeys] = useState<string[]>(
    buildPresetPermissions("write").map(permissionKey),
  );
  const [status, setStatus] = useState<string | null>(null);
  const [revealedResult, setRevealedResult] = useState<OrganizationApiKeySecretResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const selectedPermissions = useMemo(
    () => selectedPermissionKeys.map((entry) => {
      const [resource, action] = entry.split(":");
      return { resource, action } as OrganizationApiKeyPermission;
    }),
    [selectedPermissionKeys],
  );

  if (!hasOrganization) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">مفاتيح API</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">أنشئ منظمة أولاً قبل إصدار أي مفاتيح تكامل.</p>
      </section>
    );
  }

  if (!canManage) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">مفاتيح API</h2>
        <p className="mt-2 text-sm font-medium text-amber-900">
          إدارة مفاتيح API متاحة للمدير فقط. يمكنك طلب ترقية الصلاحية من مدير المنظمة إذا كنت تحتاج هذا التكامل.
        </p>
      </section>
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

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-black tracking-tight text-slate-950">مفاتيح API</h2>
          <p className="text-sm font-medium text-slate-500">
            أنشئ مفاتيح مخصصة لتطبيقاتك الداخلية بحيث تصل فقط إلى بيانات منظمتك في العملاء والعقارات.
          </p>
        </div>

        {revealedResult ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            <div className="font-black">اعرض واحفظ المفتاح الآن</div>
            <div className="mt-2 font-medium">هذه هي المرة الوحيدة التي سنعرض فيها القيمة السرية الكاملة.</div>
            <code className="mt-4 block overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 text-left text-xs font-bold text-emerald-200">
              {revealedResult.apiKey}
            </code>
          </div>
        ) : null}

        <form className="mt-8 space-y-6" onSubmit={handleCreateKey}>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">اسم المفتاح</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              placeholder="اختياري: مثال تكامل الـ CRM الداخلي"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 transition focus:bg-white focus-visible:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
            <p className="text-xs font-medium text-slate-500">يمكنك ترك الاسم فارغاً وسيتم إنشاء اسم تلقائي للمفتاح.</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">الصلاحيات</div>
                <p className="mt-1 text-sm font-medium text-slate-500">اختر إجراءات واضحة لكل مورد. القراءة والإنشاء والتحديث والحذف يتم ضبطها بشكل مستقل.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => applyPreset("read")} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:bg-slate-50">قراءة فقط</button>
                <button type="button" onClick={() => applyPreset("write")} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:bg-slate-50">قراءة وكتابة</button>
                <button type="button" onClick={() => applyPreset("full")} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:bg-slate-50">كامل الصلاحيات</button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[160px_repeat(4,minmax(0,1fr))] border-b border-slate-200 bg-slate-50 text-center text-[11px] font-black uppercase tracking-widest text-slate-500">
                <div className="px-4 py-3 text-right">المورد</div>
                {actionCatalog.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div key={action.action} className="flex items-center justify-center gap-2 px-3 py-3">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{action.label}</span>
                    </div>
                  );
                })}
              </div>
              {permissionCatalog.map((resource) => {
                const ResourceIcon = resource.icon;
                return (
                  <div key={resource.resource} className="grid grid-cols-[160px_repeat(4,minmax(0,1fr))] items-center border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-2 px-4 py-4 text-sm font-black text-slate-900">
                      <ResourceIcon className="h-4 w-4 text-blue-600" />
                      <span>{resource.label}</span>
                    </div>
                    {actionCatalog.map((action) => {
                      const ActionIcon = action.icon;
                      const permission = { resource: resource.resource, action: action.action } as OrganizationApiKeyPermission;
                      const checked = selectedPermissionKeys.includes(permissionKey(permission));
                      return (
                        <label key={action.action} className="flex items-center justify-center px-3 py-4">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full border transition",
                              checked
                                ? "border-blue-200 bg-blue-50 text-blue-600"
                                : "border-slate-200 bg-white text-slate-400",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(permission)}
                              className="sr-only"
                            />
                            <ActionIcon className="h-4 w-4" />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <div aria-live="polite" className="text-xs font-bold text-slate-500">
              {status}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-xs font-black tracking-[0.18em] text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء مفتاح جديد"}
            </button>
          </div>
        </form>
      </section>

      {keys.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-black tracking-[0.14em] text-slate-700">المفاتيح الحالية</h3>
          </div>
          <ApiKeysList keys={keys} isRevoking={isRevoking} onRevoke={handleRevoke} />
        </section>
      ) : null}
    </div>
  );
}
