import fs from "node:fs";
import path from "node:path";

export type ResolvedConvexDeployment = {
  url: string;
  source: "NEXT_PUBLIC_CONVEX_URL" | "CONVEX_URL" | ".env.local" | ".env";
};

function normalizeUrl(raw: string | undefined) {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const unquoted = trimmed.replace(/^['"]|['"]$/g, "").trim();
  if (!unquoted) return null;
  if (!/^https?:\/\//.test(unquoted)) return null;
  return unquoted;
}

function readEnvValueFromFile(filePath: string, key: string) {
  if (!fs.existsSync(filePath)) return undefined;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const prefix = `${key}=`;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (!line.startsWith(prefix)) continue;
    return line.slice(prefix.length).trim();
  }
  return undefined;
}

function throwMissingConvexUrlError(): never {
  throw new Error(
    'Backend URL is missing. Set `NEXT_PUBLIC_CONVEX_URL` or `CONVEX_URL` (must start with "https://" or "http://").',
  );
}

/**
 * WHY:   Server actions need a deterministic Convex deployment URL regardless of Next runtime env inlining behavior.
 * WHAT:  Resolves and validates the Convex deployment URL from runtime env first, then root env files as fallback.
 * HOW:   Reads `NEXT_PUBLIC_CONVEX_URL`/`CONVEX_URL`, then repo `.env.local`/`.env`, with protocol validation.
 */
export function resolveConvexDeploymentUrl(): ResolvedConvexDeployment {
  const fromPublicEnv = normalizeUrl(process.env.NEXT_PUBLIC_CONVEX_URL);
  if (fromPublicEnv) {
    return { url: fromPublicEnv, source: "NEXT_PUBLIC_CONVEX_URL" };
  }

  const fromServerEnv = normalizeUrl(process.env.CONVEX_URL);
  if (fromServerEnv) {
    return { url: fromServerEnv, source: "CONVEX_URL" };
  }

  const repoRoot = path.resolve(process.cwd(), "../../");
  const fromRootLocalEnv = normalizeUrl(readEnvValueFromFile(path.join(repoRoot, ".env.local"), "CONVEX_URL"));
  if (fromRootLocalEnv) {
    return { url: fromRootLocalEnv, source: ".env.local" };
  }

  const fromRootEnv = normalizeUrl(readEnvValueFromFile(path.join(repoRoot, ".env"), "CONVEX_URL"));
  if (fromRootEnv) {
    return { url: fromRootEnv, source: ".env" };
  }

  throwMissingConvexUrlError();
}
