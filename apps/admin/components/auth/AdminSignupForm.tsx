"use client";

import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/shared/Button";

function readSignupToken(searchParams: URLSearchParams) {
  return searchParams.get("token") ?? undefined;
}

/**
 * WHY:   Admin registration must be explicit, invite-gated, and separate from public user onboarding.
 * WHAT:  Renders the trusted admin signup form for invite token or bootstrap-secret flows.
 * HOW:   Posts to the server signup bridge, which validates the invite and forwards Better Auth cookies.
 */
export default function AdminSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bootstrapSecret, setBootstrapSecret] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    if (password !== confirmPassword) {
      setErrorMessage("كلمتا المرور غير متطابقتين.");
      return;
    }
    setPending(true);
    const response = await fetch("/api/admin-signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        token: readSignupToken(searchParams),
        bootstrapSecret: bootstrapSecret || undefined,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setErrorMessage(payload.message ?? "تعذر إنشاء حساب الإدارة.");
      return;
    }
    router.replace(payload.redirectTo ?? "/overview");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} data-testid="admin-signup-form">
      <div className="space-y-3 text-right">
        <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="admin-signup-name">
          الاسم
        </label>
        <div className="flex h-12 items-center gap-3 border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500">
          <UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input id="admin-signup-name" name="name" value={name} onChange={(event) => setName(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none" />
        </div>
      </div>

      <div className="space-y-3 text-right">
        <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="admin-signup-email">
          البريد الإلكتروني
        </label>
        <div className="flex h-12 items-center gap-3 border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500">
          <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input id="admin-signup-email" name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none" dir="ltr" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 text-right">
          <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="admin-signup-password">
            كلمة المرور
          </label>
          <div className="flex h-12 items-center gap-3 border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500">
            <KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input id="admin-signup-password" name="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none" dir="ltr" />
          </div>
        </div>
        <div className="space-y-3 text-right">
          <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="admin-signup-confirm">
            تأكيد كلمة المرور
          </label>
          <div className="flex h-12 items-center gap-3 border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500">
            <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input id="admin-signup-confirm" name="confirmPassword" type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none" dir="ltr" />
          </div>
        </div>
      </div>

      {!readSignupToken(searchParams) ? (
        <div className="space-y-3 text-right">
          <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="admin-bootstrap-secret">
            رمز التهيئة
          </label>
          <input id="admin-bootstrap-secret" name="bootstrapSecret" type="password" value={bootstrapSecret} onChange={(event) => setBootstrapSecret(event.target.value)} className="h-12 w-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500" dir="ltr" />
        </div>
      ) : null}

      {errorMessage ? <p className="text-right text-xs font-bold leading-6 text-rose-600" role="alert">{errorMessage}</p> : null}

      <Button type="submit" variant="dark" className="w-full" disabled={pending}>
        {pending ? "جاري إنشاء الحساب..." : "إنشاء حساب الإدارة"}
      </Button>
    </form>
  );
}
