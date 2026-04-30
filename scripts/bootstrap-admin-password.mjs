#!/usr/bin/env node

import { spawnSync } from "node:child_process";

function readEnv(name) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function requireEnv(name) {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function assertStrongPassword(password) {
  const checks = [
    password.length >= 12,
    /[a-z]/u.test(password),
    /[A-Z]/u.test(password),
    /\d/u.test(password),
    /[^A-Za-z0-9]/u.test(password),
  ];
  if (!checks.every(Boolean)) {
    throw new Error("ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters and include lowercase, uppercase, number, and symbol characters.");
  }
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/u, "");
}

function isExistingAccountError(status, body) {
  const text = JSON.stringify(body).toLowerCase();
  return status === 409 || text.includes("already") || text.includes("exists");
}

async function createOrLinkBetterAuthUser(args) {
  const response = await fetch(`${args.convexSiteUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-anan-admin-signup-secret": args.bridgeSecret,
    },
    body: JSON.stringify({
      email: args.email,
      password: args.password,
      name: args.name,
    }),
  });
  const body = await response.json().catch(() => ({}));

  if (response.ok || isExistingAccountError(response.status, body)) {
    return {
      accountCreated: response.ok,
      accountAlreadyExisted: !response.ok,
    };
  }

  throw new Error(
    `Better Auth sign-up failed (${response.status}). Temporarily set ANAN_ADMIN_PASSWORD_SIGNUP_ENABLED=true on the Convex deployment, then retry. ${JSON.stringify(body)}`,
  );
}

function ensureAdminProfile(args) {
  const mutationArgs = JSON.stringify({
    secret: args.secret,
    email: args.email,
    name: args.name,
  });
  const result = spawnSync("npx", [
    "convex",
    "run",
    "admin_zone/bootstrapPasswordAdmin:ensureAdminPasswordProfile",
    mutationArgs,
  ], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(`Convex profile bootstrap failed.\n${result.stderr || result.stdout}`);
  }

  return result.stdout.trim();
}

async function main() {
  const email = requireEnv("ADMIN_BOOTSTRAP_EMAIL").toLowerCase();
  const password = requireEnv("ADMIN_BOOTSTRAP_PASSWORD");
  const secret = requireEnv("ADMIN_BOOTSTRAP_SECRET");
  const bridgeSecret = requireEnv("ADMIN_SIGNUP_BRIDGE_SECRET");
  const name = readEnv("ADMIN_BOOTSTRAP_NAME") ?? email.split("@")[0];
  const convexSiteUrl = normalizeBaseUrl(
    readEnv("NEXT_PUBLIC_CONVEX_SITE_URL") ?? readEnv("CONVEX_SITE_URL") ?? "http://localhost:3211",
  );

  assertStrongPassword(password);

  const authResult = await createOrLinkBetterAuthUser({
    convexSiteUrl,
    email,
    password,
    name,
    bridgeSecret,
  });
  const profileResult = ensureAdminProfile({
    secret,
    email,
    name,
  });

  console.log(JSON.stringify({
    ok: true,
    convexSiteUrl,
    email,
    ...authResult,
    profile: profileResult,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
