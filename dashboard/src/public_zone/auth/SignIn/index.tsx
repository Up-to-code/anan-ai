import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession, signIn } from "@/_core/lib/auth-client";
import { useRole } from "@/_core/hooks/useRole";
import { getRedirectPathByRole, isPathAllowedForRole } from "@/_core/lib/redirectByRole";
import { Button } from "@/public_zone/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { defaultAuthConfig } from "@/_core/config/authContent";
import { useLocale } from "@/shared_logic/i18n/useLocale";
/**
 * WHY:   Acts as the primary entry point for all users (Brokers, RED, Customers).
 * WHAT:  Renders an OAuth login page featuring a dynamic visual side scaling by environment.
 * HOW:   Designed as an Orchestrator. Relies on `signIn.social` from `auth-client` and handles post-auth redirects.
 */
export default function SignIn() {
  const { data: session, isPending } = useSession();
  const role = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { localizePath } = useLocale();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const defaultPath = localizePath(getRedirectPathByRole(role));

  // Check for a stored redirect from before OAuth
  const storedRedirect = typeof window !== "undefined"
    ? localStorage.getItem("anan_auth_redirect")
    : null;

  let targetPath =
    storedRedirect ??
    (from && role && isPathAllowedForRole(from, role) ? from : defaultPath);

  useEffect(() => {
    if (session?.user && !isPending) {
      // Clear stored redirect
      localStorage.removeItem("anan_auth_redirect");
      navigate(targetPath, { replace: true });
    }
  }, [session, isPending, navigate, targetPath]);

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      // Store the intended destination so it survives the OAuth redirect round-trip
      localStorage.setItem("anan_auth_redirect", targetPath);
      // Always use the configured app URL to avoid port mismatch issues
      const appOrigin = import.meta.env.VITE_APP_URL ?? window.location.origin;
      // IMPORTANT: redirect back to /signin (unprotected) so the cross-domain
      // token exchange can complete before any RequireAuth guard fires
      const callbackURL = `${appOrigin}${localizePath("/signin")}`;
      const res = await signIn.social({ provider: "google", callbackURL });
      if (res?.error) {
        toast.error("Authentication failed", {
          description: res.error.message || "Could not sign in with Google.",
        });
        localStorage.removeItem("anan_auth_redirect");
        setIsAuthenticating(false);
      }
      // If successful, the page will redirect
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Connection Error", {
        description: "Failed to connect to the authentication server.",
      });
      localStorage.removeItem("anan_auth_redirect");
      setIsAuthenticating(false);
    }
  };

  const config = defaultAuthConfig;

  return (
    <div className="flex min-h-screen items-stretch bg-white">
      {/* Visual Side (Left on Desktop) */}
      <div className="hidden lg:flex flex-1 bg-slate-950 items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-orange-600 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg space-y-12">
          <div className="space-y-6 text-right">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              {config.visualSide.title.main} <br />
              <span className="text-blue-500">{config.visualSide.title.highlight}</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              {config.visualSide.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {config.visualSide.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
                <span className="text-white text-sm font-medium flex-1 text-right">{feature.label}</span>
                <div className={`h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center ${feature.colorClass}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Code/Grid Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 relative">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-10 opacity-50" />

        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-3 text-right">
            <div className="inline-block p-2.5 rounded-xl bg-slate-900 text-white mb-4">
              <span className="text-[10px] font-bold tracking-widest uppercase px-1">{config.formSide.badge}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{config.formSide.title}</h1>
            <p className="text-slate-500 text-base">{config.formSide.description}</p>
          </div>

          <div className="space-y-4">
            <Button
              className="w-full h-14 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all font-bold flex items-center justify-center gap-4 shadow-xl shadow-slate-200/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleGoogleSignIn}
              disabled={isPending || isAuthenticating}
            >
              {isAuthenticating ? (
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>
                {isAuthenticating ? "Connecting..." : config.formSide.googleButtonText}
              </span>
            </Button>
          </div>

          <div className="pt-8 text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">{config.formSide.footer.trustBadge}</span></div>
            </div>

            <p className="text-xs text-slate-400 px-6 leading-relaxed">
              {config.formSide.footer.text} <a href="#" className="underline hover:text-slate-600">{config.formSide.footer.termsText}</a> و <a href="#" className="underline hover:text-slate-600">{config.formSide.footer.privacyText}</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
