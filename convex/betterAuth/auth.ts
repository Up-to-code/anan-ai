import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { expo } from "@better-auth/expo";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { emailOTP, organization } from "better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import {
  isLoopbackOrigin,
  isProductionLikeEnv,
  normalizeBaseUrl,
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

function getAuthBaseUrl() {
  const isProduction = isProductionLikeEnv(process.env.NODE_ENV, process.env.VERCEL_ENV);
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
  const allowedOrigins = resolveAllowedOrigins({
    webBaseUrl: getAuthBaseUrl() ?? null,
    allowedOriginsEnv: [
      ...readCsvEnv("ANAN_AUTH_ALLOWED_ORIGINS"),
      ...readCsvEnv("BETTER_AUTH_TRUSTED_ORIGINS"),
    ].join(","),
    extraOrigins: [
      process.env.EXPO_PUBLIC_CLIENT_WEB_URL,
      process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
      process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
      process.env.BETTER_AUTH_URL,
    ],
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });

  return [...allowedOrigins, "anan://", "exp://"];
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
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: getTrustedOrigins(),
    database: authComponent.adapter(ctx),
    socialProviders: buildSocialProviders(),
    plugins: [
      expo(),
      organization({
        creatorRole: "owner",
        allowUserToCreateOrganization: true,
      }),
      emailOTP({
        async sendVerificationOTP() {
          throw new Error("Email OTP delivery is not configured for this Anan deployment.");
        },
      }),
      convex({ authConfig }),
    ],
  }) satisfies BetterAuthOptions;

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
