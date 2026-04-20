import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { Platform } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { resolvePostAuthRoute, resolvePostGuestRoute } from "@/lib/mobileAuthRouting";
import { emptyBuyerLocalState, saveBuyerLocalState } from "@/lib/mobileBuyerAccount";
import type { MobileAuthEmailStep, MobileAuthReturnTarget } from "@/types/mobile";

void WebBrowser.maybeCompleteAuthSession();

/**
 * WHY:   Mobile auth needs one place to coordinate Better Auth state, guest-mode continuity, and route decisions.
 * WHAT:  Exposes buyer auth actions for OAuth, email code, guest skip, and sign-out.
 * HOW:   Wraps Better Auth client APIs with app-specific routing, Arabic-friendly error messages, and guest persistence.
 */
export function useBuyerAuth() {
  const account = useBuyerAccount();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const emailStep = useMemo<MobileAuthEmailStep>(() => (pendingEmail ? "verify" : "idle"), [pendingEmail]);
  const isBusy = oauthLoading !== null || isEmailLoading;

  function clearError() {
    setErrorMessage(null);
  }

  function formatError(error: unknown, fallback: string) {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
      return error.message.trim() || fallback;
    }
    return fallback;
  }

  function getPostAuthPath(returnTo?: MobileAuthReturnTarget | null) {
    return resolvePostAuthRoute({
      returnTo,
      isOnboardingComplete: account.isOnboardingComplete,
    });
  }

  function getPostGuestPath(): "/" {
    return resolvePostGuestRoute(account.isOnboardingComplete);
  }

  async function finalizeAuthenticatedSession(returnTo?: MobileAuthReturnTarget | null) {
    await account.promoteGuestStateAfterAuth();
    await account.dismissAuthEntry();
    return getPostAuthPath(returnTo);
  }

  async function startSocialSignIn(provider: "google" | "apple", returnTo?: MobileAuthReturnTarget | null) {
    clearError();
    setOauthLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: getPostAuthPath(returnTo),
      } as never);
      if (error) {
        throw error;
      }
      return getPostAuthPath(returnTo);
    } catch (error) {
      setErrorMessage(formatError(error, provider === "google" ? "Google غير متاح حالياً في إعدادات هذا التطبيق." : "Apple غير متاح حالياً في إعدادات هذا التطبيق."));
      return null;
    } finally {
      setOauthLoading(null);
    }
  }

  async function requestEmailCode(emailAddress: string) {
    clearError();

    const normalizedEmail = emailAddress.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage("أدخل بريدك الإلكتروني للمتابعة.");
      return false;
    }

    setIsEmailLoading(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "sign-in",
      });
      if (error) {
        throw error;
      }
      setPendingEmail(normalizedEmail);
      return true;
    } catch (error) {
      setErrorMessage(formatError(error, "تسجيل الدخول بالبريد غير مفعّل بعد في هذا التطبيق."));
      return false;
    } finally {
      setIsEmailLoading(false);
    }
  }

  async function resendEmailCode() {
    if (!pendingEmail) {
      setErrorMessage("أعد إدخال بريدك الإلكتروني أولاً.");
      return false;
    }
    return requestEmailCode(pendingEmail);
  }

  async function verifyEmailCode({
    code,
    returnTo,
  }: {
    code: string;
    returnTo?: MobileAuthReturnTarget | null;
  }) {
    clearError();

    if (!pendingEmail) {
      setErrorMessage("أعد إدخال بريدك الإلكتروني أولاً.");
      return { status: "error" as const, nextPath: null };
    }

    setIsEmailLoading(true);
    try {
      const { error } = await authClient.signIn.emailOtp({
        email: pendingEmail,
        otp: code.trim(),
      });
      if (error) {
        throw error;
      }
      setPendingEmail(null);
      const nextPath = await finalizeAuthenticatedSession(returnTo);
      return { status: "complete" as const, nextPath };
    } catch (error) {
      setErrorMessage(formatError(error, "الرمز غير صحيح أو انتهت صلاحيته."));
      return { status: "error" as const, nextPath: null };
    } finally {
      setIsEmailLoading(false);
    }
  }

  async function completeTransferredSignUp(_args?: {
    legalAccepted?: boolean;
    returnTo?: MobileAuthReturnTarget | null;
  }) {
    return { status: "complete" as const, nextPath: null };
  }

  async function startOver() {
    clearError();
    setPendingEmail(null);
  }

  async function continueAsGuest() {
    clearError();
    await account.dismissAuthEntry();
    return getPostGuestPath();
  }

  async function signOutToGuest() {
    clearError();

    try {
      await authClient.signOut();
      await account.resetLocalBuyerState();
      await saveBuyerLocalState({
        ...emptyBuyerLocalState(),
        preferences: {
          ...emptyBuyerLocalState().preferences,
          authEntryDismissedAt: Date.now(),
        },
      });
      return getPostGuestPath();
    } catch (error) {
      setErrorMessage(formatError(error, "تعذر تسجيل الخروج الآن."));
      return null;
    }
  }

  return {
    account,
    isLoaded: !isSessionPending,
    isAuthenticated: Boolean(session?.session),
    isAppleAvailable: Platform.OS === "ios",
    user: session?.user ?? null,
    emailStep,
    errorMessage,
    isBusy,
    isGoogleLoading: oauthLoading === "google",
    isAppleLoading: oauthLoading === "apple",
    missingProfileFields: [] as string[],
    clearError,
    getPostAuthPath,
    getPostGuestPath,
    startGoogleSignIn: (returnTo?: MobileAuthReturnTarget | null) => startSocialSignIn("google", returnTo),
    startAppleSignIn: (returnTo?: MobileAuthReturnTarget | null) => startSocialSignIn("apple", returnTo),
    requestEmailCode,
    resendEmailCode,
    verifyEmailCode,
    completeTransferredSignUp,
    startOver,
    continueAsGuest,
    signOutToGuest,
  };
}
