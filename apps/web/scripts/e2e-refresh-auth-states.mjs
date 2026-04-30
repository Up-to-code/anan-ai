import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const requiredPersonas = [
  "no-org",
  "broker-manager",
  "developer-manager",
  "invitee",
  "multi-org-manager",
];

const optionalPersonas = [
  "broker-onboarding",
  "developer-onboarding",
];

function personaEnvPrefix(persona) {
  return `E2E_PERSONA_${persona.replaceAll("-", "_").toUpperCase()}`;
}

function isPersonaConfigured(persona) {
  const prefix = personaEnvPrefix(persona);
  return Boolean(process.env[`${prefix}_EMAIL`]?.trim() && process.env[`${prefix}_PASSWORD`]?.trim());
}

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

async function refreshPersona(baseUrl, secret, persona) {
  const response = await fetch(`${baseUrl}/api/e2e/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-e2e-secret": secret,
    },
    body: JSON.stringify({
      persona,
      namespace: `e2e-state-${Date.now().toString(36)}`,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.storageState) {
    throw new Error(`${persona} auth refresh failed: ${payload?.message ?? response.statusText}`);
  }
  return payload.storageState;
}

async function main() {
  const baseUrl = (process.env.E2E_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000").replace(/\/$/u, "");
  const secret = readRequiredEnv("E2E_SHARED_SECRET");
  const outputDir = resolve(process.cwd(), "test-results/.auth");
  const personas = [
    ...requiredPersonas,
    ...optionalPersonas.filter(isPersonaConfigured),
  ];
  await mkdir(outputDir, { recursive: true });

  for (const persona of personas) {
    const state = await refreshPersona(baseUrl, secret, persona);
    const path = resolve(outputDir, `${persona}.json`);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
    console.log(`wrote ${path}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
