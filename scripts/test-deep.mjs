#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const tiers = {
  fast: [
    { label: "root typecheck", cmd: "pnpm", args: ["typecheck"] },
    { label: "root vitest", cmd: "pnpm", args: ["test:once"] },
    { label: "admin typecheck", cmd: "pnpm", args: ["--filter", "admin", "typecheck"] },
  ],
  surfaces: [
    { label: "admin vitest", cmd: "pnpm", args: ["--filter", "admin", "test"] },
  ],
  e2e: [
    { label: "web smoke e2e", cmd: "pnpm", args: ["--filter", "web", "exec", "playwright", "test", "tests/smoke.spec.ts"] },
  ],
  build: [
    { label: "web build", cmd: "pnpm", args: ["build:web"] },
    { label: "admin build", cmd: "pnpm", args: ["build:admin"] },
  ],
  optional: [
    { label: "web upload e2e", cmd: "pnpm", args: ["--filter", "web", "exec", "playwright", "test", "tests/projects-upload.spec.ts"] },
  ],
};

const compositeTiers = {
  deep: ["fast", "surfaces", "e2e"],
  exhaustive: ["deep", "build", "optional"],
};

const supportedTargets = [
  ...Object.keys(tiers),
  ...Object.keys(compositeTiers),
];

function usage() {
  process.stderr.write(
    `Usage: node scripts/test-deep.mjs <${supportedTargets.join("|")}> [--dry-run]\n`,
  );
  process.exit(1);
}

function isKnownTarget(value) {
  return supportedTargets.includes(value);
}

function flattenTarget(target) {
  if (tiers[target]) {
    return tiers[target];
  }

  return compositeTiers[target].flatMap((entry) => flattenTarget(entry));
}

function renderCommand(step) {
  return [step.cmd, ...step.args].join(" ");
}

function runStep(step, dryRun) {
  const pretty = renderCommand(step);
  process.stdout.write(`\n[test:deep] ${step.label}\n[test:deep] $ ${pretty}\n`);

  if (dryRun) {
    return;
  }

  const result = spawnSync(step.cmd, step.args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.stderr.write(`\n[test:deep] FAILED at ${step.label}\n`);
    process.exit(result.status ?? 1);
  }
}

const [, , target, ...rest] = process.argv;
if (!target || !isKnownTarget(target)) {
  usage();
}

const dryRun = rest.includes("--dry-run");
const unknownArgs = rest.filter((arg) => arg !== "--dry-run");
if (unknownArgs.length > 0) {
  usage();
}

for (const step of flattenTarget(target)) {
  runStep(step, dryRun);
}

process.stdout.write(`\n[test:deep] ${target} OK${dryRun ? " (dry run)" : ""}\n`);
