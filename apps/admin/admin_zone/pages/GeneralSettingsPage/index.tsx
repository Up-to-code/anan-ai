import KeyValueGrid from "@/components/shared/KeyValueGrid";
import SectionScaffold from "@/components/shared/SectionScaffold";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { generalSettings } from "@/admin_zone/mocks/data";
import { settingsTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   General settings need a stable landing page for platform-level administrative context.
 * WHAT:  Renders the main organization and platform configuration summary.
 * HOW:   Shows the mocked settings as read-only configuration cards for this UI-only phase.
 */
export default function GeneralSettingsPage() {
  return (
    <SectionScaffold eyebrow="الإعدادات" title="الإعدادات العامة" description="إعدادات المؤسسة الأساسية التي تدير المنصة داخليًا." tabs={settingsTabs}>
      <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-card/50 shadow-sm">
        <div className="pb-8 border-b border-border/10">
          <h3 className="text-2xl font-black tracking-tight text-foreground">تكوين المنصة</h3>
          <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest">Organization Metadata</p>
        </div>
        <KeyValueGrid
          items={[
            { label: "اسم المؤسسة", value: <span className="font-black text-foreground">{generalSettings.organizationName}</span> },
            { label: "مساحة العمل الأساسية", value: <span className="font-bold text-primary">{generalSettings.primaryWorkspace}</span> },
            { label: "الوضع الافتراضي للمساعد", value: <span className="font-black text-foreground">{generalSettings.assistantMode}</span> },
            { label: "المدى الزمني الافتراضي", value: <span className="font-black text-foreground">{generalSettings.defaultRange}</span> },
          ]}
          columns={2}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}

