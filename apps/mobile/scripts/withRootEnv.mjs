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

function loadRootEnv() {
  const rootEnvPath = path.resolve(process.cwd(), "../../.env.local");
  if (!fs.existsSync(rootEnvPath)) return {};
  const parsed = parseEnvFile(fs.readFileSync(rootEnvPath, "utf8"));

  if (!parsed.EXPO_PUBLIC_CONVEX_URL && parsed.CONVEX_URL) {
    parsed.EXPO_PUBLIC_CONVEX_URL = parsed.CONVEX_URL;
  }

  if (!parsed.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY && parsed.CLERK_PUBLISHABLE_KEY) {
    parsed.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = parsed.CLERK_PUBLISHABLE_KEY;
  }

  return parsed;
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("withRootEnv.mjs requires a command to run.");
  process.exit(1);
}

const rootEnv = loadRootEnv();
const child = spawn(args[0], args.slice(1), {
  stdio: "inherit",
  env: {
    ...rootEnv,
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
