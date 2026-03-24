#!/usr/bin/env node
/**
 * Repo gates: deterministic checks we expect to stay green.
 *
 * Runs:
 * - pnpm typecheck
 * - pnpm test:once
 * - node scripts/audit/analyze.mjs
 */

import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const pretty = [cmd, ...args].join(" ");
  process.stdout.write(`\n[gates] $ ${pretty}\n`);
  const res = spawnSync(cmd, args, { stdio: "inherit" });
  if (res.status !== 0) {
    process.stderr.write(`\n[gates] FAILED: ${pretty}\n`);
    process.exit(res.status ?? 1);
  }
}

run("pnpm", ["-s", "typecheck"]);
run("pnpm", ["-s", "test:once"]);
run("node", ["scripts/audit/analyze.mjs"]);

process.stdout.write("\n[gates] OK\n");

