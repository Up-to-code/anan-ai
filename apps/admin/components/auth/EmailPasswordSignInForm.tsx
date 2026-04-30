"use client";

import { signInWithEmailPassword } from "@anan/auth-client/forms";
import { getEmailPasswordErrorMessage, resolveBrowserCallbackUrl } from "@anan/ui/auth";
import { KeyRound, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Button from "@/components/shared/Button";
import { authClient } from "@/lib/auth-client";

type EmailPasswordSignInFormProps = {
  redirectTo: string;
  className?: string;
};

/**
 * WHY:   Admin access is password-based now, but authorization still comes from the existing admin profile role.
 * WHAT:  Renders the sign-in-only email/password form used by the admin console.
 * HOW:   Calls Better Auth email sign-in, then refreshes server auth state and navigates to a sanitized return target.
 */
export default function EmailPasswordSignInForm({
  redirectTo,
  className,
}: EmailPasswordSignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorMessage(null);

    const { error } = await signInWithEmailPassword(authClient, {
      email: email.trim(),
      password,
      callbackURL: resolveBrowserCallbackUrl(redirectTo),
      rememberMe: true,
    });

    if (error) {
      setPending(false);
      setErrorMessage(getEmailPasswordErrorMessage(
        error,
        "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.",
        "بيانات الدخول غير صحيحة.",
      ));
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form
      className={className}
      onSubmit={handleSubmit}
      data-testid="email-password-signin"
    >
      <div className="space-y-3 text-right">
        <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="admin-email">
          البريد الإلكتروني
        </label>
        <div className="flex h-12 items-center gap-3 border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500">
          <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="admin@anan.sa"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-3 text-right">
        <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500" htmlFor="admin-password">
          كلمة المرور
        </label>
        <div className="flex h-12 items-center gap-3 border border-slate-200 bg-white px-4 shadow-sm focus-within:border-blue-500">
          <KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="••••••••••••"
            dir="ltr"
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="text-right text-xs font-bold leading-6 text-rose-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="dark"
        className="w-full flex items-center justify-center gap-4"
        disabled={pending}
      >
        {pending ? "جاري التحقق..." : "الدخول بالبريد وكلمة المرور"}
      </Button>
    </form>
  );
}
