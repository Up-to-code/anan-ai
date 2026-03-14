"use client";

import { useState, useMemo } from "react";
import { X, Search, UserPlus, Mail, CheckCircle2, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY:   Projects need a structured way to assign, search, and invite brokers without leaving context.
 * WHAT:  A full-screen modal with two tabs — "اختيار وسيط" (pick from roster) and "دعوة بالبريد" (email invite).
 * HOW:   Controlled via `open` + `onClose` props. Calls `onAssign` with a broker id on selection.
 */

export type ModalBroker = {
  id: string;
  name: string;
  title: string;
  city: string;
  email?: string;
  avatarImage?: string;
  avatarLabel: string;
  state: "client-linked" | "qualified" | "idle";
  alreadyAssigned?: boolean;
};

const STATE_LABEL: Record<ModalBroker["state"], string> = {
  "client-linked": "مرتبط بعميل",
  qualified: "مؤهل",
  idle: "متاح",
};

const STATE_COLOR: Record<ModalBroker["state"], string> = {
  "client-linked": "text-blue-700 bg-blue-50 border-blue-200",
  qualified: "text-emerald-700 bg-emerald-50 border-emerald-200",
  idle: "text-slate-600 bg-slate-50 border-slate-200",
};

type Tab = "roster" | "invite";

export default function AgBrokerAssignmentModal({
  open,
  onClose,
  projectTitle,
  brokers,
  onAssign,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  projectTitle: string;
  brokers: ModalBroker[];
  onAssign: (brokerId: string) => void;
  onInvite: (email: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("roster");
  const [query, setQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [justAssigned, setJustAssigned] = useState<string | null>(null);
  const [justInvited, setJustInvited] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brokers;
    return brokers.filter(
      (b) =>
        b.name.includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q),
    );
  }, [brokers, query]);

  function handleAssign(id: string) {
    onAssign(id);
    setJustAssigned(id);
    setTimeout(() => setJustAssigned(null), 2000);
  }

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    onInvite(inviteEmail.trim());
    setJustInvited(true);
    setInviteEmail("");
    setTimeout(() => setJustInvited(false), 3000);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-white shadow-[0_32px_80px_rgba(15,23,42,0.25)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-slate-100 px-8 py-6 flex items-start justify-between shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase mb-2">
              إدارة الوسطاء
            </div>
            <h2 className="text-2xl font-black text-slate-950">{projectTitle}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              اختر وسيطاً من قائمة النظام أو ادعُ وسيطاً عبر البريد الإلكتروني
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-950 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0">
          {([
            { key: "roster" as Tab, label: "اختيار من الوسطاء", icon: Users },
            { key: "invite" as Tab, label: "دعوة بالبريد الإلكتروني", icon: Mail },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black tracking-[0.15em] uppercase transition border-b-2",
                tab === key
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "roster" ? (
            <div className="p-6 grid gap-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث باسم الوسيط أو تخصصه أو بريده..."
                  className="w-full border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:bg-white transition text-right"
                />
              </div>

              {/* Broker list */}
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm font-bold text-slate-400">
                  لا يوجد وسطاء مطابقون للبحث
                </div>
              ) : (
                <div className="grid gap-3">
                  {filtered.map((broker) => {
                    const isJustAssigned = justAssigned === broker.id;
                    return (
                      <div
                        key={broker.id}
                        className={cn(
                          "flex items-center gap-4 border p-4 transition-all duration-300",
                          broker.alreadyAssigned
                            ? "border-blue-200 bg-blue-50/50"
                            : "border-slate-100 bg-white hover:border-blue-200",
                        )}
                      >
                        {/* Avatar */}
                        <div className="h-12 w-12 shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center">
                          {broker.avatarImage ? (
                            <img
                              src={broker.avatarImage}
                              alt={broker.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-base font-black text-slate-500">
                              {broker.avatarLabel}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm font-black text-slate-950">{broker.name}</span>
                            {broker.alreadyAssigned && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-500 mt-0.5">{broker.title}</div>
                          <div className="flex items-center justify-end gap-2 mt-1.5">
                            <span
                              className={cn(
                                "border px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase",
                                STATE_COLOR[broker.state],
                              )}
                            >
                              {STATE_LABEL[broker.state]}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{broker.city}</span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="shrink-0">
                          {broker.alreadyAssigned ? (
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                              مُضاف
                            </span>
                          ) : isJustAssigned ? (
                            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              تمت الإضافة
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAssign(broker.id)}
                              className="flex items-center gap-1.5 border border-blue-600 bg-blue-600 px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest hover:bg-slate-950 hover:border-slate-950 transition"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              إضافة للمشروع
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Invite via email tab */
            <div className="p-8 grid gap-8">
              <div className="text-right grid gap-2">
                <h3 className="text-lg font-black text-slate-950">دعوة وسيط جديد</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  إذا كان الوسيط غير مسجل في النظام، يمكنك دعوته برسالة بريد إلكتروني.
                  سيحصل على رابط للتسجيل مرتبط مباشرةً بهذا المشروع.
                </p>
              </div>

              <div className="grid gap-4">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-right">
                  البريد الإلكتروني للوسيط
                </label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    placeholder="broker@example.com"
                    className="w-full border-b-2 border-slate-200 bg-transparent py-4 pr-12 pl-4 text-xl font-black text-slate-950 placeholder:text-slate-200 placeholder:font-medium outline-none focus:border-blue-600 transition text-right"
                    dir="ltr"
                  />
                </div>
              </div>

              {justInvited && (
                <div className="flex items-center justify-center gap-2 border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  تم إرسال الدعوة بنجاح! سيتلقى الوسيط رسالة الدعوة قريباً.
                </div>
              )}

              <button
                type="button"
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
                className="flex items-center justify-center gap-2 border-2 border-blue-600 bg-blue-600 px-8 py-4 text-sm font-black text-white uppercase tracking-[0.2em] hover:bg-slate-950 hover:border-slate-950 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Mail className="h-4 w-4" />
                إرسال دعوة للمشروع
              </button>

              {/* Info block */}
              <div className="border border-slate-100 bg-slate-50 p-5 text-right grid gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700">
                  ما يحدث بعد الدعوة
                </div>
                {[
                  "يصل للوسيط بريد إلكتروني يحتوي على رابط تسجيل خاص.",
                  "عند التسجيل، يُضاف تلقائياً لقائمة وسطاء هذا المشروع.",
                  "ستتلقى إشعاراً فور اكتمال التسجيل.",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 flex-row-reverse">
                    <div className="shrink-0 h-5 w-5 bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-8 py-4 flex items-center justify-between shrink-0 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-950 transition"
          >
            إغلاق
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <div className="h-1.5 w-1.5 rounded-none bg-blue-500 animate-pulse" />
            سيُحدَّث المشروع فور الإضافة
          </div>
        </div>
      </div>
    </div>
  );
}
