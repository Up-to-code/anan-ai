import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "../_generated/api";
import { DataModel } from "../_generated/dataModel";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";
import { generateRandomString } from "better-auth/crypto";

// The Convex HTTP site URL — where Better Auth routes are mounted.
const convexSiteUrl =
  process.env.CONVEX_SITE_URL ??
  "https://keen-oyster-497.eu-west-1.convex.site";

// The app URL — where the React SPA lives. Used by crossDomain plugin
const appUrl = process.env.SITE_URL ?? "http://localhost:5173";

const trustedOriginsFromEnv = (
  process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? process.env.TRUSTED_ORIGINS ?? ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const trustedOrigins = Array.from(
  new Set([
    convexSiteUrl,
    appUrl,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    ...trustedOriginsFromEnv,
  ]),
);

export const authComponent = createClient<DataModel>(
  components.betterAuth as Parameters<typeof createClient<DataModel>>[0],
  { verbose: false }
);

// Custom plugin to patch the cross-domain OTT missing issue
const customCrossDomainPatch = {
  id: "custom-cross-domain-patch",
  hooks: {
    after: [
      {
        matcher: (ctx: any) => {
          return (ctx.path?.startsWith("/callback") || ctx.path?.startsWith("/oauth2/callback"));
        },
        handler: async (ctx: any) => {
          try {
            const setCookie = ctx.context.responseHeaders?.get("set-cookie");
            const redirectTo = ctx.context.responseHeaders?.get("location");
            if (!setCookie || !redirectTo) {
              return;
            }

            // Extract the session token from the cookie boundary if it exists
            const match = setCookie.match(/session_token=([^;]+)/);
            if (!match) {
              return;
            }
            const sessionToken = match[1];

            const token = generateRandomString(32);
            const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

            await ctx.context.internalAdapter.createVerificationValue({
              value: sessionToken,
              identifier: `one-time-token:${token}`,
              expiresAt,
            });

            const url = new URL(redirectTo);
            url.searchParams.set("ott", token);
            ctx.context.responseHeaders.set("location", url.toString());
          } catch (e) {
            console.error("OTT patch error", e);
          }
        }
      }
    ]
  }
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: convexSiteUrl,
    trustedOrigins,
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          returned: true, // Include in session responses
        },
      },
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
      },
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    },
    plugins: [
      customCrossDomainPatch,
      crossDomain({ siteUrl: appUrl }),
      convex({ authConfig })
    ],
  });
};
