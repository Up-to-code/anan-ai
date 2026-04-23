import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

function parseEnvFile(source) {
  const parsed = {};

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = rawLine.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = rawLine.slice(0, separatorIndex).trim();
    let value = rawLine.slice(separatorIndex + 1).trim();

    if (!key) continue;

    const isQuoted = value.startsWith('"') || value.startsWith("'");
    if (isQuoted) {
      const quote = value[0];
      const closingIndex = value.lastIndexOf(quote);
      value = closingIndex > 0 ? value.slice(1, closingIndex) : value.slice(1);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }

    parsed[key] = value;
  }

  return parsed;
}

const DEFAULT_ENV_PATH = "../../.env.local";
const EXTERNAL_ENV_FILE_VAR = "ANAN_MOBILE_ENV_FILE";

function resolveEnvPath() {
  const explicitEnvPath = process.env[EXTERNAL_ENV_FILE_VAR]?.trim();
  if (!explicitEnvPath) return path.resolve(process.cwd(), DEFAULT_ENV_PATH);

  return path.resolve(explicitEnvPath);
}

function loadMobileEnv() {
  const envPath = resolveEnvPath();
  if (!fs.existsSync(envPath)) {
    if (process.env[EXTERNAL_ENV_FILE_VAR]?.trim()) {
      console.error(`${EXTERNAL_ENV_FILE_VAR} points to a missing file: ${envPath}`);
      process.exit(1);
    }

    return {};
  }

  const parsed = parseEnvFile(fs.readFileSync(envPath, "utf8"));

  if (!parsed.EXPO_PUBLIC_CONVEX_URL && parsed.CONVEX_URL) {
    parsed.EXPO_PUBLIC_CONVEX_URL = parsed.CONVEX_URL;
  }

  if (!parsed.EXPO_PUBLIC_CONVEX_SITE_URL && parsed.CONVEX_SITE_URL) {
    parsed.EXPO_PUBLIC_CONVEX_SITE_URL = parsed.CONVEX_SITE_URL;
  }

  return parsed;
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("withRootEnv.mjs requires a command to run.");
  process.exit(1);
}

const mobileEnv = loadMobileEnv();
const child = spawn(args[0], args.slice(1), {
  stdio: "inherit",
  env: {
    ...mobileEnv,
    ...process.env,
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
