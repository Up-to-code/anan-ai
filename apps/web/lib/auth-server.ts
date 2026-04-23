import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import type { Preloaded } from "convex/react";
import type { FunctionReference, FunctionReturnType } from "convex/server";
import {
  isLoopbackOrigin,
  isProductionLikeEnv,
  normalizeBaseUrl,
} from "../../../convex/_core/security/authRedirects";

const LOCAL_CONVEX_URL = "http://localhost:3210";
const LOCAL_CONVEX_SITE_URL = "http://localhost:3211";

type AuthBridgeConfig = {
  convexUrl: string;
  convexSiteUrl: string;
  isConfigured: boolean;
};

type AuthConfigurationError = Error & {
  code: "AUTH_CONFIGURATION_ERROR";
  status: 503;
};

type EmptyObject = Record<string, never>;

type OptionalArgs<FuncRef extends FunctionReference<any, any>> =
  FuncRef["_args"] extends EmptyObject ? [args?: EmptyObject] : [args: FuncRef["_args"]];

function normalizeUrl(value?: string | null) {
  const normalized = normalizeBaseUrl(value);
  return normalized ? normalized.replace(/\/$/u, "") : null;
}

function deriveConvexSiteUrl(convexUrl: string | null) {
  if (!convexUrl) {
    return null;
  }

  try {
    const parsed = new URL(convexUrl);
    if (!parsed.hostname.endsWith(".convex.cloud")) {
      return null;
    }
    parsed.hostname = parsed.hostname.replace(/\.convex\.cloud$/u, ".convex.site");
    return parsed.toString().replace(/\/$/u, "");
  } catch {
    return null;
  }
}

function resolveHostedUrl(
  values: Array<string | null | undefined>,
  isProduction: boolean,
) {
  for (const value of values) {
    const normalized = normalizeUrl(value);
    if (!normalized) {
      continue;
    }

    if (isProduction && isLoopbackOrigin(normalized)) {
      continue;
    }

    return normalized;
  }

  return null;
}

/**
 * WHY:   The Next auth bridge must use hosted Convex URLs in production and only use localhost during local development.
 * WHAT:  Resolves the Convex cloud/site URLs used by the Better Auth Next.js adapter.
 * HOW:   Prefers explicit env vars, ignores loopback URLs in production, derives `.convex.site` when needed, and only falls back locally.
 */
export function resolveAuthBridgeConfig(env: Record<string, string | undefined> = process.env): AuthBridgeConfig {
  const isProduction = isProductionLikeEnv(env.NODE_ENV, env.VERCEL_ENV);
  const convexUrl =
    resolveHostedUrl([env.CONVEX_URL, env.NEXT_PUBLIC_CONVEX_URL], isProduction)
    ?? (!isProduction ? LOCAL_CONVEX_URL : null);
  const explicitConvexSiteUrl = resolveHostedUrl(
    [env.CONVEX_SITE_URL, env.NEXT_PUBLIC_CONVEX_SITE_URL],
    isProduction,
  );
  const convexSiteUrl =
    explicitConvexSiteUrl
    ?? deriveConvexSiteUrl(convexUrl)
    ?? (!isProduction ? LOCAL_CONVEX_SITE_URL : null);

  if (!convexUrl || !convexSiteUrl) {
    return {
      convexUrl: LOCAL_CONVEX_URL,
      convexSiteUrl: LOCAL_CONVEX_SITE_URL,
      isConfigured: false,
    };
  }

  return {
    convexUrl,
    convexSiteUrl,
    isConfigured: true,
  };
}

function createAuthConfigurationError(): AuthConfigurationError {
  const error = new Error(
    "Production auth bridge is missing hosted Convex auth URLs. Set NEXT_PUBLIC_CONVEX_URL and CONVEX_SITE_URL or NEXT_PUBLIC_CONVEX_SITE_URL.",
  ) as AuthConfigurationError;
  error.code = "AUTH_CONFIGURATION_ERROR";
  error.status = 503;
  return error;
}

function createConfiguredBridge(env: Record<string, string | undefined> = process.env) {
  const config = resolveAuthBridgeConfig(env);
  const bridge = convexBetterAuthNextJs({
    convexUrl: config.convexUrl,
    convexSiteUrl: config.convexSiteUrl,
  });

  return { bridge, config };
}

const configuredBridge = createConfiguredBridge();

function ensureAuthBridgeConfigured() {
  if (!configuredBridge.config.isConfigured) {
    throw createAuthConfigurationError();
  }
}

type AuthHandler = typeof configuredBridge.bridge.handler;

export const handler: AuthHandler = {
  GET: (...args) => {
    ensureAuthBridgeConfigured();
    return configuredBridge.bridge.handler.GET(...args);
  },
  POST: (...args) => {
    ensureAuthBridgeConfigured();
    return configuredBridge.bridge.handler.POST(...args);
  },
};

/**
 * WHY:   Server components and route handlers need consistent auth token access without inheriting unsafe localhost fallbacks.
 * WHAT:  Exposes the Better Auth Next.js bridge helpers guarded by production config validation.
 * HOW:   Validates hosted Convex URLs once, then forwards to the underlying bridge only when configuration is safe.
 */
export async function getToken(...args: Parameters<typeof configuredBridge.bridge.getToken>) {
  ensureAuthBridgeConfigured();
  return configuredBridge.bridge.getToken(...args);
}

export async function preloadAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<Preloaded<Query>> {
  ensureAuthBridgeConfigured();
  return configuredBridge.bridge.preloadAuthQuery(query, ...args);
}

export async function isAuthenticated(
  ...args: Parameters<typeof configuredBridge.bridge.isAuthenticated>
) {
  ensureAuthBridgeConfigured();
  return configuredBridge.bridge.isAuthenticated(...args);
}

export async function fetchAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalArgs<Query>
): Promise<FunctionReturnType<Query>> {
  ensureAuthBridgeConfigured();
  return configuredBridge.bridge.fetchAuthQuery(query, ...args);
}

export async function fetchAuthMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  ...args: OptionalArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  ensureAuthBridgeConfigured();
  return configuredBridge.bridge.fetchAuthMutation(mutation, ...args);
}

export async function fetchAuthAction<Action extends FunctionReference<"action">>(
  action: Action,
  ...args: OptionalArgs<Action>
): Promise<FunctionReturnType<Action>> {
  ensureAuthBridgeConfigured();
  return configuredBridge.bridge.fetchAuthAction(action, ...args);
}
