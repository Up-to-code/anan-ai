import { Bell, Camera, Save, Shield, UserSquare2, LogOut, TriangleAlert } from "lucide-react";
import { useUserData } from "@/_core/hooks/useUserData";
import { cn } from "@/_core/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/public_zone/ui/alert-dialog";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { signOut } from "@/_core/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { useLocale } from "@/shared_logic/i18n/useLocale";
import { toast } from "sonner";

export default function Settings() {
  const { user, isLoading } = useUserData();
  const [activeTab, setActiveTab] = useState("profile");
  const deactivateMyAccount = useMutation(api.shared_logic.users.index.deactivateMyAccount);
  const navigate = useNavigate();
  const { localizePath } = useLocale();

  const tabs = [
    { id: "profile", label: "الملف الشخصي", icon: UserSquare2 },
    { id: "notifications", label: "الإشعارات", icon: Bell },
    { id: "security", label: "الأمان", icon: Shield },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate(localizePath("/signin"), { replace: true });
  };

  const handleDeactivate = async () => {
    await deactivateMyAccount({});
    await signOut();
    toast.success("تم تعطيل الحساب بنجاح");
    navigate(localizePath("/signin"), { replace: true });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">الإعدادات</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          إدارة تفضيلات حسابك وبياناتك الشخصية والأمان
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-64 shrink-0 bg-white rounded-xl border border-slate-200 p-2 overflow-hidden">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-md transition-all group",
                  activeTab === tab.id
                    ? "bg-blue-600/10 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <tab.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    activeTab === tab.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600",
                  )}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
          </div>

          <div className="p-8 space-y-8">
            {activeTab === "profile" && (
              <div className="space-y-8 max-w-xl">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="h-24 w-24 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center overflow-hidden">
                      {user?.image ? (
                        <img src={user.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UserSquare2 className="h-10 w-10 text-slate-300" />
                      )}
                    </div>
                    <button className="absolute bottom-0 left-0 p-2 bg-white border border-slate-200 rounded-full text-slate-600 hover:text-blue-600 transition-colors">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-center sm:text-right">
                    <h3 className="font-bold text-slate-900 text-sm">صورة الملف الشخصي</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-3">
                      يفضل صورة مربعة بتنسيق PNG أو JPG (بحد أقصى 2MB)
                    </p>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] font-bold hover:bg-slate-50 transition-colors uppercase tracking-tight">
                      تغيير الصورة
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-6 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm font-medium"
                      placeholder="أدخل اسمك الكامل..."
                      defaultValue={user?.name || ""}
                      readOnly={isLoading}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm font-bold"
                        placeholder="+966 5X XXX XXXX"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2 text-right">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-400 text-sm font-medium cursor-not-allowed"
                        defaultValue={user?.email || ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-100 mt-4">
                  <button className="px-8 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-bold flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            )}

            {activeTab !== "profile" && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                {(() => {
                  const ActiveIcon = tabs.find((t) => t.id === activeTab)?.icon || UserSquare2;
                  return <ActiveIcon className="h-12 w-12 mb-4 opacity-20" />;
                })()}
                <p className="text-sm font-bold tracking-tight">
                  قريباً: إعدادات {tabs.find((t) => t.id === activeTab)?.label}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-red-200 bg-red-50/40 p-5">
              <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
                <TriangleAlert className="h-4 w-4" />
                منطقة خطرة
              </h3>
              <p className="mt-1 text-xs text-red-600">
                تسجيل الخروج وتعطيل الحساب متاحان من هنا فقط.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-4 py-2 border border-slate-300 bg-white rounded-md text-xs font-bold text-slate-700 hover:bg-slate-50">
                      <span className="inline-flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        تسجيل الخروج
                      </span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد تسجيل الخروج</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من رغبتك في تسجيل الخروج الآن؟
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>تأكيد</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-4 py-2 border border-red-200 bg-red-100 rounded-md text-xs font-bold text-red-700 hover:bg-red-200">
                      تعطيل الحساب
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تعطيل الحساب</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد؟ سيتم تعطيل الحساب ومنع تسجيل الدخول حتى إعادة التفعيل.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeactivate}>نعم، عطّل الحساب</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
