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
      <WorkspacePanel className="space-y-4">
        <KeyValueGrid
          items={[
            { label: "اسم المؤسسة", value: generalSettings.organizationName },
            { label: "مساحة العمل الأساسية", value: generalSettings.primaryWorkspace },
            { label: "الوضع الافتراضي للمساعد", value: generalSettings.assistantMode },
            { label: "المدى الزمني الافتراضي", value: generalSettings.defaultRange },
          ]}
          columns={2}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}

