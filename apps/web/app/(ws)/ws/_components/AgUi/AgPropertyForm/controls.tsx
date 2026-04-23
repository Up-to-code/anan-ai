import type { UploadedFileReference } from "@/server/contracts/files";

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] py-7 first:border-t-0 first:pt-0">
      <div className="mb-5 text-right">
        <h3 className="text-lg font-black tracking-normal text-foreground">{title}</h3>
        {description ? <p className="mt-1.5 text-[13px] leading-6 text-[var(--workspace-muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2.5 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">{children}</label>;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  disabled = false,
  error,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  type?: "text" | "number";
  disabled?: boolean;
  error?: string;
  testId?: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="relative">
        <input
          data-testid={testId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`h-13 w-full rounded-xl border bg-transparent px-4 text-[15px] font-bold text-foreground outline-none transition-all placeholder:text-[color:color-mix(in_srgb,var(--workspace-muted)_76%,transparent)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,var(--workspace-border))] focus:bg-[var(--workspace-elevated)] disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-rose-300 focus:border-rose-400" : "border-[color:var(--workspace-border)]"
          }`}
        />
        {icon ? <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--workspace-muted)]">{icon}</div> : null}
      </div>
      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  error?: string;
  testId?: string;
}) {
  return (
    <div className="grid gap-2">
      <textarea
        data-testid={testId}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`w-full resize-none rounded-xl border bg-transparent px-4 py-3 text-[15px] font-bold leading-7 text-foreground outline-none transition-all placeholder:text-[color:color-mix(in_srgb,var(--workspace-muted)_76%,transparent)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,var(--workspace-border))] focus:bg-[var(--workspace-elevated)] ${
          error ? "border-rose-300 focus:border-rose-400" : "border-[color:var(--workspace-border)]"
        }`}
      />
      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}

export function SelectInput<TValue extends string>({
  value,
  onChange,
  options,
  disabled = false,
  error,
  testId,
}: {
  value: TValue;
  onChange: (value: TValue) => void;
  options: ReadonlyArray<{ value: TValue; label: string }>;
  disabled?: boolean;
  error?: string;
  testId?: string;
}) {
  return (
    <div className="grid gap-2">
      <select
        data-testid={testId}
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={`h-13 w-full rounded-xl border bg-transparent px-4 text-[15px] font-bold text-foreground outline-none transition-all focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,var(--workspace-border))] focus:bg-[var(--workspace-elevated)] disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-rose-300 focus:border-rose-400" : "border-[color:var(--workspace-border)]"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}

export function UploadTile({
  title,
  subtitle,
  onClick,
  icon,
  disabled = false,
  testId,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-dashed border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-5 py-5 text-right transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_22%,var(--workspace-border))] hover:bg-[var(--workspace-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="text-right">
        <div className="text-sm font-black text-foreground">{title}</div>
        {subtitle ? <div className="mt-1 text-xs font-semibold text-[var(--workspace-muted)]">{subtitle}</div> : null}
      </div>
      <div className="text-[var(--workspace-muted)]">{icon}</div>
    </button>
  );
}

export function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3 text-right">
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="text-xs font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]">{label}</div>
    </div>
  );
}

export function BrokerAvatar({
  avatarImage,
  avatarLabel,
}: {
  avatarImage?: string | null;
  avatarLabel: string;
}) {
  return (
    <div className="h-11 w-11 overflow-hidden rounded-[16px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)]">
      {avatarImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={avatarImage} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-black text-[var(--workspace-muted)]">
          {avatarLabel}
        </div>
      )}
    </div>
  );
}

export function FileRow({
  file,
  onRemove,
}: {
  file: UploadedFileReference;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3">
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] hover:text-foreground"
      >
        ×
      </button>
      <div className="truncate text-sm font-bold text-foreground">{file.name}</div>
    </div>
  );
}
