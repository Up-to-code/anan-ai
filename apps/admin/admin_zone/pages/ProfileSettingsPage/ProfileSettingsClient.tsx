"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import { AdminInput } from "@/components/shared/AdminFieldControls";
import FormField from "@/components/shared/FormField";
import SectionScaffold from "@/components/shared/SectionScaffold";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { settingsTabs } from "@/lib/adminSectionTabs";

type ProfileSettingsClientProps = {
  initialProfile: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
};

/**
 * WHY:   Profile settings need a simple personal-preferences form for the mocked admin experience.
 * WHAT:  Renders editable local-only profile fields for the signed-in admin.
 * HOW:   Stores the profile values in component state and provides a no-op save action.
 */
export default function ProfileSettingsClient({ initialProfile }: ProfileSettingsClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);

  function updateField(key: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  return (
    <SectionScaffold eyebrow="الإعدادات" title="الملف الشخصي" description="تحرير بيانات المشرف داخل الواجهة التجريبية." tabs={settingsTabs}>
      <WorkspacePanel className="space-y-4">
        <FormField label="الاسم">
          <AdminInput value={profile.name} onChange={(event) => updateField("name", event.target.value)} />
        </FormField>
        <FormField label="المسمى الوظيفي">
          <AdminInput value={profile.title} onChange={(event) => updateField("title", event.target.value)} />
        </FormField>
        <FormField label="البريد الإلكتروني">
          <AdminInput value={profile.email} onChange={(event) => updateField("email", event.target.value)} />
        </FormField>
        <FormField label="رقم الهاتف">
          <AdminInput value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} />
        </FormField>
        <div className="flex items-center gap-3">
          <Button onClick={() => setSaved(true)}>حفظ التغييرات</Button>
          {saved ? <span className="text-sm text-emerald-700">تم حفظ القيم محليًا داخل الواجهة التجريبية.</span> : null}
        </div>
      </WorkspacePanel>
    </SectionScaffold>
  );
}

