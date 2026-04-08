"use client";

import { useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/locale";
import type { ProfileSummary } from "@/server/contracts/profiles";

type ProfileWorkspaceProps = {
  initialProfile: ProfileSummary;
  fallbackName: string;
  fallbackEmail: string;
  onSave: (input: {
    name: string;
    username: string;
    showInOffersDirectory: boolean;
  }) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
};

type SaveStatus = {
  message: string;
  tone: "default" | "success" | "error";
};

function getAccountCopy(locale: AppLocale) {
  if (locale === "en") {
    return {
      sectionTitle: "Account details",
      sectionDescription: "Update the core details of the current account without leaving the workspace.",
      emailLabel: "Email",
      roleLabel: "Current role",
      statusLabel: "Status",
      visibilityLabel: "Offers directory",
      visible: "Visible",
      hidden: "Hidden",
      active: "Active",
      inactive: "Inactive",
      unknown: "Unavailable",
      developer: "Developer",
      broker: "Broker",
      user: "User",
      nameLabel: "Name",
      usernameLabel: "Username",
      usernameHint: "Use letters, numbers, dots, underscores, or hyphens. This value is used in internal search.",
      emailHint: "The email is tied to the current sign-in method and cannot be edited from this page.",
      directoryTitle: "Show account in offers directory",
      directoryHint: "Turn this off to hide your profile from the broker and developer tabs in the offers directory.",
      savePending: "Saving changes...",
      saveAction: "Save changes",
    };
  }

  if (locale === "fr") {
    return {
      sectionTitle: "Détails du compte",
      sectionDescription: "Mettez à jour les informations essentielles du compte actuel sans quitter l'espace de travail.",
      emailLabel: "E-mail",
      roleLabel: "Rôle actuel",
      statusLabel: "Statut",
      visibilityLabel: "Annuaire des offres",
      visible: "Visible",
      hidden: "Masqué",
      active: "Actif",
      inactive: "Inactif",
      unknown: "Indisponible",
      developer: "Promoteur",
      broker: "Courtier",
      user: "Utilisateur",
      nameLabel: "Nom",
      usernameLabel: "Nom d'utilisateur",
      usernameHint: "Utilisez des lettres, des chiffres, des points, des tirets bas ou des tirets. Cette valeur sert à la recherche interne.",
      emailHint: "L'e-mail est lié au mode de connexion actuel et ne peut pas être modifié depuis cette page.",
      directoryTitle: "Afficher le compte dans l'annuaire des offres",
      directoryHint: "Désactivez cette option pour masquer votre profil des onglets courtiers et promoteurs dans l'annuaire des offres.",
      savePending: "Enregistrement des modifications...",
      saveAction: "Enregistrer les modifications",
    };
  }

  return {
    sectionTitle: "بيانات الحساب",
    sectionDescription: "حدّث البيانات الأساسية للحساب الحالي بدون الخروج من مساحة العمل.",
    emailLabel: "البريد الإلكتروني",
    roleLabel: "الدور الحالي",
    statusLabel: "الحالة",
    visibilityLabel: "الظهور في العروض",
    visible: "ظاهر",
    hidden: "مخفي",
    active: "نشط",
    inactive: "غير نشط",
    unknown: "غير متاح",
    developer: "مطور",
    broker: "وسيط",
    user: "مستخدم",
    nameLabel: "الاسم",
    usernameLabel: "اسم المستخدم",
    usernameHint: "استخدم الأحرف والأرقام والشرطة أو النقطة. هذا الحقل يستخدم في البحث الداخلي.",
    emailHint: "البريد مرتبط بطريقة تسجيل الدخول الحالية ولا يتم تعديله من هذه الشاشة.",
    directoryTitle: "إظهار الحساب في دليل العروض",
    directoryHint: "عند إيقافها لن يظهر ملفك داخل تبويبات الوسطاء والمطورين في صفحة العروض.",
    savePending: "جاري حفظ التعديلات...",
    saveAction: "حفظ التعديلات",
  };
}

function resolveRoleLabel(role: string | undefined, locale: AppLocale) {
  const copy = getAccountCopy(locale);
  if (role === "developer") return copy.developer;
  if (role === "broker") return copy.broker;
  if (role === "user") return copy.user;
  return copy.unknown;
}

function resolveAccountStatusLabel(isActive: boolean | undefined, locale: AppLocale) {
  const copy = getAccountCopy(locale);
  return isActive === false ? copy.inactive : copy.active;
}

function resolveDirectoryVisibilityLabel(showInOffersDirectory: boolean | undefined, locale: AppLocale) {
  const copy = getAccountCopy(locale);
  return showInOffersDirectory === false ? copy.hidden : copy.visible;
}

/**
 * WHY:   The account center needs local form state and optimistic feedback while the page remains server rendered.
 * WHAT:  Renders the editable profile form with localized account summary metadata.
 * HOW:   Calls a server action for profile changes and keeps all transient feedback scoped to the form.
 */
export default function ProfileWorkspace({
  initialProfile,
  fallbackName,
  fallbackEmail,
  onSave,
}: ProfileWorkspaceProps) {
  const { locale, direction, isRtl } = useWebLocale();
  const copy = getAccountCopy(locale);
  const [name, setName] = useState(initialProfile.name ?? fallbackName);
  const [username, setUsername] = useState(initialProfile.username ?? "");
  const [showInOffersDirectory, setShowInOffersDirectory] = useState(initialProfile.showInOffersDirectory ?? true);
  const [status, setStatus] = useState<SaveStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const summaryItems = [
    {
      label: copy.emailLabel,
      value: initialProfile.email ?? fallbackEmail,
      valueDir: "ltr" as const,
    },
    {
      label: copy.roleLabel,
      value: resolveRoleLabel(initialProfile.role, locale),
    },
    {
      label: copy.statusLabel,
      value: resolveAccountStatusLabel(initialProfile.isActive, locale),
    },
    {
      label: copy.visibilityLabel,
      value: resolveDirectoryVisibilityLabel(showInOffersDirectory, locale),
    },
  ];

  return (
    <div className="space-y-5 pb-12" dir={direction}>
      <section className="rounded-[24px] bg-[var(--workspace-panel)] p-5 sm:p-6">
        <div className={cn("space-y-1", isRtl ? "text-right" : "text-left")}>
          <h2 className="text-lg font-bold text-foreground">{copy.sectionTitle}</h2>
          <p className="text-sm text-muted-foreground">{copy.sectionDescription}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-[18px] bg-background/65 px-4 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground">{item.label}</div>
              <div className="mt-1 text-[13px] font-bold text-foreground" dir={item.valueDir ?? direction}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <form
          className="mt-6 space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSaving(true);
            setStatus({ message: copy.savePending, tone: "default" });

            const result = await onSave({ name, username, showInOffersDirectory });
            setStatus({
              message: result.message,
              tone: result.ok ? "success" : "error",
            });
            setIsSaving(false);
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-semibold text-foreground">{copy.nameLabel}</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSaving}
                className="w-full rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 text-[14px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                name="name"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">{copy.usernameLabel}</label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isSaving}
                className="w-full rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 text-[14px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                name="username"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                spellCheck={false}
                dir="ltr"
              />
              <p className="text-[12px] font-medium text-muted-foreground">{copy.usernameHint}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">{copy.emailLabel}</label>
              <div
                className="rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 text-[14px] font-medium text-foreground/80"
                dir="ltr"
              >
                {initialProfile.email ?? fallbackEmail}
              </div>
              <p className="text-[12px] font-medium text-muted-foreground">{copy.emailHint}</p>
            </div>
          </div>

          <div className="rounded-[20px] border border-border/60 bg-background/55 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={showInOffersDirectory}
                onChange={(event) => setShowInOffersDirectory(event.target.checked)}
                disabled={isSaving}
                className="mt-1 h-4 w-4 border-slate-300 text-blue-600"
              />
              <span>
                <span className="block text-sm font-black text-foreground">{copy.directoryTitle}</span>
                <span className="mt-1 block text-xs font-medium leading-6 text-muted-foreground">{copy.directoryHint}</span>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div
              aria-live="polite"
              className={cn(
                "min-h-[20px] text-[13px] font-medium",
                status?.tone === "error"
                  ? "text-red-500"
                  : status?.tone === "success"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
              )}
            >
              {status?.message}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-[16px] bg-[var(--workspace-highlight)] px-5 py-3 text-[13px] font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? copy.savePending : copy.saveAction}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
