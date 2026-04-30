import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import {
  betterAuth,
  type BetterAuthOptions,
  type BetterAuthPlugin,
} from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP, organization } from "better-auth/plugins";
import { createAnanOAuthProviderPlugin } from "@anan/auth/server/oauth-provider";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import {
  buildAuthErrorRedirectUrl,
  isLoopbackOrigin,
  isProductionLikeEnv,
  normalizeBaseUrl,
  resolveAppRedirectBaseUrl,
  resolveAllowedOrigins,
} from "../_core/security/authRedirects";
import authConfig from "../auth.config";
import schema from "./schema";

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function readCsvEnv(name: string) {
  return (readOptionalEnv(name) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getWebAppBaseUrl() {
  return resolveAppRedirectBaseUrl({
    ananWebUrl: process.env.ANAN_WEB_URL,
    siteUrl: process.env.SITE_URL,
    nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelUrl: process.env.VERCEL_URL,
    fallbackOrigin: process.env.BETTER_AUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });
}

function getAuthBaseUrl() {
  const isProduction = process.env.VERCEL_ENV === "production";
  const candidates = [
    process.env.SITE_URL,
    process.env.ANAN_WEB_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.BETTER_AUTH_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (!normalized) {
      continue;
    }

    if (isProduction && isLoopbackOrigin(normalized)) {
      continue;
    }

    return normalized;
  }

  return undefined;
}

function getTrustedOrigins() {
  const webAppBaseUrl = getWebAppBaseUrl();
  const allowedOrigins = resolveAllowedOrigins({
    webBaseUrl: webAppBaseUrl ?? getAuthBaseUrl() ?? null,
    allowedOriginsEnv: [
      ...readCsvEnv("ANAN_AUTH_ALLOWED_ORIGINS"),
      ...readCsvEnv("BETTER_AUTH_TRUSTED_ORIGINS"),
    ].join(","),
    extraOrigins: [
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
      process.env.BETTER_AUTH_URL,
    ],
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });

  return allowedOrigins;
}

function getAuthErrorUrl() {
  const webAppBaseUrl = getWebAppBaseUrl();
  if (!webAppBaseUrl) return undefined;
  return buildAuthErrorRedirectUrl(webAppBaseUrl, { returnTo: "/ws" });
}

function getOAuthConsentPage() {
  return process.env.ANAN_OAUTH_CONSENT_PAGE?.trim() || "/oauth/authorize";
}

function getOAuthLoginPage() {
  return process.env.ANAN_OAUTH_LOGIN_PAGE?.trim() || "/signin";
}

function buildSocialProviders() {
  const googleClientId = readOptionalEnv("GOOGLE_CLIENT_ID");
  const googleClientSecret = readOptionalEnv("GOOGLE_CLIENT_SECRET");
  const appleClientId = readOptionalEnv("APPLE_CLIENT_ID");
  const appleClientSecret = readOptionalEnv("APPLE_CLIENT_SECRET");

  return {
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),
    ...(appleClientId && appleClientSecret
      ? {
          apple: {
            clientId: appleClientId,
            clientSecret: appleClientSecret,
          },
        }
      : {}),
  } satisfies BetterAuthOptions["socialProviders"];
}

function isPasswordSignUpEnabled() {
  return Boolean(
    readOptionalEnv("ADMIN_SIGNUP_BRIDGE_SECRET")
      || readOptionalEnv("ANAN_ADMIN_PASSWORD_SIGNUP_ENABLED"),
  );
}

function passwordSignupGatePlugin(): BetterAuthPlugin {
  return {
    id: "anan-password-signup-gate",
    hooks: {
      before: [
        {
          matcher: (context) => context.path === "/sign-up/email",
          handler: createAuthMiddleware(async (ctx) => {
            const adminExpected = readOptionalEnv("ADMIN_SIGNUP_BRIDGE_SECRET");
            const adminProvided = ctx.headers?.get("x-anan-admin-signup-secret");
            const allowPublicPasswordSignup = Boolean(readOptionalEnv("ANAN_ADMIN_PASSWORD_SIGNUP_ENABLED"));

            if (allowPublicPasswordSignup && !adminExpected) {
              return;
            }

            if (adminExpected && adminProvided === adminExpected) {
              return;
            }

            throw new APIError("FORBIDDEN", {
              message: "Password signup requires a trusted signup flow.",
            });
          }),
        },
      ],
    },
  };
}

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    appName: "Anan",
    baseURL: getAuthBaseUrl(),
    onAPIError: {
      errorURL: getAuthErrorUrl(),
    },
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: getTrustedOrigins(),
    database: authComponent.adapter(ctx),
    socialProviders: buildSocialProviders(),
    emailAndPassword: {
      enabled: true,
      disableSignUp: !isPasswordSignUpEnabled(),
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    plugins: [
      organization({
        creatorRole: "owner",
        allowUserToCreateOrganization: true,
      }),
      emailOTP({
        async sendVerificationOTP() {
          throw new Error("Email OTP delivery is not configured for this Anan deployment.");
        },
      }),
      createAnanOAuthProviderPlugin({
        issuer: getAuthBaseUrl(),
        loginPage: getOAuthLoginPage(),
        consentPage: getOAuthConsentPage(),
        allowDynamicClientRegistration: Boolean(readOptionalEnv("ANAN_OIDC_DYNAMIC_CLIENT_REGISTRATION")),
      }) as BetterAuthPlugin,
      passwordSignupGatePlugin(),
      convex({ authConfig }),
    ],
  }) satisfies BetterAuthOptions;

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
