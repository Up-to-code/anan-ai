import type { DocsPageDefinition } from "../types";

/**
 * WHY:   Most incidents are authorization and logical correctness failures, not syntax errors.
 * WHAT:  Defines the Security & AuthZ handbook page (curated mirror of `docs/handbook/security/**`).
 * HOW:   Summarizes required guard patterns, common failure modes, and where to find deeper checklists.
 */
export const securityPage: DocsPageDefinition = {
  key: "security",
  eyebrow: "Safety first",
  title: "Security & Authorization (AuthZ)",
  summary: "Rules and checklists to prevent permission bugs, ownership leaks, and scale correctness traps.",
  intro: [
    "Security bugs in this repo are usually logic bugs: missing permission checks, role confusion, ownership drift, and unsafe scans.",
    "Use this page as the in-app quick reference, then read the deep markdown handbook for full detail.",
  ],
  sections: [
    {
      title: "Required guard stack (Convex)",
      codeBlock: {
        label: "Canonical helpers",
        code: [
          "convex/_core/security/identity.ts",
          "convex/_core/security/accessPolicy.ts",
          "CONVEX_RULES.md (AuthZ checklist)",
        ].join("\n"),
      },
    },
    {
      title: "AuthZ checklist (must pass)",
      bullets: [
        "Authentication: unauthenticated callers must fail early unless explicitly public.",
        "Role gate: reject-by-default if role is unknown; do not guess.",
        "Row ownership: verify every input id belongs to the caller’s resolved owner context.",
        "State prerequisites: verify prior state and reject repeated transitions.",
        "Least privilege: return stable projections, not raw rows, and avoid leaking PII.",
      ],
    },
    {
      title: "Scale correctness traps",
      bullets: [
        "Avoid `collect()` on tables that can grow.",
        "Avoid `take(N)` as a fake directory lookup (breaks correctness after growth).",
        "Prefer summary queries over list-then-reduce aggregations.",
      ],
    },
    {
      title: "Read more (deep markdown)",
      codeBlock: {
        label: "Canonical deep references",
        code: [
          "docs/handbook/security/README.md",
          "docs/handbook/security/authorization.md",
          "docs/handbook/security/test-invariants.md",
          "docs/handbook/security/github.md",
        ].join("\n"),
      },
    },
  ],
  related: ["convex", "data", "workflow"],
};

