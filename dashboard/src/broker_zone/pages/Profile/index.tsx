import { useSession, signOut } from "@/_core/lib/auth-client";
import { LogOut, User, Mail, Shield, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * WHY:   Allows brokers to view their account details and authentication state.
 * WHAT:  Displays the currently logged-in user profile tied to Better Auth.
 * HOW:   Acts as an Orchestrator parsing `useSession` from the global auth client.
 */
export default function BrokerProfile() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">الملف الشخصي</h1>
        <p className="text-sm text-slate-500 mt-1">عرض وإدارة بيانات حسابك كبروكر عقاري</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-none">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-blue-600/10 border-4 border-white flex items-center justify-center text-blue-600 text-3xl font-bold uppercase transition-transform group-hover:scale-105">
              {user?.image ? (
                <img src={user.image} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                (user?.name ?? user?.email ?? "?").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="absolute bottom-0 right-0 h-6 w-6 bg-emerald-500 border-2 border-white rounded-full" title="نشط حالياً" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">{user?.name ?? "بروكر"}</h2>
          <p className="text-sm text-slate-500 font-medium">{user?.email}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
              بروكر معتمد
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter">
              عضو منذ 2024
            </span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الإسم الكامل</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{user?.name || "لم يتم التحديد"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">البريد الإلكتروني</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">نوع الحساب</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">بروكر (Broker)</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100">
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              تعديل بيانات الحساب
              <ChevronLeft className="h-4 w-4" />
            </Link>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

