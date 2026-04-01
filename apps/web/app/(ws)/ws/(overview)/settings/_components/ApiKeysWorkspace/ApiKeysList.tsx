import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { formatWebCopy } from "@/lib/i18n";
import { permissionKey, permissionLabel, formatApiKeyDate } from "./catalog";
import type { OrganizationApiKeyPermission } from "@/lib/auth/organizationPermissions";
import type { OrganizationApiKeySummary } from "@/server/contracts/organizationApiKeys";

function ApiKeyPermissions({ permissions }: { permissions: OrganizationApiKeyPermission[] }) {
  const { locale } = useWebLocale();
  return (
    <div className="flex flex-wrap gap-1.5">
      {permissions.map((permission) => (
        <span
          key={permissionKey(permission)}
          className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground"
        >
          {permissionLabel(permission, locale)}
        </span>
      ))}
    </div>
  );
}

/**
 * WHY:   API key overview should stay visually focused while revoke actions remain available inline.
 * WHAT:  Renders the current organization API keys with permissions, ownership details, and revoke buttons.
 * HOW:   Uses the shared permission catalog helpers for labels and leaves revocation side effects to the parent hook.
 */
export function ApiKeysList({
  keys,
  canRevoke,
  isRevoking,
  onRevoke,
}: {
  keys: OrganizationApiKeySummary[];
  canRevoke: boolean;
  isRevoking: string | null;
  onRevoke: (keyId: string) => Promise<void>;
}) {
  const { dictionary, locale } = useWebLocale();
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="hidden grid-cols-[1.5fr_2fr_1.5fr_1fr_120px] items-center gap-4 border-b border-border bg-muted/30 px-6 py-4 text-[12px] font-semibold text-muted-foreground lg:grid">
        <div>{dictionary.settings.apiKeysPageTitle}</div>
        <div>{dictionary.settings.apiKeysPermissionsLabel}</div>
        <div>{dictionary.settings.apiKeysDetailsColumn}</div>
        <div>{dictionary.settings.apiKeysLastUsedColumn}</div>
        <div className="text-left">{dictionary.settings.apiKeysActionColumn}</div>
      </div>
      <div className="divide-y divide-border/50">
        {keys.map((key) => (
          <article key={key.keyId} className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/10 lg:grid lg:grid-cols-[1.5fr_2fr_1.5fr_1fr_120px] lg:items-center lg:gap-4 lg:p-6 lg:py-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-semibold text-foreground">{key.name || dictionary.settings.apiKeysUnnamed}</h3>
                {key.status === "active" ? (
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" title={dictionary.settings.apiKeysActive} />
                ) : (
                  <span className="flex h-2 w-2 rounded-full bg-rose-500" title={dictionary.settings.apiKeysRevoked} />
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
                {formatWebCopy(dictionary.settings.apiKeysCreatedAt, {
                  date: formatApiKeyDate(key.createdAt, locale, dictionary.settings.apiKeysNeverUsed),
                })}
              </div>
            </div>

            <div className="text-[12px] font-medium text-foreground">
              {formatApiKeyDate(key.lastUsedAt, locale, dictionary.settings.apiKeysNeverUsed)}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => onRevoke(key.keyId)}
                disabled={!canRevoke || key.status !== "active" || isRevoking === key.keyId}
                className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-500 dark:hover:bg-rose-500/10"
              >
                {isRevoking === key.keyId
                  ? dictionary.settings.apiKeysRevoking
                  : key.status === "active"
                    ? dictionary.settings.apiKeysRevoke
                    : dictionary.settings.apiKeysRevokedState}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
