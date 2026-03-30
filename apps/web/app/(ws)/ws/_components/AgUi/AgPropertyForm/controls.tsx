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
    <section className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xl shadow-black/[0.02] transition-all">
      <div className="mb-8 border-b border-border/40 pb-6 text-right">
        <h3 className="text-xl font-black tracking-tight text-foreground">{title}</h3>
        {description ? <p className="mt-2 text-[14px] font-medium leading-relaxed text-muted-foreground/70">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2.5 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{children}</label>;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  type?: "text" | "number";
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-14 w-full rounded-2xl border border-border/40 bg-muted/10 px-5 text-[15px] font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-foreground/20 focus:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {icon ? <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30">{icon}</div> : null}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full resize-none rounded-2xl border border-border/40 bg-muted/10 px-5 py-4 text-[15px] font-bold leading-7 text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-foreground/20 focus:bg-muted/20"
    />
  );
}

export function UploadTile({
  title,
  subtitle,
  onClick,
  icon,
  disabled = false,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-border/50 bg-muted/10 px-5 py-5 text-right transition hover:border-foreground/20 hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="text-right">
        <div className="text-sm font-black text-foreground">{title}</div>
        {subtitle ? <div className="mt-1 text-xs font-semibold text-muted-foreground">{subtitle}</div> : null}
      </div>
      <div className="text-muted-foreground/60">{icon}</div>
    </button>
  );
}

export function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-muted/10 px-4 py-3 text-right">
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground/60">{label}</div>
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
    <div className="h-11 w-11 overflow-hidden rounded-2xl border border-border bg-muted/20">
      {avatarImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={avatarImage} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-black text-muted-foreground">
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
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
      >
        ×
      </button>
      <div className="truncate text-sm font-bold text-foreground">{file.name}</div>
    </div>
  );
}
