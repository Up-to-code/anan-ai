import { Building2, MapPin, Search, UserPlus, X } from "lucide-react";
import AgRichTextEditor from "./AgRichTextEditor";
import type { AgPropertyFormState } from "./AgPropertyForm.shared";
import type { BrokerPresence } from "../Visuals/BrokerPresenceChip";

type AgPropertyFormPrimaryColumnProps = {
  brokerSearch: string;
  filteredBrokers: BrokerPresence[];
  formState: AgPropertyFormState;
  isBrokerDropdownOpen: boolean;
  selectedBroker?: BrokerPresence;
  setBrokerSearch: React.Dispatch<React.SetStateAction<string>>;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setIsBrokerDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBrokerId: React.Dispatch<React.SetStateAction<string | null>>;
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)] sm:p-7">
      <div className="mb-6 border-b border-[color:var(--workspace-border)] pb-4">
        <h3 className="text-xl font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h3>
        {description ? <p className="mt-2 text-sm leading-6 text-[var(--workspace-muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[52px] w-full rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3 text-base font-semibold text-[var(--workspace-bubble-other-foreground)] outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_36%,transparent)] focus:bg-[var(--workspace-panel)]"
      />
      {icon ? <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--workspace-muted)]">{icon}</div> : null}
    </div>
  );
}

function TextArea({
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
      className="w-full resize-none rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3 text-base font-semibold text-[var(--workspace-bubble-other-foreground)] outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_36%,transparent)] focus:bg-[var(--workspace-panel)]"
    />
  );
}

function BrokerAvatar({
  avatarImage,
  avatarLabel,
}: {
  avatarImage?: string | null;
  avatarLabel: string;
}) {
  return (
    <div className="h-11 w-11 overflow-hidden rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)]">
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

function BasicDataSection({
  formState,
  setFormState,
}: Pick<AgPropertyFormPrimaryColumnProps, "formState" | "setFormState">) {
  return (
    <FormSection title="البيانات الأساسية" description="املأ أهم معلومات المشروع التي تظهر أولاً في الصفحات والمشاركات.">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <FormLabel>اسم المشروع</FormLabel>
          <TextInput
            value={formState.name}
            onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
            placeholder="مثال: أبراج الياسمين"
            icon={<Building2 className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <FormLabel>السعر</FormLabel>
            <TextInput
              value={formState.price}
              onChange={(value) => setFormState((prev) => ({ ...prev, price: value }))}
              placeholder="مثال: 2,500,000 ر.س"
            />
          </div>
          <div className="grid gap-2">
            <FormLabel>الموقع</FormLabel>
            <TextInput
              value={formState.location}
              onChange={(value) => setFormState((prev) => ({ ...prev, location: value }))}
              placeholder="مثال: جدة، أبحر الشمالية"
              icon={<MapPin className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}

function MarketingSection({
  formState,
  setFormState,
}: Pick<AgPropertyFormPrimaryColumnProps, "formState" | "setFormState">) {
  return (
    <FormSection title="وصف المشروع" description="اكتب الوصف الكامل الذي يشرح الفكرة، الموقع، وطبيعة المشروع بشكل واضح.">
      <AgRichTextEditor
        value={formState.description}
        onChange={(value) => setFormState((prev) => ({ ...prev, description: value }))}
        placeholder="صف المشروع بشكل واضح ومباشر. ما الذي يميزه؟ ما نوع الوحدات؟ وما أهم عناصر الجذب؟"
        className="text-right"
      />
    </FormSection>
  );
}

function PresentationSection({
  formState,
  setFormState,
}: Pick<AgPropertyFormPrimaryColumnProps, "formState" | "setFormState">) {
  return (
    <FormSection title="محتوى صفحة العرض" description="هذه المعلومات تظهر بجوار المعرض وفي بطاقة المشروع عند مشاركته.">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <FormLabel>وصف قصير</FormLabel>
          <TextArea
            rows={3}
            value={formState.shortDescription}
            onChange={(value) => setFormState((prev) => ({ ...prev, shortDescription: value }))}
            placeholder="ملخص قصير وسريع يشرح المشروع في سطرين أو ثلاثة."
          />
        </div>

        <div className="grid gap-2">
          <FormLabel>المزايا والخدمات</FormLabel>
          <TextArea
            rows={4}
            value={formState.amenitiesText}
            onChange={(value) => setFormState((prev) => ({ ...prev, amenitiesText: value }))}
            placeholder="مثال: مواقف خاصة، نادي، حراسة، مصاعد، منطقة أطفال"
          />
          <p className="text-sm text-[var(--workspace-muted)]">افصل بين كل ميزة بفاصلة أو سطر جديد.</p>
        </div>
      </div>
    </FormSection>
  );
}

function SelectedBrokerCard({
  selectedBroker,
  setSelectedBrokerId,
}: Pick<AgPropertyFormPrimaryColumnProps, "selectedBroker" | "setSelectedBrokerId">) {
  if (!selectedBroker) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-4">
      <button
        type="button"
        onClick={() => setSelectedBrokerId(null)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] hover:text-[var(--workspace-bubble-other-foreground)]"
        title="إلغاء التكليف"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{selectedBroker.name}</div>
          <div className="mt-1 text-xs font-semibold text-[var(--workspace-muted)]">{selectedBroker.title}</div>
        </div>
        <BrokerAvatar
          avatarImage={selectedBroker.avatarImage}
          avatarLabel={selectedBroker.avatarLabel}
        />
      </div>
    </div>
  );
}

function BrokerDropdown({
  filteredBrokers,
  setBrokerSearch,
  setIsBrokerDropdownOpen,
  setSelectedBrokerId,
}: Pick<
  AgPropertyFormPrimaryColumnProps,
  "filteredBrokers" | "setBrokerSearch" | "setIsBrokerDropdownOpen" | "setSelectedBrokerId"
>) {
  if (filteredBrokers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-[var(--workspace-muted)]">
        <UserPlus className="h-5 w-5 text-[var(--workspace-muted)]" />
        لا توجد نتائج مطابقة
      </div>
    );
  }

  return (
    <div className="grid divide-y divide-[color:var(--workspace-border)]">
      {filteredBrokers.map((broker) => (
        <button
          key={broker.id}
          type="button"
          onClick={() => {
            setSelectedBrokerId(broker.id);
            setIsBrokerDropdownOpen(false);
            setBrokerSearch("");
          }}
          className="flex items-center justify-between gap-4 px-4 py-3 text-right transition hover:bg-[var(--workspace-accent-soft)]"
        >
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{broker.name}</div>
              <div className="mt-1 text-xs font-semibold text-[var(--workspace-muted)]">{broker.title}</div>
            </div>
            <BrokerAvatar avatarImage={broker.avatarImage} avatarLabel={broker.avatarLabel} />
          </div>
        </button>
      ))}
    </div>
  );
}

function BrokerPicker(
  props: Pick<
    AgPropertyFormPrimaryColumnProps,
    | "brokerSearch"
    | "filteredBrokers"
    | "isBrokerDropdownOpen"
    | "setBrokerSearch"
    | "setIsBrokerDropdownOpen"
    | "setSelectedBrokerId"
  >,
) {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={props.brokerSearch}
          onChange={(event) => {
            props.setBrokerSearch(event.target.value);
            props.setIsBrokerDropdownOpen(true);
          }}
          onFocus={() => props.setIsBrokerDropdownOpen(true)}
          placeholder="ابحث باسم الوسيط ثم اختره"
          className="min-h-[52px] w-full rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3 pr-11 text-base font-semibold text-[var(--workspace-bubble-other-foreground)] outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_36%,transparent)] focus:bg-[var(--workspace-panel)]"
        />
        <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--workspace-muted)]" />
      </div>

      {props.isBrokerDropdownOpen ? (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => props.setIsBrokerDropdownOpen(false)}
          />
          <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
            <BrokerDropdown
              filteredBrokers={props.filteredBrokers}
              setBrokerSearch={props.setBrokerSearch}
              setIsBrokerDropdownOpen={props.setIsBrokerDropdownOpen}
              setSelectedBrokerId={props.setSelectedBrokerId}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function BrokerAssignmentSection(
  props: Pick<
    AgPropertyFormPrimaryColumnProps,
    | "brokerSearch"
    | "filteredBrokers"
    | "isBrokerDropdownOpen"
    | "selectedBroker"
    | "setBrokerSearch"
    | "setIsBrokerDropdownOpen"
    | "setSelectedBrokerId"
  >,
) {
  return (
    <FormSection title="تكليف وسيط" description="اختياري. اربط المشروع بوسيط محدد إذا كنت تريد إدارته مباشرة من هذه الصفحة.">
      {props.selectedBroker ? (
        <SelectedBrokerCard
          selectedBroker={props.selectedBroker}
          setSelectedBrokerId={props.setSelectedBrokerId}
        />
      ) : (
        <BrokerPicker {...props} />
      )}
    </FormSection>
  );
}

export function AgPropertyFormPrimaryColumn(props: AgPropertyFormPrimaryColumnProps) {
  return (
    <div className="min-w-0 space-y-6">
      <BasicDataSection formState={props.formState} setFormState={props.setFormState} />
      <MarketingSection formState={props.formState} setFormState={props.setFormState} />
      <PresentationSection formState={props.formState} setFormState={props.setFormState} />
      <BrokerAssignmentSection
        brokerSearch={props.brokerSearch}
        filteredBrokers={props.filteredBrokers}
        isBrokerDropdownOpen={props.isBrokerDropdownOpen}
        selectedBroker={props.selectedBroker}
        setBrokerSearch={props.setBrokerSearch}
        setIsBrokerDropdownOpen={props.setIsBrokerDropdownOpen}
        setSelectedBrokerId={props.setSelectedBrokerId}
      />
    </div>
  );
}
