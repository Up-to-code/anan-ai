import { afterEach, expect, it } from "vitest";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "../_generated/dataModel";
import { createAuthOptions } from "./auth";

const originalSignupFlag = process.env.ANAN_ADMIN_PASSWORD_SIGNUP_ENABLED;
const originalBridgeSecret = process.env.ADMIN_SIGNUP_BRIDGE_SECRET;
const originalAnanWebUrl = process.env.ANAN_WEB_URL;
const originalSiteUrl = process.env.SITE_URL;
const originalVercelEnv = process.env.VERCEL_ENV;
const originalVercelUrl = process.env.VERCEL_URL;

afterEach(() => {
  if (originalSignupFlag === undefined) {
    delete process.env.ANAN_ADMIN_PASSWORD_SIGNUP_ENABLED;
  } else {
    process.env.ANAN_ADMIN_PASSWORD_SIGNUP_ENABLED = originalSignupFlag;
  }
  if (originalBridgeSecret === undefined) {
    delete process.env.ADMIN_SIGNUP_BRIDGE_SECRET;
  } else {
    process.env.ADMIN_SIGNUP_BRIDGE_SECRET = originalBridgeSecret;
  }
  if (originalAnanWebUrl === undefined) {
    delete process.env.ANAN_WEB_URL;
  } else {
    process.env.ANAN_WEB_URL = originalAnanWebUrl;
  }
  if (originalSiteUrl === undefined) {
    delete process.env.SITE_URL;
  } else {
    process.env.SITE_URL = originalSiteUrl;
  }
  if (originalVercelEnv === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = originalVercelEnv;
  }
  if (originalVercelUrl === undefined) {
    delete process.env.VERCEL_URL;
  } else {
    process.env.VERCEL_URL = originalVercelUrl;
  }
});

it("enables email/password auth while disabling sign-up when no trusted bridge is configured", () => {
  delete process.env.ANAN_ADMIN_PASSWORD_SIGNUP_ENABLED;
  delete process.env.ADMIN_SIGNUP_BRIDGE_SECRET;

  const options = createAuthOptions({} as GenericCtx<DataModel>);

  expect(options.emailAndPassword).toMatchObject({
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  });
});

it("allows the trusted admin signup bridge to enable guarded password sign-up", () => {
  process.env.ADMIN_SIGNUP_BRIDGE_SECRET = "bridge-secret";

  const options = createAuthOptions({} as GenericCtx<DataModel>);

  expect(options.emailAndPassword).toMatchObject({
    enabled: true,
    disableSignUp: false,
  });
});

it("redirects OAuth backend errors back to the local web sign-in flow", () => {
  process.env.ANAN_WEB_URL = "http://localhost:3000";
  process.env.VERCEL_ENV = "preview";

  const options = createAuthOptions({} as GenericCtx<DataModel>);

  expect(options.onAPIError?.errorURL).toBe("http://localhost:3000/signin?returnTo=%2Fws");
});

it("redirects OAuth backend errors back to the Vercel web sign-in flow in production", () => {
  process.env.ANAN_WEB_URL = "http://localhost:3000";
  process.env.VERCEL_URL = "anan-lit-web.vercel.app";
  process.env.VERCEL_ENV = "production";

  const options = createAuthOptions({} as GenericCtx<DataModel>);

  expect(options.onAPIError?.errorURL).toBe("https://anan-lit-web.vercel.app/signin?returnTo=%2Fws");
});
