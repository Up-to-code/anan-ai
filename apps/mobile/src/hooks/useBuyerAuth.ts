import { useAuth, useClerk, useSignIn, useSignUp, useSSO, useUser, isClerkAPIResponseError } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import { useMemo, useState } from "react";
import { Platform } from "react-native";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { resolvePostAuthRoute, resolvePostGuestRoute } from "@/lib/mobileAuthRouting";
import { emptyBuyerLocalState, saveBuyerLocalState } from "@/lib/mobileBuyerAccount";
import type { MobileAuthEmailStep, MobileAuthReturnTarget } from "@/types/mobile";

void WebBrowser.maybeCompleteAuthSession();

/**
 * WHY:   Mobile auth now needs one place to coordinate Clerk state, guest-mode continuity, and route decisions.
 * WHAT:  Exposes buyer auth actions for OAuth, email code, guest skip, and sign-out.
 * HOW:   Wraps Clerk custom-flow APIs with app-specific routing, Arabic-friendly error messages, and guest dismissal persistence.
 */
export function useBuyerAuth() {
  const account = useBuyerAccount();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const { startSSOFlow } = useSSO();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  const emailStep = useMemo<MobileAuthEmailStep>(() => {
    if (signUp.status === "missing_requirements") {
      return "complete_profile";
    }
    if (signIn.status === "needs_first_factor") {
      return "verify";
    }
    return "idle";
  }, [signIn.status, signUp.status]);

  const isBusy = oauthLoading !== null || signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";
  const missingProfileFields = signUp.missingFields ?? [];

  function clearError() {
    setErrorMessage(null);
  }

  function formatError(error: unknown, fallback: string) {
    if (isClerkAPIResponseError(error)) {
      const nextMessage = error.errors[0]?.longMessage || error.errors[0]?.message;
      if (nextMessage?.trim()) {
        return nextMessage.trim();
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
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

  async function activateSession(sessionId: string, returnTo?: MobileAuthReturnTarget | null) {
    await clerk.setActive({ session: sessionId });
    return finalizeAuthenticatedSession(returnTo);
  }

  async function startGoogleSignIn(returnTo?: MobileAuthReturnTarget | null) {
    clearError();
    setOauthLoading("google");

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (!createdSessionId) {
        throw new Error("لم يكتمل تسجيل الدخول عبر Google. حاول مرة أخرى.");
      }

      if (setActive) {
        await setActive({ session: createdSessionId });
        await finalizeAuthenticatedSession(returnTo);
      } else {
        await activateSession(createdSessionId, returnTo);
      }

      return getPostAuthPath(returnTo);
    } catch (error) {
      setErrorMessage(formatError(error, "Google غير متاح حالياً في إعدادات هذا التطبيق."));
      return null;
    } finally {
      setOauthLoading(null);
    }
  }

  async function startAppleSignIn(returnTo?: MobileAuthReturnTarget | null) {
    clearError();
    setOauthLoading("apple");

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_apple",
      });

      if (!createdSessionId) {
        throw new Error("لم يكتمل تسجيل الدخول عبر Apple. حاول مرة أخرى.");
      }

      if (setActive) {
        await setActive({ session: createdSessionId });
        await finalizeAuthenticatedSession(returnTo);
      } else {
        await activateSession(createdSessionId, returnTo);
      }

      return getPostAuthPath(returnTo);
    } catch (error) {
      setErrorMessage(formatError(error, "Apple غير متاح حالياً في إعدادات هذا التطبيق."));
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

    try {
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
        signUpIfMissing: true,
      } as Parameters<typeof signIn.create>[0]);

      if (createError) {
        throw createError;
      }

      const { error: sendError } = await signIn.emailCode.sendCode();
      if (sendError) {
        throw sendError;
      }

      return true;
    } catch (error) {
      setErrorMessage(formatError(error, "تعذر إرسال رمز التحقق بالبريد الإلكتروني حالياً."));
      return false;
    }
  }

  async function resendEmailCode() {
    clearError();

    try {
      const { error } = await signIn.emailCode.sendCode();
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      setErrorMessage(formatError(error, "تعذر إعادة إرسال الرمز الآن."));
      return false;
    }
  }

  async function verifyEmailCode({
    code,
    returnTo,
  }: {
    code: string;
    returnTo?: MobileAuthReturnTarget | null;
  }) {
    clearError();

    try {
      const { error } = await signIn.emailCode.verifyCode({ code: code.trim() });
      if (error) {
        if (isClerkAPIResponseError(error) && error.errors[0]?.code === "sign_up_if_missing_transfer") {
          const transfer = await signUp.create({ transfer: true });
          if (transfer.error) {
            throw transfer.error;
          }

          if (signUp.status === "complete" && signUp.createdSessionId) {
            const nextPath = await activateSession(signUp.createdSessionId, returnTo);
            return { status: "complete" as const, nextPath };
          }

          if (signUp.status === "missing_requirements") {
            return { status: "needs_profile" as const, nextPath: null };
          }
        }

        throw error;
      }

      if (signIn.status === "complete" && signIn.createdSessionId) {
        const nextPath = await activateSession(signIn.createdSessionId, returnTo);
        return { status: "complete" as const, nextPath };
      }

      if (signIn.status === "needs_client_trust") {
        setErrorMessage("يلزم تحقق إضافي قبل إكمال الجلسة. راجع إعدادات Clerk لهذا الأسلوب.");
        return { status: "blocked" as const, nextPath: null };
      }

      return { status: "pending" as const, nextPath: null };
    } catch (error) {
      setErrorMessage(formatError(error, "الرمز غير صحيح أو انتهت صلاحيته."));
      return { status: "error" as const, nextPath: null };
    }
  }

  async function completeTransferredSignUp({
    legalAccepted,
    returnTo,
  }: {
    legalAccepted?: boolean;
    returnTo?: MobileAuthReturnTarget | null;
  }) {
    clearError();

    try {
      const payload =
        missingProfileFields.includes("legal_accepted") && legalAccepted
          ? { legalAccepted: true }
          : {};
      const { error } = await signUp.update(payload);
      if (error) {
        throw error;
      }

      if (signUp.status === "complete" && signUp.createdSessionId) {
        const nextPath = await activateSession(signUp.createdSessionId, returnTo);
        return { status: "complete" as const, nextPath };
      }

      if (signUp.status === "missing_requirements") {
        setErrorMessage("ما زالت هناك بيانات مطلوبة لإكمال إنشاء الحساب.");
        return { status: "needs_profile" as const, nextPath: null };
      }

      return { status: "pending" as const, nextPath: null };
    } catch (error) {
      setErrorMessage(formatError(error, "تعذر إكمال إنشاء الحساب الآن."));
      return { status: "error" as const, nextPath: null };
    }
  }

  async function startOver() {
    clearError();
    await Promise.all([signIn.reset(), signUp.reset()]);
  }

  async function continueAsGuest() {
    clearError();
    await account.dismissAuthEntry();
    return getPostGuestPath();
  }

  async function signOutToGuest() {
    clearError();

    try {
      await clerk.signOut();
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
    isLoaded,
    isAuthenticated: Boolean(isSignedIn),
    isAppleAvailable: Platform.OS === "ios",
    user,
    emailStep,
    errorMessage,
    isBusy,
    isGoogleLoading: oauthLoading === "google",
    isAppleLoading: oauthLoading === "apple",
    missingProfileFields,
    clearError,
    getPostAuthPath,
    getPostGuestPath,
    startGoogleSignIn,
    startAppleSignIn,
    requestEmailCode,
    resendEmailCode,
    verifyEmailCode,
    completeTransferredSignUp,
    startOver,
    continueAsGuest,
    signOutToGuest,
  };
}
