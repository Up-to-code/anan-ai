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
    <SectionScaffold eyebrow="الإعدادات" title="الملف الشخصي" description="إدارة بياناتك الشخصية وتفضيلات الدخول داخل النظام." tabs={settingsTabs}>
      <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-card/50 shadow-sm">
        <div className="pb-8 border-b border-border/10">
          <h3 className="text-2xl font-black tracking-tight text-foreground">البيانات الشخصية</h3>
          <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest">Personal Identification</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <FormField label="الاسم الكامل" className="font-black text-xs uppercase tracking-widest text-muted-foreground/50">
            <AdminInput 
              value={profile.name} 
              onChange={(event) => updateField("name", event.target.value)} 
              className="rounded-xl border-border/40 bg-background font-black h-12 px-5"
            />
          </FormField>
          <FormField label="المسمى الوظيفي" className="font-black text-xs uppercase tracking-widest text-muted-foreground/50">
            <AdminInput 
              value={profile.title} 
              onChange={(event) => updateField("title", event.target.value)} 
              className="rounded-xl border-border/40 bg-background font-black h-12 px-5"
            />
          </FormField>
          <FormField label="البريد الإلكتروني" className="font-black text-xs uppercase tracking-widest text-muted-foreground/50">
            <AdminInput 
              value={profile.email} 
              onChange={(event) => updateField("email", event.target.value)} 
              className="rounded-xl border-border/40 bg-background font-black h-12 px-5 text-primary"
            />
          </FormField>
          <FormField label="رقم الهاتف" className="font-black text-xs uppercase tracking-widest text-muted-foreground/50">
            <AdminInput 
              value={profile.phone} 
              onChange={(event) => updateField("phone", event.target.value)} 
              className="rounded-xl border-border/40 bg-background font-black h-12 px-5"
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6 pt-10 border-t border-border/5 sm:flex-row sm:items-center sm:justify-between">
          <Button 
            onClick={() => setSaved(true)} 
            className="h-12 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
          >
            تحديث الملف الشخصي
          </Button>
          {saved && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm font-black text-emerald-600">تم حفظ البيانات بنجاح في الذاكرة المحلية.</span>
            </div>
          )}
        </div>
      </WorkspacePanel>
    </SectionScaffold>
  );
}

